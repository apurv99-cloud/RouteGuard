package com.example.demo.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.example.demo.Entity.Trip;
import com.example.demo.Repository.GPSRepo;
import com.example.demo.Repository.TripRepo;
import com.example.demo.Repository.TruckRepo;

@Service
public class TripService {

    private final TripRepo tripRepo;
    private final TruckRepo truckRepo;
    private final GPSRepo gpsRepo;

    public TripService(TripRepo tripRepo, TruckRepo truckRepo, GPSRepo gpsRepo) {
        this.tripRepo = tripRepo;
        this.truckRepo = truckRepo;
        this.gpsRepo = gpsRepo;
    }

    public void importTrips(String fileName) throws IOException {
        gpsRepo.deleteAll();
        truckRepo.deleteAll();
        tripRepo.deleteAll();

        ClassPathResource resource = new ClassPathResource(fileName);

        try (BufferedReader reader =
                     new BufferedReader(
                             new InputStreamReader(resource.getInputStream()))) {

            String line;
            reader.readLine(); // skip header

            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] parts = line.split(",", 8);
                if (parts.length < 8) {
                    continue;
                }

                Trip trip = new Trip();
                trip.setOriginLat(Double.parseDouble(parts[1]));
                trip.setOriginLon(Double.parseDouble(parts[2]));
                trip.setDestLat(Double.parseDouble(parts[3]));
                trip.setDestLon(Double.parseDouble(parts[4]));
                trip.setDistanceM(Double.parseDouble(parts[5]));
                trip.setDurationS(Double.parseDouble(parts[6]));
                trip.setPolyline(parts[7]);

                tripRepo.save(trip);
            }
        }
    }
}