package com.smartwaste.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "containers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Container {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "container_id")
    private Long id;
    
    @Column(name = "container_code", unique = true, nullable = false)
    private String containerId;
    
    @Column(name = "location_name")
    private String name;
    
    @Column(name = "notes")
    private String description;
    
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "region_name")
    private String region;
    
    // RETRAIT DES nullable=false
    @Column(name = "capacity_liters")
    private Double capacity = 120.0; 
    
    @Column(name = "current_level")
    private Double currentLevel = 0.0; 
    
    @Column(name = "fill_percentage")
    private Double fillPercentage = 0.0; 
    
    @Column(name = "alert_threshold")
    private Double alertThreshold = 80.0; 
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status = Status.ACTIVE;
    
    @Column(name = "last_collection")
    private LocalDateTime lastCollection;
    
    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    @OneToMany(mappedBy = "container", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContainerHistory> history = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        lastUpdate = LocalDateTime.now();
        calculateFillPercentage();
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastUpdate = LocalDateTime.now();
        calculateFillPercentage();
    }
    
    public void calculateFillPercentage() {
        if (capacity != null && capacity > 0 && currentLevel != null) {
            fillPercentage = (currentLevel / capacity) * 100;
        }
    }
    
    public boolean isAlertTriggered() {
        return fillPercentage != null && alertThreshold != null && fillPercentage >= alertThreshold;
    }
    
    public enum Status {
        ACTIVE, INACTIVE, MAINTENANCE, FULL
    }
}