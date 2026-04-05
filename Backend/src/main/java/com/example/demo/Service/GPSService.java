package com.example.demo.Service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.example.demo.Entity.GPS;
import com.example.demo.Entity.Trip;
import com.example.demo.Entity.TripStatus;
import com.example.demo.Repository.GPSRepo;
import com.example.demo.Repository.TripRepo;

@Service
public class GPSService {

    private final TripRepo tripRepo;
    private final GPSRepo gpsRepo;
    private final DeviationService deviationService;

    public GPSService(
            TripRepo tripRepo,
            GPSRepo gpsRepo,
            DeviationService deviationService) {
        this.tripRepo = tripRepo;
        this.gpsRepo = gpsRepo;
        this.deviationService = deviationService;
    }

    public void processGps(Long tripId, Double lat, Double lon) {

        Trip trip = tripRepo.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // 1. Save GPS log
        GPS log = new GPS();
        log.setLatitude(lat);
        log.setLongitude(lon);
        log.setTimestamp(LocalDateTime.now());
        log.setTrip(trip);
        gpsRepo.save(log);

        // 2. Update last location
        trip.setLastLocationLat(lat);
        trip.setLastLocationLon(lon);

        // 3. ML deviation check 
        boolean isAnomaly = deviationService.checkTripWithML(trip);

        if (isAnomaly) {
            trip.setDeviationCounter(trip.getDeviationCounter() + 1);
        }

        // 4. Risk score calculate 
        int deviation = trip.getDeviationCounter();

        int risk;
        if (deviation == 0)
            risk = 10;
        else if (deviation <= 2)
            risk = 40;
        else
            risk = 90;

        trip.setRiskScore(risk);

        // Status update
        if (risk >= 50) {
            trip.setStatus(TripStatus.DEVIATED);
        }

        tripRepo.save(trip);
    }

    public void completeTrip(Long id) {
        throw new UnsupportedOperationException("Not supported yet.");
    }
}
