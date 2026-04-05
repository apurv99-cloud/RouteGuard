package com.example.demo.Service;

import com.example.demo.Entity.Trip;
import com.example.demo.Entity.TripStatus;
import com.example.demo.Repository.TripRepo;
import org.springframework.stereotype.Service;

@Service
public class DeviationService {

    private final MlService mlService;
    private final TripRepo tripRepo;

    public DeviationService(MlService mlService, TripRepo tripRepo) {
        this.mlService = mlService;
        this.tripRepo = tripRepo;
    }

    public boolean checkTripWithML(Trip trip) {

        boolean anomaly = mlService.isAnomalous(
                trip.getOriginLat(),
                trip.getOriginLon(),
                trip.getDestLat(),
                trip.getDestLon(),
                trip.getDurationS(),
                trip.getPolyline());
        return anomaly;

    }
}