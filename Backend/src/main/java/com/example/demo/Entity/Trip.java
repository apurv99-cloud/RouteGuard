package com.example.demo.Entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double originLat;
    private Double originLon;
    private Double destLat;
    private Double destLon;

    private Double lastLocationLat;
    private Double lastLocationLon;

    @Column(name = "risk_score")
    private Integer riskScore = 0;

    private Double distanceM;
    private Double durationS;

    @Column(columnDefinition = "TEXT")
    private String polyline;

    @Enumerated(EnumType.STRING)
    private TripStatus status = TripStatus.PLANNED;

    private int deviationCounter = 0;

    @JsonIgnore
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GPS> gpsHistory = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "trip")
    private List<Truck> trucks = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getOriginLat() {
        return originLat;
    }

    public void setOriginLat(Double originLat) {
        this.originLat = originLat;
    }

    public Double getOriginLon() {
        return originLon;
    }

    public void setOriginLon(Double originLon) {
        this.originLon = originLon;
    }

    public Double getDestLat() {
        return destLat;
    }

    public void setDestLat(Double destLat) {
        this.destLat = destLat;
    }

    public Double getDestLon() {
        return destLon;
    }

    public void setDestLon(Double destLon) {
        this.destLon = destLon;
    }

    public Double getLastLocationLat() {
        return lastLocationLat;
    }

    public void setLastLocationLat(Double lastLocationLat) {
        this.lastLocationLat = lastLocationLat;
    }

    public Double getLastLocationLon() {
        return lastLocationLon;
    }

    public void setLastLocationLon(Double lastLocationLon) {
        this.lastLocationLon = lastLocationLon;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }

    public Double getDistanceM() {
        return distanceM;
    }

    public void setDistanceM(Double distanceM) {
        this.distanceM = distanceM;
    }

    public Double getDurationS() {
        return durationS;
    }

    public void setDurationS(Double durationS) {
        this.durationS = durationS;
    }

    public String getPolyline() {
        return polyline;
    }

    public void setPolyline(String polyline) {
        this.polyline = polyline;
    }

    public TripStatus getStatus() {
        return status;
    }

    public void setStatus(TripStatus status) {
        this.status = status;
    }

    public int getDeviationCounter() {
        return deviationCounter;
    }

    public void setDeviationCounter(int deviationCounter) {
        this.deviationCounter = deviationCounter;
    }

    public List<GPS> getGpsHistory() {
        return gpsHistory;
    }

    public void setGpsHistory(List<GPS> gpsHistory) {
        this.gpsHistory = gpsHistory;
    }

    public List<Truck> getTrucks() {
        return trucks;
    }

    public void setTrucks(List<Truck> trucks) {
        this.trucks = trucks;
    }
}