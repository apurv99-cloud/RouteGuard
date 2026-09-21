package com.example.demo.Service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.Entity.Trip;
import com.example.demo.config.RouteGuardProperties;

@Service
public class RouteDeviationService {

    private final RouteGuardProperties properties;

    public RouteDeviationService() {
        this(new RouteGuardProperties());
    }

    public RouteDeviationService(RouteGuardProperties properties) {
        this.properties = properties;
    }

    public RouteDeviationService(RouteDeviationProperties properties) {
        this(new RouteGuardProperties());
        this.properties.setWarningDistanceMeters(properties.getWarningDistanceMeters());
        this.properties.setCriticalDistanceMeters(properties.getCriticalDistanceMeters());
    }

    public RouteDeviationResult evaluate(Trip trip, double latitude, double longitude) {
        double distance = calculateDistanceFromRoute(trip, latitude, longitude);
        String riskLevel = "NORMAL";
        boolean deviating = false;
        String status = "NORMAL";
        String message = "Truck is on route";

        if (distance >= properties.getCriticalDistanceMeters()) {
            riskLevel = "CRITICAL";
            deviating = true;
            status = "DEVIATED";
            message = "Truck is far outside the planned route";
        } else if (distance >= properties.getWarningDistanceMeters()) {
            riskLevel = "HIGH";
            deviating = true;
            status = "WARNING";
            message = "Truck is drifting away from the planned route";
        } else if (distance > 25) {
            riskLevel = "LOW";
            status = "NORMAL";
            message = "Truck is slightly offset from route";
        }

        RouteDeviationResult result = new RouteDeviationResult();
        result.setDistanceFromRoute(distance);
        result.setDeviating(deviating);
        result.setRiskLevel(riskLevel);
        result.setStatus(status);
        result.setMessage(message);
        return result;
    }

    private double calculateDistanceFromRoute(Trip trip, double latitude, double longitude) {
        if (trip == null || trip.getOriginLat() == null || trip.getOriginLon() == null || trip.getDestLat() == null || trip.getDestLon() == null) {
            return 0.0;
        }

        double originLat = trip.getOriginLat();
        double originLon = trip.getOriginLon();
        double destLat = trip.getDestLat();
        double destLon = trip.getDestLon();

        double a = haversineKm(originLat, originLon, latitude, longitude);
        double b = haversineKm(latitude, longitude, destLat, destLon);
        double c = haversineKm(originLat, originLon, destLat, destLon);

        if (c == 0) {
            return 0.0;
        }

        double p = (a + b + c) / 2.0;
        double triangleArea = Math.sqrt(Math.max(0, p * (p - a) * (p - b) * (p - c)));
        double heightKm = (2 * triangleArea) / c;
        return heightKm * 1000.0;
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double lat1R = Math.toRadians(lat1);
        double lat2R = Math.toRadians(lat2);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1R) * Math.cos(lat2R) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public List<double[]> decodePolyline(String polyline) {
        List<double[]> points = new ArrayList<>();
        if (polyline == null || polyline.isBlank()) {
            return points;
        }
        String[] parts = polyline.split("\\|");
        for (String part : parts) {
            if (part == null || part.isBlank()) {
                continue;
            }
            try {
                String[] coords = part.split(",");
                if (coords.length == 2) {
                    points.add(new double[] {Double.parseDouble(coords[0]), Double.parseDouble(coords[1])});
                }
            } catch (Exception ignored) {
            }
        }
        return points;
    }
}