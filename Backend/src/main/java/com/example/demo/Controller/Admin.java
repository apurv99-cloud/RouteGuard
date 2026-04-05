package com.example.demo.Controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Service.TripService;

@RestController
@RequestMapping("/admin")
public class Admin {
    private final TripService tripService;

    public Admin(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping("/import")
    public String importTrips() throws Exception {

        tripService.importTrips("trip_data.csv");

        return "Trips Imported Successfully!";
    }

}
