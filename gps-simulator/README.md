# RouteGuard GPS simulator (Phase 1)

This development-only simulator behaves like an external GPS device. It does
not calculate deviation, risk, alerts, or predictions.

Before starting it:

1. Start Spring Boot on port `8080`.
2. Register a truck and assign it a trip with a persisted route polyline.

Run it from the repository root:

```powershell
python .\gps-simulator\simulate_gps.py TRUCK-001 --interval 2
```

The simulator first calls:

```text
GET http://localhost:8080/api/trucks/TRUCK-001
```

It reads `truck.trip.polyline`, decodes the persisted route coordinates, and
then sends each point sequentially to:

```text
POST http://localhost:8080/api/gps
```

Example payload:

```json
{
  "truckId": "TRUCK-001",
  "latitude": 28.6139,
  "longitude": 77.209,
  "timestamp": "2026-09-21T14:46:20",
  "speedKmh": 32.5
}
```

The payload fields match `GpsRequest`. The backend remains responsible for
route deviation, risk, alerts, persistence, and dashboard state.
