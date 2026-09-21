package com.example.demo.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Entity.DTO.TruckRegistrationRequest;
import com.example.demo.Entity.Truck;
import com.example.demo.Service.TruckService;

@RestController
@RequestMapping("/api/trucks")
public class TruckController {
    private final TruckService truckService;

    public TruckController(TruckService truckService) {
        this.truckService = truckService;
    }

    @PostMapping
    public ResponseEntity<Truck> registerTruck(@RequestBody TruckRegistrationRequest request) {
        Truck truck = truckService.registerTruck(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(truck);
    }

    @GetMapping
    public List<Truck> getAllTrucks() {
        return truckService.getAllTrucks();
    }

    @GetMapping("/{id}")
    public Truck getTruckById(@PathVariable String id) {
        return truckService.getTruckById(id);
    }
}
