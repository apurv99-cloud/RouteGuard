package com.example.demo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "routeguard")
public class RouteGuardProperties {
    private double warningDistanceMeters = 100.0;
    private double criticalDistanceMeters = 300.0;
    private long gpsStaleSeconds = 180L;
    private long alertCooldownSeconds = 300L;
    private int gpsUpdateIntervalMs = 3000;

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

    public long getGpsStaleSeconds() {
        return gpsStaleSeconds;
    }

    public void setGpsStaleSeconds(long gpsStaleSeconds) {
        this.gpsStaleSeconds = gpsStaleSeconds;
    }

    public long getAlertCooldownSeconds() {
        return alertCooldownSeconds;
    }

    public void setAlertCooldownSeconds(long alertCooldownSeconds) {
        this.alertCooldownSeconds = alertCooldownSeconds;
    }

    public int getGpsUpdateIntervalMs() {
        return gpsUpdateIntervalMs;
    }

    public void setGpsUpdateIntervalMs(int gpsUpdateIntervalMs) {
        this.gpsUpdateIntervalMs = gpsUpdateIntervalMs;
    }
}
