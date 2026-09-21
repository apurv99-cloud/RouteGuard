package com.example.demo.Service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.Entity.Alert;
import com.example.demo.Repository.AlertRepository;

@Service
public class AlertService {
    private final AlertRepository alertRepository;

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    public Alert createAlert(String truckId, Long tripId, String alertType, String severity,
            double latitude, double longitude, double distanceFromRouteMeters, String message) {
        String dedupKey = truckId + ":" + alertType + ":" + severity;
        Optional<Alert> latest = alertRepository.findTopByTruckIdAndAlertTypeOrderByTimestampDesc(truckId, alertType);
        if (latest.isPresent()) {
            LocalDateTime last = latest.get().getTimestamp();
            if (last != null && last.isAfter(LocalDateTime.now().minusMinutes(5))) {
                return latest.get();
            }
        }

        Alert alert = new Alert();
        alert.setTruckId(truckId);
        alert.setTripId(tripId);
        alert.setAlertType(alertType);
        alert.setSeverity(severity);
        alert.setTimestamp(LocalDateTime.now());
        alert.setLatitude(latitude);
        alert.setLongitude(longitude);
        alert.setDistanceFromRoute(distanceFromRouteMeters);
        alert.setMessage(message);
        alert.setDedupKey(dedupKey);
        return alertRepository.save(alert);
    }
}
