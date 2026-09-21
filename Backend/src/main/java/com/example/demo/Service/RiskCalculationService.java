package com.example.demo.Service;

import org.springframework.stereotype.Service;

@Service
public class RiskCalculationService {

    public String calculateRiskLevel(double distanceFromRouteMeters, long secondsSinceLastGps, String tripStatus, Double speedKmh) {
        if (distanceFromRouteMeters >= 300) {
            return "CRITICAL";
        }
        if (distanceFromRouteMeters >= 100) {
            return "HIGH";
        }
        if (secondsSinceLastGps > 180 || (speedKmh != null && speedKmh > 90)) {
            return "MEDIUM";
        }
        if ("DEVIATED".equalsIgnoreCase(tripStatus)) {
            return "HIGH";
        }
        if (distanceFromRouteMeters > 25) {
            return "LOW";
        }
        return "NORMAL";
    }
}
