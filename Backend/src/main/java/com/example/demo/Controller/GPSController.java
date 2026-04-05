package com.example.demo.Controller;

import org.springframework.web.bind.annotation.*;

import com.example.demo.Service.GPSService;

@RestController
@RequestMapping("/api/gps")
public class GPSController {

    private final GPSService gpsService;

    public GPSController(GPSService gpsService) {
        this.gpsService = gpsService;
    }

    // ✅ Receive GPS data
    @PostMapping("/{tripId}")
    public String receiveGps(
            @PathVariable Long tripId,
            @RequestParam Double lat,
            @RequestParam Double lon) {

        gpsService.processGps(tripId, lat, lon);

        return "GPS logged successfully";
    }
}