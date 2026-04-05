package com.example.demo.Service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MlService {
    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isAnomalous(
            double originLat,
            double originLon,
            double destLat,
            double destLon,
            double durationS,
            String polyline
    ) {

        String url = "http://ml:8000/predict";

        Map<String, Object> request = new HashMap<>();
        request.put("origin_lat", originLat);
        request.put("origin_lon", originLon);
        request.put("dest_lat", destLat);
        request.put("dest_lon", destLon);
        request.put("duration_s", durationS);
        request.put("polyline", polyline);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(request, headers);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(url, entity, Map.class);

        Map body = response.getBody();

        if (body != null && body.containsKey("is_anomaly")) {
            return (Boolean) body.get("is_anomaly");
        }

        return false;
    }
    
}
