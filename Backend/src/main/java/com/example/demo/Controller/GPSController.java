package com.example.demo.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Entity.DTO.GpsRequest;
import com.example.demo.Entity.DTO.GpsUpdateResponse;
import com.example.demo.Service.GPSService;

@RestController
@RequestMapping("/api")
public class GPSController {

    private final GPSService gpsService;

    public GPSController(GPSService gpsService) {
        this.gpsService = gpsService;
    }

    @PostMapping("/gps")
    public ResponseEntity<GpsUpdateResponse> receiveGps(@RequestBody GpsRequest request) {
        return ResponseEntity.ok(gpsService.processGps(request));
    }

    @PostMapping("/gps/{tripId}")
    public ResponseEntity<GpsUpdateResponse> receiveGpsByTripId(
            @PathVariable Long tripId,
            @RequestParam Double lat,
            @RequestParam Double lon) {
        GpsRequest request = new GpsRequest();
        request.setLatitude(lat);
        request.setLongitude(lon);
        return ResponseEntity.ok(gpsService.processGps(tripId, lat, lon));
    }

    @GetMapping("/trucks/{truckId}/gps")
    public ResponseEntity<?> getGpsHistory(@PathVariable String truckId) {
        return ResponseEntity.ok(gpsService.getGpsHistoryForTruck(truckId));
    }
}