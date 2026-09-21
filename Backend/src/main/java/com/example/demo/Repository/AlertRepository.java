package com.example.demo.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Entity.Alert;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    Optional<Alert> findTopByTruckIdAndAlertTypeOrderByTimestampDesc(String truckId, String alertType);
    Optional<Alert> findTopByTruckIdAndAlertTypeAndTimestampAfter(String truckId, String alertType, LocalDateTime after);
}
