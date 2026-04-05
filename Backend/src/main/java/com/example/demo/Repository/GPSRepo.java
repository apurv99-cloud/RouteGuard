package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Entity.GPS;

public interface GPSRepo extends JpaRepository<GPS, Long> {
    
}
