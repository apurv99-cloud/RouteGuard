package com.example.demo.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.example.demo.Repository.TripRepo;
import com.example.demo.Service.TripService;

@Component
public class TripDataSeeder implements ApplicationRunner {

    private final TripRepo tripRepo;
    private final TripService tripService;

    public TripDataSeeder(TripRepo tripRepo, TripService tripService) {
        this.tripRepo = tripRepo;
        this.tripService = tripService;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        seedIfEmpty();
    }

    public void seedIfEmpty() throws Exception {
        long tripCount = tripRepo.count();
        if (tripCount == 0 || tripCount < 100) {
            tripService.importTrips("trip_data.csv");
        }
    }
}
