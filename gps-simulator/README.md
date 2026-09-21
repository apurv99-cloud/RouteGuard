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

Normal mode first calls:

```text
GET http://localhost:8080/api/trucks/TRUCK-001
```

It reads `truck.trip.polyline`, which is currently stored as
`latitude,longitude|latitude,longitude|...`, and sends each point sequentially
to:

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

## Phase 2 controlled deviation mode

Deviation mode follows the real persisted route, gradually offsets telemetry
perpendicular to a local route segment, holds the maximum offset, then returns
toward the route:

```powershell
python .\gps-simulator\simulate_gps.py GPS-TEST-1 `
  --mode deviation `
  --interval 2 `
  --deviation-distance 500 `
  --deviation-duration 30
```

Available controls:

- `--deviation-start`: fraction of the route to follow before leaving it
- `--deviation-distance`: maximum offset in meters
- `--deviation-duration`: seconds at maximum offset

The simulator does not assign `deviating`, `riskLevel`, alerts, or status. It
only sends GPS coordinates and prints those values from the backend response.
