package com.example.demo.Entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "trucks")
public class Truck {
    @Id
    private String truckId;

    private String pilotName;
    private String status = "PLANNED";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    private Double currentLatitude;
    private Double currentLongitude;

    @Column(name = "last_gps_timestamp")
    private LocalDateTime lastGpsTimestamp;

    @Column(name = "distance_from_route")
    private Double distanceFromRoute = 0.0;

    @Column(name = "risk_level")
    private String riskLevel = "NORMAL";

    @Column(name = "deviation_flag")
    private boolean deviation = false;

    public String getTruckId() {
        return truckId;
    }

    public void setTruckId(String truckId) {
        this.truckId = truckId;
    }

    public String getPilotName() {
        return pilotName;
    }

    public void setPilotName(String pilotName) {
        this.pilotName = pilotName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public Double getCurrentLatitude() {
        return currentLatitude;
    }

    public void setCurrentLatitude(Double currentLatitude) {
        this.currentLatitude = currentLatitude;
    }

    public Double getCurrentLongitude() {
        return currentLongitude;
    }

    public void setCurrentLongitude(Double currentLongitude) {
        this.currentLongitude = currentLongitude;
    }

    public LocalDateTime getLastGpsTimestamp() {
        return lastGpsTimestamp;
    }

    public void setLastGpsTimestamp(LocalDateTime lastGpsTimestamp) {
        this.lastGpsTimestamp = lastGpsTimestamp;
    }

    public Double getDistanceFromRoute() {
        return distanceFromRoute;
    }

    public void setDistanceFromRoute(Double distanceFromRoute) {
        this.distanceFromRoute = distanceFromRoute;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public boolean isDeviation() {
        return deviation;
    }

    public void setDeviation(boolean deviation) {
        this.deviation = deviation;
    }
}
