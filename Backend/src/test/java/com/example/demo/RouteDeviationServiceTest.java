package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.example.demo.Entity.Trip;
import com.example.demo.Service.RouteDeviationProperties;
import com.example.demo.Service.RouteDeviationResult;
import com.example.demo.Service.RouteDeviationService;

class RouteDeviationServiceTest {

    @Test
    void shouldReportDistanceAndDeviationForRoutePoint() {
        Trip trip = new Trip();
        trip.setOriginLat(28.6139);
        trip.setOriginLon(77.2090);
        trip.setDestLat(28.5355);
        trip.setDestLon(77.3910);
        trip.setPolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@");

        RouteDeviationProperties props = new RouteDeviationProperties();
        props.setWarningDistanceMeters(100.0);
        props.setCriticalDistanceMeters(300.0);

        RouteDeviationService service = new RouteDeviationService(props);
        RouteDeviationResult result = service.evaluate(trip, 28.6140, 77.2095);

        assertTrue(result.getDistanceFromRoute() >= 0.0);
        assertTrue(result.getRiskLevel() != null);
    }

    @Test
    void shouldUsePersistedRouteGeometryInsteadOfStraightOriginDestinationLine() {
        Trip trip = new Trip();
        trip.setOriginLat(28.5000);
        trip.setOriginLon(77.0000);
        trip.setDestLat(28.5000);
        trip.setDestLon(77.1000);
        trip.setPolyline("28.5000,77.0000|28.5500,77.0500|28.5000,77.1000");

        RouteDeviationService service = new RouteDeviationService();
        RouteDeviationResult result = service.evaluate(trip, 28.5500, 77.0500);

        assertEquals(0.0, result.getDistanceFromRoute(), 0.01);
        assertTrue(!result.isDeviating());
    }
}
