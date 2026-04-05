package com.example.demo.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Entity.Trip;
import com.example.demo.Repository.TripRepo;
import com.example.demo.Service.GPSService;

@RestController
@RequestMapping("/api/trips")
public class TripController {
    private final TripRepo tripRepo;
    private final GPSService gpsService;

    public TripController(TripRepo tripRepo, GPSService gpsService) {
        this.tripRepo = tripRepo;
        this.gpsService = gpsService;
    }

    @GetMapping
    public List<Trip> getAllTrips() {
        return tripRepo.findAll();
    }

    @GetMapping("/{id}")
    public Trip getTripById(@PathVariable Long id) {
        return tripRepo.findById(id).orElse(null);
    }

    @PostMapping
    public Trip createTrip(@RequestBody Trip trip) {
        return tripRepo.save(trip);
    }

    @PostMapping("/{id}/complete")
    public String completeTrip(@PathVariable Long id) {
        gpsService.completeTrip(id);
        return "Trip evaluated by ML";
    }
}
