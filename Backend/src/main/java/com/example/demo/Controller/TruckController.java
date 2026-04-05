package com.example.demo.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Entity.DTO.TruckRequest;
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
    public Truck registerTruck(@RequestBody TruckRequest request) {
        return truckService.registerTruck(request);
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
