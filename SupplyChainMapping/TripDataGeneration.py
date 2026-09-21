import requests
import random
import csv

BASE_URL = "http://127.0.0.1:5000/route/v1/driving"

MIN_LAT, MAX_LAT = 28.35, 28.90
MIN_LON, MAX_LON = 76.80, 77.60


def random_point():
    return (
        random.uniform(MIN_LAT, MAX_LAT),
        random.uniform(MIN_LON, MAX_LON)
    )

def fetch_route(lat1, lon1, lat2, lon2):
    url = (
        f"{BASE_URL}/"
        f"{lon1},{lat1};"
        f"{lon2},{lat2}"
        "?overview=full&geometries=polyline"
    )

    r = requests.get(url, timeout=5)
    data = r.json()

    if data.get("code") == "Ok":
        route = data["routes"][0]
        return route["distance"], route["duration"], route["geometry"]

    return None


with open("trip_data.csv", "w", newline="") as f:
    writer = csv.writer(f)

    writer.writerow([
        "route_id",
        "origin_lat", "origin_lon",
        "dest_lat", "dest_lon",
        "distance_m", "duration_s",
        "polyline"
    ])

    for i in range(1000):
        lat1, lon1 = random_point()
        lat2, lon2 = random_point()

        result = fetch_route(lat1, lon1, lat2, lon2)

        if result:
            distance, duration, polyline = result

            writer.writerow([
                i + 1,
                lat1, lon1,
                lat2, lon2,
                distance,
                duration,
                polyline  # this is your encoded polyline
            ])

        if (i + 1) % 100 == 0:
            print(f"Processed {i + 1} routes")

print("Done")