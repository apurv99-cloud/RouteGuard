package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Entity.Trip;

public interface TripRepo extends JpaRepository<Trip, Long> {
    
}
