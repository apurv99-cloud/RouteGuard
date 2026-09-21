package com.example.demo.Entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "gps_logs")
public class GPS {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double latitude;
    private Double longitude;

    private LocalDateTime timestamp;

    private Double speedKmh;

    @Column(name = "distance_from_route")
    private Double distanceFromRoute;

    @Column(name = "deviation_status")
    private String deviationStatus;

    @Column(name = "risk_level")
    private String riskLevel;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "truck_id")
    private Truck truck;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Double getSpeedKmh() {
        return speedKmh;
    }

    public void setSpeedKmh(Double speedKmh) {
        this.speedKmh = speedKmh;
    }

    public Double getDistanceFromRoute() {
        return distanceFromRoute;
    }

    public void setDistanceFromRoute(Double distanceFromRoute) {
        this.distanceFromRoute = distanceFromRoute;
    }

    public String getDeviationStatus() {
        return deviationStatus;
    }

    public void setDeviationStatus(String deviationStatus) {
        this.deviationStatus = deviationStatus;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public Truck getTruck() {
        return truck;
    }

    public void setTruck(Truck truck) {
        this.truck = truck;
    }
}