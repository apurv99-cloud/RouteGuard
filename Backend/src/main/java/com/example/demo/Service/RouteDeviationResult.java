package com.example.demo.Service;

public class RouteDeviationResult {
    private double distanceFromRoute;
    private boolean deviating;
    private String riskLevel;
    private String status;
    private String message;

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

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
