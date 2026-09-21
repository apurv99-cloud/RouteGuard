package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.demo.Repository.TripRepo;

@SpringBootTest
class DemoApplicationTests {

	@Autowired
	private TripRepo tripRepo;

	@Test
	void contextLoads_andSeedsRealRoutes() {
		assertTrue(tripRepo.count() >= 100,
				"Application should seed the full real route dataset at startup instead of leaving a stale partial database");
	}

}
