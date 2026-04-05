package com.example.demo.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check endpoint for frontend and monitoring
 */
@RestController
@RequestMapping("/")
public class HealthController {
    
    @GetMapping("health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Supply Chain Management API");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return response;
    }

    @GetMapping("actuator/health")
    public Map<String, String> actuatorHealth() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        return response;
    }
}
