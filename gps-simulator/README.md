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

## Phase 3 historical mode

Historical mode sends telemetry for previous calendar days through the same
`POST /api/gps` endpoint. It does not insert database rows directly. The
backend receives the supplied `timestamp` and persists it in `GPS.timestamp`.

Small smoke test:

```powershell
python .\gps-simulator\simulate_gps.py GPS-TEST-1 `
  --mode historical `
  --days 2 `
  --points-per-day 10 `
  --interval 0.1
```

Default seven-day run:

```powershell
python .\gps-simulator\simulate_gps.py GPS-TEST-1 `
  --mode historical `
  --days 7 `
  --points-per-day 100 `
  --interval 0.1
```

Optional controlled historical deviation on simulated days 3 and 5:

```powershell
python .\gps-simulator\simulate_gps.py GPS-TEST-1 `
  --mode historical `
  --days 7 `
  --points-per-day 100 `
  --historical-deviation `
  --interval 0.1
```

Historical timestamps are distributed from 08:00 through 18:00 on each
simulated date. The simulator prints successful and failed request counts and
backend response values. Risk and deviation remain entirely backend-owned.
