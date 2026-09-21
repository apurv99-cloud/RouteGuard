package com.example.demo.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.Entity.GPS;
import com.example.demo.Entity.Trip;
import com.example.demo.Entity.TripStatus;
import com.example.demo.Entity.Truck;
import com.example.demo.Entity.DTO.GpsRequest;
import com.example.demo.Entity.DTO.GpsUpdateResponse;
import com.example.demo.Repository.GPSRepo;
import com.example.demo.Repository.TripRepo;
import com.example.demo.Repository.TruckRepo;
import com.example.demo.config.RouteGuardProperties;

@Service
public class GPSService {

    private final TripRepo tripRepo;
    private final GPSRepo gpsRepo;
    private final TruckRepo truckRepo;
    private final RouteDeviationService routeDeviationService;
    private final RiskCalculationService riskCalculationService;
    private final AlertService alertService;
    private final RouteGuardProperties routeGuardProperties;

    public GPSService(
            TripRepo tripRepo,
            GPSRepo gpsRepo,
            TruckRepo truckRepo,
            RouteDeviationService routeDeviationService,
            RiskCalculationService riskCalculationService,
            AlertService alertService,
            RouteGuardProperties routeGuardProperties) {
        this.tripRepo = tripRepo;
        this.gpsRepo = gpsRepo;
        this.truckRepo = truckRepo;
        this.routeDeviationService = routeDeviationService;
        this.riskCalculationService = riskCalculationService;
        this.alertService = alertService;
        this.routeGuardProperties = routeGuardProperties;
    }

    public GpsUpdateResponse processGps(GpsRequest request) {
        if (request == null || request.getTruckId() == null || request.getTruckId().isBlank()) {
            throw new IllegalArgumentException("Truck ID is required");
        }
        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new IllegalArgumentException("GPS latitude and longitude are required");
        }
        if (!isValidCoordinate(request.getLatitude(), request.getLongitude())) {
            throw new IllegalArgumentException("Invalid GPS coordinates");
        }

        Truck truck = truckRepo.findById(request.getTruckId())
                .orElseThrow(() -> new IllegalArgumentException("Truck not found with id: " + request.getTruckId()));

        Trip trip = truck.getTrip();
        if (trip == null) {
            throw new IllegalArgumentException("Truck has no assigned trip");
        }

        if (trip.getStatus() == TripStatus.COMPLETED || trip.getStatus() == TripStatus.CANCELLED) {
            throw new IllegalArgumentException("Trip is not active for GPS updates");
        }

        LocalDateTime timestamp = request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now();

        RouteDeviationResult deviation = routeDeviationService.evaluate(trip, request.getLatitude(), request.getLongitude());
        String riskLevel = riskCalculationService.calculateRiskLevel(
                deviation.getDistanceFromRoute(),
                0L,
                trip.getStatus() != null ? trip.getStatus().name() : "ACTIVE",
                request.getSpeedKmh());

        if (deviation.isDeviating()) {
            trip.setDeviationCounter(trip.getDeviationCounter() + 1);
            trip.setStatus(TripStatus.DEVIATED);
            truck.setDeviation(true);
            truck.setRiskLevel(riskLevel);
            truck.setStatus("DEVIATED");
            if (deviation.getDistanceFromRoute() >= routeGuardProperties.getCriticalDistanceMeters()) {
                alertService.createAlert(
                        truck.getTruckId(),
                        trip.getId(),
                        "ROUTE_DEVIATION",
                        "CRITICAL",
                        request.getLatitude(),
                        request.getLongitude(),
                        deviation.getDistanceFromRoute(),
                        "Truck moved significantly away from its planned route." );
            }
        } else {
            trip.setStatus(TripStatus.ACTIVE);
            truck.setDeviation(false);
            truck.setStatus("ACTIVE");
            truck.setRiskLevel(riskLevel);
        }

        trip.setLastLocationLat(request.getLatitude());
        trip.setLastLocationLon(request.getLongitude());
        trip.setDistanceM(deviation.getDistanceFromRoute());
        trip.setRiskScore(riskLevelToScore(riskLevel));

        truck.setCurrentLatitude(request.getLatitude());
        truck.setCurrentLongitude(request.getLongitude());
        truck.setDistanceFromRoute(deviation.getDistanceFromRoute());
        truck.setLastGpsTimestamp(timestamp);
        truck.setRiskLevel(riskLevel);

        GPS log = new GPS();
        log.setLatitude(request.getLatitude());
        log.setLongitude(request.getLongitude());
        log.setTimestamp(timestamp);
        log.setSpeedKmh(request.getSpeedKmh());
        log.setDistanceFromRoute(deviation.getDistanceFromRoute());
        log.setDeviationStatus(deviation.isDeviating() ? "DEVIATED" : "NORMAL");
        log.setRiskLevel(riskLevel);
        log.setTrip(trip);
        log.setTruck(truck);
        gpsRepo.save(log);

        tripRepo.save(trip);
        truckRepo.save(truck);

        GpsUpdateResponse response = new GpsUpdateResponse();
        response.setTruckId(truck.getTruckId());
        response.setTripId(trip.getId());
        response.setStatus(trip.getStatus().name());
        response.setRiskLevel(riskLevel);
        response.setDistanceFromRoute(deviation.getDistanceFromRoute());
        response.setDeviating(deviation.isDeviating());
        response.setLastUpdated(timestamp);
        response.setMessage(deviation.getMessage());
        return response;
    }

    public GpsUpdateResponse processGps(Long tripId, Double lat, Double lon) {
        Trip trip = tripRepo.findById(tripId).orElseThrow(() -> new IllegalArgumentException("Trip not found with id: " + tripId));
        Truck truck = truckRepo.findAll().stream()
                .filter(t -> trip.equals(t.getTrip()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No truck assigned to trip: " + tripId));

        GpsRequest request = new GpsRequest();
        request.setTruckId(truck.getTruckId());
        request.setLatitude(lat);
        request.setLongitude(lon);
        request.setTimestamp(LocalDateTime.now());
        return processGps(request);
    }

    public List<GPS> getGpsHistoryForTruck(String truckId) {
        return gpsRepo.findAll().stream()
                .filter(gps -> gps.getTruck() != null && gps.getTruck().getTruckId().equals(truckId))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .toList();
    }

    public void completeTrip(Long id) {
        Trip trip = tripRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Trip not found with id: " + id));
        trip.setStatus(TripStatus.COMPLETED);
        tripRepo.save(trip);

        truckRepo.findAll().stream()
                .filter(t -> trip.equals(t.getTrip()))
                .forEach(truck -> {
                    truck.setStatus("COMPLETED");
                    truck.setRiskLevel("NORMAL");
                    truck.setDeviation(false);
                    truckRepo.save(truck);
                });
    }

    private boolean isValidCoordinate(double latitude, double longitude) {
        return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    }

    private int riskLevelToScore(String riskLevel) {
        if (riskLevel == null) {
            return 0;
        }
        return switch (riskLevel.toUpperCase()) {
            case "NORMAL" -> 10;
            case "LOW" -> 25;
            case "MEDIUM" -> 50;
            case "HIGH" -> 75;
            case "CRITICAL" -> 95;
            default -> 0;
        };
    }
}
