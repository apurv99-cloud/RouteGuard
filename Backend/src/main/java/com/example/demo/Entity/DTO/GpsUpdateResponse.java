package com.example.demo.Entity.DTO;

import java.time.LocalDateTime;

public class GpsUpdateResponse {
    private String truckId;
    private Long tripId;
    private String status;
    private String riskLevel;
    private double distanceFromRoute;
    private boolean deviating;
    private LocalDateTime lastUpdated;
    private String message;

    public String getTruckId() {
        return truckId;
    }

    public void setTruckId(String truckId) {
        this.truckId = truckId;
    }

    public Long getTripId() {
        return tripId;
    }

    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public double getDistanceFromRoute() {
        return distanceFromRoute;
    }

    public void setDistanceFromRoute(double distanceFromRoute) {
        this.distanceFromRoute = distanceFromRoute;
    }

    public boolean isDeviating() {
        return deviating;
    }

    public void setDeviating(boolean deviating) {
        this.deviating = deviating;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
