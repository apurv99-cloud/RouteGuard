package com.example.demo.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Entity.Trip;
import com.example.demo.Entity.Truck;
import com.example.demo.Repository.TripRepo;
import com.example.demo.Repository.TruckRepo;

@RestController
@RequestMapping("/api")
public class FleetController {
    private final TruckRepo truckRepo;
    private final TripRepo tripRepo;

    public FleetController(TruckRepo truckRepo, TripRepo tripRepo) {
        this.truckRepo = truckRepo;
        this.tripRepo = tripRepo;
    }

    @GetMapping("/fleet/summary")
    public ResponseEntity<Map<String, Object>> summary() {
        List<Truck> trucks = truckRepo.findAll();
        List<Trip> trips = tripRepo.findAll();

        Map<String, Object> response = new HashMap<>();
        response.put("totalTrucks", trucks.size());
        response.put("activeTrucks", trucks.stream().filter(t -> "ACTIVE".equalsIgnoreCase(t.getStatus()) || "ONGOING".equalsIgnoreCase(t.getStatus()) || "DEVIATED".equalsIgnoreCase(t.getStatus())).count());
        response.put("normalTrucks", trucks.stream().filter(t -> "NORMAL".equalsIgnoreCase(t.getRiskLevel()) || "LOW".equalsIgnoreCase(t.getRiskLevel())).count());
        response.put("warningTrucks", trucks.stream().filter(t -> "MEDIUM".equalsIgnoreCase(t.getRiskLevel()) || "HIGH".equalsIgnoreCase(t.getRiskLevel())).count());
        response.put("deviatedTrucks", trucks.stream().filter(t -> t.isDeviation() || "DEVIATED".equalsIgnoreCase(t.getStatus())).count());
        response.put("highRiskTrucks", trucks.stream().filter(t -> "HIGH".equalsIgnoreCase(t.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(t.getRiskLevel())).count());
        response.put("activeTrips", trips.stream().filter(t -> t.getStatus() != null && ("ACTIVE".equalsIgnoreCase(t.getStatus().name()) || "ONGOING".equalsIgnoreCase(t.getStatus().name()) || "DEVIATED".equalsIgnoreCase(t.getStatus().name()))).count());
        response.put("completedTrips", trips.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus().name())).count());
        response.put("trucks", trucks.stream().map(this::serializeTruck).collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> serializeTruck(Truck truck) {
        Map<String, Object> map = new HashMap<>();
        map.put("truckId", truck.getTruckId());
        map.put("id", truck.getTruckId());
        map.put("pilotName", truck.getPilotName());
        map.put("driver", truck.getPilotName());
        map.put("status", truck.getStatus());
        map.put("riskLevel", truck.getRiskLevel());
        map.put("deviation", truck.isDeviation());
        map.put("currentLatitude", truck.getCurrentLatitude());
        map.put("currentLongitude", truck.getCurrentLongitude());
        map.put("distanceFromRoute", truck.getDistanceFromRoute());
        map.put("lastGpsTimestamp", truck.getLastGpsTimestamp());
        if (truck.getTrip() != null) {
            Trip trip = truck.getTrip();
            map.put("tripId", trip.getId());
            map.put("routeId", trip.getId());
            map.put("originLat", trip.getOriginLat());
            map.put("originLon", trip.getOriginLon());
            map.put("destLat", trip.getDestLat());
            map.put("destLon", trip.getDestLon());
            map.put("durationS", trip.getDurationS());
            map.put("polyline", trip.getPolyline());
            map.put("lastLocationLat", trip.getLastLocationLat());
            map.put("lastLocationLon", trip.getLastLocationLon());
            map.put("tripStatus", trip.getStatus());
            map.put("riskScore", trip.getRiskScore());
        }
        return map;
    }
}
