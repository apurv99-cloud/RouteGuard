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
from datetime import datetime
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

    return decode_polyline(polyline)


def simulate(base_url: str, truck_id: str, interval: float) -> None:
    if interval <= 0:
        raise ValueError("--interval must be greater than zero")

    route = assigned_route(base_url, truck_id)
    gps_url = f"{base_url.rstrip('/')}/gps"
    previous_point: tuple[float, float] | None = None

    print(f"Truck: {truck_id}")
    print("Mode: NORMAL")
    print(f"Assigned route points: {len(route)}")

    for latitude, longitude in route:
        speed_kmh = 0.0
        if previous_point is not None:
            speed_kmh = distance_km(previous_point, (latitude, longitude)) / (interval / 3600)

        timestamp = datetime.now().replace(microsecond=0).isoformat()
        payload = {
            "truckId": truck_id,
            "latitude": latitude,
            "longitude": longitude,
            "timestamp": timestamp,
            "speedKmh": round(speed_kmh, 2),
        }
        status, response = post_json(gps_url, payload)
        print(
            f"Latitude: {latitude:.6f} | Longitude: {longitude:.6f} | "
            f"Speed: {speed_kmh:.2f} km/h | Timestamp: {timestamp} | "
            f"HTTP Status: {status}"
        )
        if isinstance(response, dict):
            print(
                f"Backend: status={response.get('status')} "
                f"risk={response.get('riskLevel')} "
                f"deviating={response.get('deviating')} "
                f"distanceFromRoute={response.get('distanceFromRoute')}"
            )

        previous_point = (latitude, longitude)
        time.sleep(interval)


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
    return parser.parse_args()


if __name__ == "__main__":
    try:
        arguments = parse_args()
        simulate(arguments.base_url, arguments.truck_id, arguments.interval)
    except KeyboardInterrupt:
        print("\nSimulator stopped.")
    except (RuntimeError, ValueError, json.JSONDecodeError) as error:
        print(f"Simulator error: {error}", file=sys.stderr)
        sys.exit(1)
