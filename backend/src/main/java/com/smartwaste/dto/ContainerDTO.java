package com.smartwaste.dto;

import com.smartwaste.model.Container.Status;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ContainerDTO {
    private Long id;
    private String containerId;
    private String name;
    private String description;
    private Double latitude;
    private Double longitude;
    private String address;
    private String region;
    private Double capacity;
    private Double currentLevel;
    private Double fillPercentage;
    private Double alertThreshold;
    private Status status;
    private LocalDateTime lastCollection;
    private LocalDateTime lastUpdate;
    private boolean alertTriggered;
}
