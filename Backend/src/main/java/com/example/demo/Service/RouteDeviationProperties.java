package com.example.demo.Service;

public class RouteDeviationProperties {
    private double warningDistanceMeters = 100.0;
    private double criticalDistanceMeters = 300.0;

    public double getWarningDistanceMeters() {
        return warningDistanceMeters;
    }

    public void setWarningDistanceMeters(double warningDistanceMeters) {
        this.warningDistanceMeters = warningDistanceMeters;
    }

    public double getCriticalDistanceMeters() {
        return criticalDistanceMeters;
    }

    public void setCriticalDistanceMeters(double criticalDistanceMeters) {
        this.criticalDistanceMeters = criticalDistanceMeters;
    }
}
