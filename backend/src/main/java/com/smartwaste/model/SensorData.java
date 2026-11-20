package com.smartwaste.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // CORRECTION : C'était un String, c'est maintenant un Long !
    @Column(name = "container_id")
    private Long containerId;

    @Column(name = "raw_data")
    private String rawData;

    @Column(name = "distance_cm")
    private Double distanceCm;

    @Column(name = "fill_level")
    private Double fillLevel;

    private Double latitude;
    private Double longitude;
    private Double rssi;
    private Double snr;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;
    
    @PrePersist
    protected void onCreate() {
        if (receivedAt == null) receivedAt = LocalDateTime.now();
    }
}