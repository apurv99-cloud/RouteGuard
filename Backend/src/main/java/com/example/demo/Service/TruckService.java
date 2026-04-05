package com.example.demo.Service;

import java.util.List;

import com.example.demo.Entity.DTO.TruckRequest;

import org.springframework.stereotype.Service;

import com.example.demo.Entity.Trip;
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

    public Truck registerTruck(TruckRequest req) {

        Trip trip = routeRepository.findById(req.getRouteId())
                .orElseThrow(() -> new RuntimeException("Route not found"));

        Truck truck = Truck.builder()
                .truckId(req.getTruckId())
                .pilotName(req.getDriver())
                .status("Registered")
                .trip(trip)
                .build();

        return truckRepository.save(truck);
    }

    public List<Truck> getAllTrucks() {

        return truckRepository.findAll();
    }

    public Truck getTruckById(String id) {
        return truckRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Truck not found with id: " + id));
    }

}