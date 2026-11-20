package com.smartwaste.service;

import com.smartwaste.model.Container;
import com.smartwaste.repository.AlertRepository;
import com.smartwaste.repository.ContainerRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {
    
    private final ContainerRepository containerRepository;
    private final AlertRepository alertRepository;
    
    public DashboardService(ContainerRepository containerRepository,
                           AlertRepository alertRepository) {
        this.containerRepository = containerRepository;
        this.alertRepository = alertRepository;
    }
    
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalContainers = containerRepository.count();
        long activeContainers = containerRepository.findByStatus(Container.Status.ACTIVE).size();
        long fullContainers = containerRepository.findByStatus(Container.Status.FULL).size();
        long maintenanceContainers = containerRepository.findByStatus(Container.Status.MAINTENANCE).size();
        long inactiveContainers = containerRepository.findByStatus(Container.Status.INACTIVE).size();
        long alertContainers = containerRepository.countContainersWithActiveAlerts();
        
        Double avgFillPercentage = containerRepository.getAverageFillPercentage();
        if (avgFillPercentage == null) {
            avgFillPercentage = 0.0;
        }
        
        stats.put("totalContainers", totalContainers);
        stats.put("activeContainers", activeContainers);
        stats.put("fullContainers", fullContainers);
        stats.put("maintenanceContainers", maintenanceContainers);
        stats.put("inactiveContainers", inactiveContainers);
        stats.put("alertContainers", alertContainers);
        stats.put("averageFillPercentage", Math.round(avgFillPercentage * 100.0) / 100.0);
        
        return stats;
    }
}
