package com.smartwaste.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "final_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinalStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stat_id")
    private Long id;

    @Column(name = "container_id", unique = true)
    private Long containerId;

    @Column(name = "fill_level_percent")
    private Double fillLevelPercent;

    @Column(name = "status")
    private String status;

    @Column(name = "last_distance_cm")
    private Double lastDistanceCm;

    @Column(name = "last_signal_strength")
    private Double lastSignalStrength;

    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}