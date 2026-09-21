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

        List<double[]> routePoints = decodePolyline(trip.getPolyline());
        if (routePoints.size() >= 2) {
            return distanceToRouteSegments(routePoints, latitude, longitude);
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

    private double distanceToRouteSegments(List<double[]> routePoints, double latitude, double longitude) {
        double minimumDistance = Double.POSITIVE_INFINITY;
        for (int index = 1; index < routePoints.size(); index++) {
            double[] start = routePoints.get(index - 1);
            double[] end = routePoints.get(index);
            minimumDistance = Math.min(
                    minimumDistance,
                    distanceToSegmentMeters(start[0], start[1], end[0], end[1], latitude, longitude));
        }
        return Double.isFinite(minimumDistance) ? minimumDistance : 0.0;
    }

    private double distanceToSegmentMeters(
            double startLat,
            double startLon,
            double endLat,
            double endLon,
            double pointLat,
            double pointLon) {
        double scale = 111_320.0;
        double referenceLatitude = Math.toRadians(pointLat);
        double startX = Math.toRadians(startLon) * Math.cos(referenceLatitude) * scale;
        double startY = Math.toRadians(startLat) * scale;
        double endX = Math.toRadians(endLon) * Math.cos(referenceLatitude) * scale;
        double endY = Math.toRadians(endLat) * scale;
        double pointX = Math.toRadians(pointLon) * Math.cos(referenceLatitude) * scale;
        double pointY = Math.toRadians(pointLat) * scale;

        double segmentX = endX - startX;
        double segmentY = endY - startY;
        double segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;
        double projection = segmentLengthSquared == 0.0
                ? 0.0
                : ((pointX - startX) * segmentX + (pointY - startY) * segmentY) / segmentLengthSquared;
        double clampedProjection = Math.max(0.0, Math.min(1.0, projection));
        double nearestX = startX + clampedProjection * segmentX;
        double nearestY = startY + clampedProjection * segmentY;
        return Math.hypot(pointX - nearestX, pointY - nearestY);
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
        boolean rawCoordinates = parts.length >= 2;
        if (rawCoordinates) {
            for (String part : parts) {
                try {
                    String[] coords = part.split(",");
                    if (coords.length != 2) {
                        rawCoordinates = false;
                        break;
                    }
                    points.add(new double[] {Double.parseDouble(coords[0]), Double.parseDouble(coords[1])});
                } catch (NumberFormatException exception) {
                    rawCoordinates = false;
                    break;
                }
            }
            if (rawCoordinates && points.size() >= 2) {
                return points;
            }
            points.clear();
        }

        int index = 0;
        int latitude = 0;
        int longitude = 0;
        while (index < polyline.length()) {
            int[] latitudeResult = decodeComponent(polyline, index);
            latitude += latitudeResult[0];
            index = latitudeResult[1];

            int[] longitudeResult = decodeComponent(polyline, index);
            longitude += longitudeResult[0];
            index = longitudeResult[1];
            points.add(new double[] {latitude / 100000.0, longitude / 100000.0});
        }
        return points;
    }

    private int[] decodeComponent(String encoded, int startIndex) {
        int result = 0;
        int shift = 0;
        int index = startIndex;
        int value;
        do {
            if (index >= encoded.length()) {
                throw new IllegalArgumentException("Invalid encoded route polyline");
            }
            value = encoded.charAt(index++) - 63;
            result |= (value & 0x1f) << shift;
            shift += 5;
        } while (value >= 0x20);
        int decoded = (result & 1) == 1 ? ~(result >> 1) : result >> 1;
        return new int[] {decoded, index};
    }
}