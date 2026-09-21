"""Development-only GPS device simulator for RouteGuard.

The simulator deliberately contains no route, deviation, risk, or alert logic.
It reads the assigned trip and persisted polyline from the running backend and
posts the route coordinates as GPS telemetry.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
import time
from datetime import datetime, timedelta
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def fetch_json(url: str) -> Any:
    request = Request(url, headers={"Accept": "application/json"})
    try:
        with urlopen(request, timeout=15) as response:
            body = response.read().decode("utf-8")
            return json.loads(body)
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GET {url} failed with HTTP {error.code}: {detail}") from error
    except URLError as error:
        raise RuntimeError(f"GET {url} failed: {error.reason}") from error


def post_json(url: str, payload: dict[str, Any]) -> tuple[int, Any]:
    body = json.dumps(payload).encode("utf-8")
    request = Request(
        url,
        data=body,
        method="POST",
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    )
    try:
        with urlopen(request, timeout=15) as response:
            response_body = response.read().decode("utf-8")
            return response.status, json.loads(response_body) if response_body else None
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"POST {url} failed with HTTP {error.code}: {detail}") from error
    except URLError as error:
        raise RuntimeError(f"POST {url} failed: {error.reason}") from error


def decode_polyline(encoded: str) -> list[tuple[float, float]]:
    """Decode a Google/OSRM encoded polyline into (latitude, longitude) pairs."""
    coordinates: list[tuple[float, float]] = []
    index = 0
    latitude = 0
    longitude = 0

    while index < len(encoded):
        latitude_delta, index = decode_component(encoded, index)
        longitude_delta, index = decode_component(encoded, index)
        latitude += latitude_delta
        longitude += longitude_delta
        coordinates.append((latitude / 100000.0, longitude / 100000.0))

    if len(coordinates) < 2:
        raise ValueError("The assigned trip polyline contains fewer than two coordinates")
    return coordinates


def parse_route_geometry(value: str) -> list[tuple[float, float]]:
    """Read the persisted route format used by the current Trip entity.

    Current seeded trips store points as `latitude,longitude|...`. The encoded
    polyline fallback keeps this simulator compatible with trips produced by
    an OSRM encoded-polyline pipeline.
    """
    if "|" in value:
        raw_points = value.split("|")
        try:
            coordinates = [
                (float(parts[0]), float(parts[1]))
                for point in raw_points
                for parts in [point.split(",")]
                if len(parts) == 2
            ]
        except ValueError:
            coordinates = []
        if len(coordinates) == len(raw_points) and len(coordinates) >= 2:
            return coordinates
    return decode_polyline(value)


def decode_component(encoded: str, index: int) -> tuple[int, int]:
    result = 0
    shift = 0

    while True:
        if index >= len(encoded):
            raise ValueError("Invalid or truncated encoded polyline")
        byte = ord(encoded[index]) - 63
        index += 1
        result |= (byte & 0x1F) << shift
        shift += 5
        if byte < 0x20:
            break

    value = ~(result >> 1) if result & 1 else result >> 1
    return value, index


def distance_km(first: tuple[float, float], second: tuple[float, float]) -> float:
    earth_radius_km = 6371.0088
    first_lat, first_lon = map(math.radians, first)
    second_lat, second_lon = map(math.radians, second)
    delta_lat = second_lat - first_lat
    delta_lon = second_lon - first_lon
    haversine = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(first_lat) * math.cos(second_lat) * math.sin(delta_lon / 2) ** 2
    )
    return 2 * earth_radius_km * math.asin(math.sqrt(haversine))


def assigned_route(base_url: str, truck_id: str) -> list[tuple[float, float]]:
    truck = fetch_json(f"{base_url.rstrip('/')}/trucks/{truck_id}")
    trip = truck.get("trip") if isinstance(truck, dict) else None
    if not isinstance(trip, dict):
        raise RuntimeError(f"Truck {truck_id} has no assigned trip")

    polyline = trip.get("polyline")
    if not isinstance(polyline, str) or not polyline.strip():
        raise RuntimeError(f"Truck {truck_id}'s assigned trip has no persisted polyline")

    return parse_route_geometry(polyline)


def interpolate(
    first: tuple[float, float], second: tuple[float, float], fraction: float
) -> tuple[float, float]:
    fraction = max(0.0, min(1.0, fraction))
    return (
        first[0] + (second[0] - first[0]) * fraction,
        first[1] + (second[1] - first[1]) * fraction,
    )


def offset_point(
    point: tuple[float, float],
    previous_point: tuple[float, float],
    next_point: tuple[float, float],
    offset_meters: float,
) -> tuple[float, float]:
    """Offset a route point approximately perpendicular to its local segment."""
    latitude, longitude = point
    north_south = next_point[0] - previous_point[0]
    east_west = (next_point[1] - previous_point[1]) * math.cos(math.radians(latitude))
    length = math.hypot(north_south, east_west)
    if length == 0:
        return point

    meters_per_degree_latitude = 111_320.0
    meters_per_degree_longitude = meters_per_degree_latitude * math.cos(math.radians(latitude))
    perpendicular_north = -east_west / length * offset_meters
    perpendicular_east = north_south / length * offset_meters
    return (
        latitude + perpendicular_north / meters_per_degree_latitude,
        longitude + perpendicular_east / meters_per_degree_longitude,
    )


def send_point(
    gps_url: str,
    truck_id: str,
    point: tuple[float, float],
    previous_point: tuple[float, float] | None,
    interval: float,
    phase: str,
    offset_meters: float,
    timestamp: str | None = None,
    speed_kmh: float | None = None,
) -> tuple[float, float]:
    latitude, longitude = point
    if speed_kmh is None:
        speed_kmh = 0.0
        if previous_point is not None:
            speed_kmh = distance_km(previous_point, point) / (interval / 3600)

    timestamp = timestamp or datetime.now().replace(microsecond=0).isoformat()
    payload = {
        "truckId": truck_id,
        "latitude": latitude,
        "longitude": longitude,
        "timestamp": timestamp,
        "speedKmh": round(speed_kmh, 2),
    }
    status, response = post_json(gps_url, payload)
    print(
        f"[{timestamp}] Truck: {truck_id} | Phase: {phase} | "
        f"Offset: {offset_meters:.1f}m | Lat: {latitude:.6f} | "
        f"Lon: {longitude:.6f} | POST: {status}"
    )
    if isinstance(response, dict):
        print(
            f"Backend response: riskLevel={response.get('riskLevel')} "
            f"deviating={response.get('deviating')} "
            f"distanceFromRoute={response.get('distanceFromRoute')}"
        )
    return point


def simulate_normal(base_url: str, truck_id: str, route: list[tuple[float, float]], interval: float) -> None:
    gps_url = f"{base_url.rstrip('/')}/gps"
    previous_point: tuple[float, float] | None = None
    print(f"Truck: {truck_id}")
    print("Mode: NORMAL")
    print(f"Assigned route points: {len(route)}")
    for point in route:
        previous_point = send_point(gps_url, truck_id, point, previous_point, interval, "ON_ROUTE", 0.0)
        time.sleep(interval)


def simulate_deviation(
    base_url: str,
    truck_id: str,
    route: list[tuple[float, float]],
    interval: float,
    deviation_distance: float,
    deviation_start: float,
    deviation_duration: float,
) -> None:
    if not 0.0 < deviation_start < 1.0:
        raise ValueError("--deviation-start must be between 0 and 1")
    if deviation_distance <= 0:
        raise ValueError("--deviation-distance must be greater than zero")
    if deviation_duration < 0:
        raise ValueError("--deviation-duration cannot be negative")

    gps_url = f"{base_url.rstrip('/')}/gps"
    start_index = max(1, min(len(route) - 2, int(len(route) * deviation_start)))
    previous_point: tuple[float, float] | None = None

    print(f"Truck: {truck_id}")
    print("Mode: DEVIATION")
    print(f"Assigned route points: {len(route)}")
    for point in route[:start_index]:
        previous_point = send_point(gps_url, truck_id, point, previous_point, interval, "ON_ROUTE", 0.0)
        time.sleep(interval)

    previous_route_point = route[start_index - 1]
    route_point = route[start_index]
    next_route_point = route[start_index + 1]
    steps = max(1, int(round(deviation_distance / 25.0)))
    for step in range(1, steps + 1):
        offset = deviation_distance * step / steps
        point = offset_point(route_point, previous_route_point, next_route_point, offset)
        previous_point = send_point(
            gps_url, truck_id, point, previous_point, interval, "DEVIATING", offset
        )
        time.sleep(interval)

    hold_steps = max(1, int(math.ceil(deviation_duration / interval)))
    held_point = offset_point(
        route_point, previous_route_point, next_route_point, deviation_distance
    )
    for _ in range(hold_steps):
        previous_point = send_point(
            gps_url, truck_id, held_point, previous_point, interval, "DEVIATED", deviation_distance
        )
        time.sleep(interval)

    for step in range(steps - 1, -1, -1):
        offset = deviation_distance * step / steps
        point = offset_point(route_point, previous_route_point, next_route_point, offset)
        previous_point = send_point(
            gps_url, truck_id, point, previous_point, interval, "RETURNING", offset
        )
        time.sleep(interval)


def route_point_at(route: list[tuple[float, float]], fraction: float) -> tuple[float, float]:
    if len(route) == 1:
        return route[0]
    position = max(0.0, min(1.0, fraction)) * (len(route) - 1)
    lower = int(position)
    upper = min(lower + 1, len(route) - 1)
    return interpolate(route[lower], route[upper], position - lower)


def simulate_historical(
    base_url: str,
    truck_id: str,
    route: list[tuple[float, float]],
    interval: float,
    days: int,
    points_per_day: int,
    historical_deviation: bool,
) -> None:
    if days <= 0:
        raise ValueError("--days must be greater than zero")
    if points_per_day < 2:
        raise ValueError("--points-per-day must be at least two")

    gps_url = f"{base_url.rstrip('/')}/gps"
    now = datetime.now().replace(microsecond=0)
    total_points = 0
    successful = 0
    failed = 0

    for day_index in range(days):
        simulated_date = (now - timedelta(days=days - day_index)).date()
        start_time = datetime.combine(simulated_date, datetime.min.time()).replace(hour=8)
        end_time = start_time.replace(hour=18)
        day_points = 0
        day_successful = 0
        day_failed = 0
        previous_point: tuple[float, float] | None = None
        previous_timestamp: datetime | None = None

        print(f"Day {day_index + 1}/{days} ({simulated_date.isoformat()})")
        for point_index in range(points_per_day):
            fraction = point_index / (points_per_day - 1)
            route_point = route_point_at(route, fraction)
            offset_meters = 0.0
            phase = "HISTORICAL_ON_ROUTE"

            if historical_deviation and day_index in {2, 4} and 0.35 <= fraction <= 0.65:
                local_index = max(1, min(len(route) - 2, int(fraction * (len(route) - 1))))
                offset_meters = 500.0 * (1.0 - abs(fraction - 0.5) / 0.15)
                offset_meters = max(0.0, offset_meters)
                route_point = offset_point(
                    route[local_index],
                    route[local_index - 1],
                    route[local_index + 1],
                    offset_meters,
                )
                phase = "HISTORICAL_DEVIATION"

            timestamp = start_time + (end_time - start_time) * fraction
            speed_kmh = 0.0
            if previous_point is not None and previous_timestamp is not None:
                elapsed_hours = max((timestamp - previous_timestamp).total_seconds() / 3600, 1e-6)
                speed_kmh = distance_km(previous_point, route_point) / elapsed_hours

            payload_timestamp = timestamp.isoformat()
            try:
                send_point(
                    gps_url,
                    truck_id,
                    route_point,
                    previous_point,
                    interval,
                    phase,
                    offset_meters,
                    timestamp=payload_timestamp,
                    speed_kmh=speed_kmh,
                )
                day_successful += 1
                successful += 1
            except RuntimeError as error:
                day_failed += 1
                failed += 1
                print(f"GPS request failed: {error}", file=sys.stderr)

            day_points += 1
            total_points += 1
            previous_point = route_point
            previous_timestamp = timestamp
            if interval > 0:
                time.sleep(interval)

        print(f"Points: {day_points}")
        print(f"Successful: {day_successful}")
        print(f"Failed: {day_failed}")

    print("Final:")
    print(f"Total points: {total_points}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")


def simulate(
    base_url: str,
    truck_id: str,
    interval: float,
    mode: str,
    deviation_distance: float,
    deviation_start: float,
    deviation_duration: float,
    days: int,
    points_per_day: int,
    historical_deviation: bool,
) -> None:
    if interval <= 0:
        raise ValueError("--interval must be greater than zero")

    route = assigned_route(base_url, truck_id)
    if mode == "normal":
        simulate_normal(base_url, truck_id, route, interval)
    elif mode == "deviation":
        simulate_deviation(
            base_url,
            truck_id,
            route,
            interval,
            deviation_distance,
            deviation_start,
            deviation_duration,
        )
    else:
        simulate_historical(
            base_url,
            truck_id,
            route,
            interval,
            days,
            points_per_day,
            historical_deviation,
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Send the assigned persisted route as GPS telemetry to RouteGuard."
    )
    parser.add_argument("truck_id", help="Existing registered truck ID")
    parser.add_argument(
        "--interval",
        type=float,
        default=2.0,
        help="Seconds between GPS updates (default: 2)",
    )
    parser.add_argument(
        "--base-url",
        default="http://localhost:8080/api",
        help="Backend API base URL (default: http://localhost:8080/api)",
    )
    parser.add_argument(
        "--mode",
        choices=("normal", "deviation", "historical"),
        default="normal",
        help="Telemetry mode (default: normal)",
    )
    parser.add_argument(
        "--deviation-distance",
        type=float,
        default=500.0,
        help="Maximum perpendicular offset in meters (default: 500)",
    )
    parser.add_argument(
        "--deviation-start",
        type=float,
        default=0.25,
        help="Route fraction at which deviation starts (default: 0.25)",
    )
    parser.add_argument(
        "--deviation-duration",
        type=float,
        default=30.0,
        help="Seconds to remain at maximum deviation (default: 30)",
    )
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of previous days for historical mode (default: 7)",
    )
    parser.add_argument(
        "--points-per-day",
        type=int,
        default=100,
        help="GPS points generated per simulated day (default: 100)",
    )
    parser.add_argument(
        "--historical-deviation",
        action="store_true",
        help="Add controlled telemetry offsets on simulated days 3 and 5",
    )
    return parser.parse_args()


if __name__ == "__main__":
    try:
        arguments = parse_args()
        simulate(
            arguments.base_url,
            arguments.truck_id,
            arguments.interval,
            arguments.mode,
            arguments.deviation_distance,
            arguments.deviation_start,
            arguments.deviation_duration,
            arguments.days,
            arguments.points_per_day,
            arguments.historical_deviation,
        )
    except KeyboardInterrupt:
        print("\nSimulator stopped.")
    except (RuntimeError, ValueError, json.JSONDecodeError) as error:
        print(f"Simulator error: {error}", file=sys.stderr)
        sys.exit(1)
