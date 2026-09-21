package com.example.demo.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.Entity.DTO.TruckRegistrationRequest;
import com.example.demo.Entity.Trip;
import com.example.demo.Entity.TripStatus;
import com.example.demo.Entity.Truck;
import com.example.demo.Repository.TripRepo;
import com.example.demo.Repository.TruckRepo;

@Service
public class TruckService {
    private final TruckRepo truckRepository;
    private final TripRepo routeRepository;

    public TruckService(TruckRepo truckRepository, TripRepo routeRepository) {
        this.truckRepository = truckRepository;
        this.routeRepository = routeRepository;
    }

    public Truck registerTruck(TruckRegistrationRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Truck registration payload is required");
        }
        if (req.getTruckId() == null || req.getTruckId().isBlank()) {
            throw new IllegalArgumentException("Truck ID is required");
        }
        if (req.getDriver() == null || req.getDriver().isBlank()) {
            throw new IllegalArgumentException("Driver name is required");
        }
        if (req.getRouteId() == null) {
            throw new IllegalArgumentException("Route ID is required");
        }

        if (truckRepository.existsById(req.getTruckId())) {
            throw new IllegalArgumentException("Truck already exists with ID: " + req.getTruckId());
        }

        Trip trip = routeRepository.findById(req.getRouteId())
                .orElseThrow(() -> new IllegalArgumentException("Route not found with id: " + req.getRouteId()));

        Truck truck = new Truck();
        truck.setTruckId(req.getTruckId());
        truck.setPilotName(req.getDriver());
        truck.setStatus("PLANNED");
        truck.setTrip(trip);
        truck.setCurrentLatitude(trip.getOriginLat());
        truck.setCurrentLongitude(trip.getOriginLon());
        truck.setDistanceFromRoute(0.0);
        truck.setRiskLevel("NORMAL");
        truck.setDeviation(false);

        if (trip.getStatus() == null || trip.getStatus() == TripStatus.PLANNED) {
            trip.setStatus(TripStatus.PLANNED);
        }
        routeRepository.save(trip);

        return truckRepository.save(truck);
    }

    public List<Truck> getAllTrucks() {
        return truckRepository.findAll();
    }

    public Truck getTruckById(String id) {
        return truckRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Truck not found with id: " + id));
    }

    public Truck getTruckByIdOrThrow(String truckId) {
        return truckRepository.findById(truckId)
                .orElseThrow(() -> new IllegalArgumentException("Truck not found with id: " + truckId));
    }

}