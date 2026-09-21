package com.example.demo.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Entity.Trip;
import com.example.demo.Entity.TripStatus;
import com.example.demo.Repository.TripRepo;

@RestController
@RequestMapping("/api/trips")
public class TripController {
    private final TripRepo tripRepo;

    public TripController(TripRepo tripRepo) {
        this.tripRepo = tripRepo;
    }

    @GetMapping
    public List<Trip> getAllTrips() {
        return tripRepo.findAll();
    }

    @GetMapping("/{id}")
    public Trip getTripById(@PathVariable Long id) {
        return tripRepo.findById(id).orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));
    }

    @PostMapping
    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip) {
        if (trip.getOriginLat() == null || trip.getOriginLon() == null || trip.getDestLat() == null || trip.getDestLon() == null) {
            throw new IllegalArgumentException("Trip requires origin and destination coordinates");
        }
        trip.setStatus(trip.getStatus() == null ? TripStatus.PLANNED : trip.getStatus());
        Trip saved = tripRepo.save(trip);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/start")
    public Trip startTrip(@PathVariable Long id) {
        Trip trip = tripRepo.findById(id).orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));
        if (trip.getStatus() == TripStatus.COMPLETED || trip.getStatus() == TripStatus.CANCELLED) {
            throw new IllegalArgumentException("Trip cannot be started from status: " + trip.getStatus());
        }
        trip.setStatus(TripStatus.ACTIVE);
        return tripRepo.save(trip);
    }

    @PostMapping("/{id}/complete")
    public Trip completeTrip(@PathVariable Long id) {
        Trip trip = tripRepo.findById(id).orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));
        trip.setStatus(TripStatus.COMPLETED);
        trip.setDurationS(trip.getDurationS() == null ? 0d : trip.getDurationS());
        return tripRepo.save(trip);
    }
}
