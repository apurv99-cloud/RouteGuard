package com.example.demo.Controller;

import com.example.demo.Entity.Trip;
import com.example.demo.Entity.TripStatus;
import com.example.demo.Repository.TripRepo;
import com.example.demo.Service.MlService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ml")
public class MLController {

    private final MlService mlService;
    private final TripRepo tripRepo;

    public MLController(MlService mlService, TripRepo tripRepo) {
        this.mlService = mlService;
        this.tripRepo = tripRepo;
    }

    // Existing single-trip check (kept)
    @GetMapping("/check/{tripId}")
    public String testML(@PathVariable Long tripId) {
        Trip trip = tripRepo.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        boolean result = mlService.isAnomalous(
                trip.getOriginLat(),
                trip.getOriginLon(),
                trip.getDestLat(),
                trip.getDestLon(),
                trip.getDurationS(),
                trip.getPolyline());

        return "ML says anomaly: " + result;
    }

    // Summary endpoint (basic aggregated data)
    @GetMapping("/summary")
    public Object summary() {
        long total = tripRepo.count();
        long deviated = tripRepo.findAll().stream().filter(t -> t.getStatus() == TripStatus.DEVIATED).count();
        // simple summary map
        return java.util.Map.of(
                "totalTrips", total,
                "deviatedTrips", deviated
        );
    }

    // Return trips classified as anomalies by ML (may be slow)
    @GetMapping("/anomalies")
    public java.util.List<java.util.Map<String, Object>> anomalies() {
        java.util.List<Trip> trips = tripRepo.findAll();
        java.util.List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();

        for (Trip trip : trips) {
            boolean isAnomaly = mlService.isAnomalous(
                    trip.getOriginLat(), trip.getOriginLon(),
                    trip.getDestLat(), trip.getDestLon(),
                    trip.getDurationS(), trip.getPolyline());

            if (isAnomaly) {
                result.add(java.util.Map.of(
                        "id", trip.getId(),
                        "status", trip.getStatus().name(),
                        "isAnomaly", true
                ));
            }
        }

        return result;
    }

    @GetMapping("/deviation/{tripId}")
    public java.util.Map<String, Object> deviation(@PathVariable Long tripId) {
        Trip trip = tripRepo.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        boolean isAnomaly = mlService.isAnomalous(
                trip.getOriginLat(), trip.getOriginLon(),
                trip.getDestLat(), trip.getDestLon(),
                trip.getDurationS(), trip.getPolyline());

        return java.util.Map.of("tripId", tripId, "isAnomaly", isAnomaly);
    }

    // Accept ad-hoc prediction requests with JSON body
    @PostMapping("/predict")
    public java.util.Map<String, Object> predict(@RequestBody java.util.Map<String, Object> body) {
        double originLat = ((Number) body.getOrDefault("origin_lat", 0)).doubleValue();
        double originLon = ((Number) body.getOrDefault("origin_lon", 0)).doubleValue();
        double destLat = ((Number) body.getOrDefault("dest_lat", 0)).doubleValue();
        double destLon = ((Number) body.getOrDefault("dest_lon", 0)).doubleValue();
        double durationS = ((Number) body.getOrDefault("duration_s", 0)).doubleValue();
        String polyline = (String) body.getOrDefault("polyline", "");

        boolean isAnomaly = mlService.isAnomalous(originLat, originLon, destLat, destLon, durationS, polyline);

        return java.util.Map.of("is_anomaly", isAnomaly);
    }
}