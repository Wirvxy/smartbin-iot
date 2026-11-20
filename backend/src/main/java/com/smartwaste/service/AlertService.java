package com.smartwaste.service;

import com.smartwaste.model.Alert;
import com.smartwaste.model.Container;
import com.smartwaste.repository.AlertRepository;
import com.smartwaste.repository.ContainerRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlertService {
    
    private final AlertRepository alertRepository;
    private final ContainerRepository containerRepository;
    
    public AlertService(AlertRepository alertRepository,
                       ContainerRepository containerRepository) {
        this.alertRepository = alertRepository;
        this.containerRepository = containerRepository;
    }
    
    public List<Alert> getActiveAlerts() {
        return alertRepository.findByStatus(Alert.AlertStatus.ACTIVE);
    }
    
    public List<Alert> getAlertsByContainer(Long containerId) {
        return alertRepository.findByContainerId(containerId);
    }
    
    @Scheduled(fixedRate = 10000, initialDelay = 5000)
    @Transactional
    public void checkAndCreateAlerts() {
        List<Container> containers = containerRepository.findAll();
        
        for (Container container : containers) {
            if (container.isAlertTriggered()) {
                // Check if alert already exists
                List<Alert> existingAlerts = alertRepository.findByContainerIdAndStatus(
                    container.getId(), Alert.AlertStatus.ACTIVE);
                
                if (existingAlerts.isEmpty()) {
                    Alert alert = new Alert();
                    alert.setContainer(container);
                    alert.setType(Alert.AlertType.FILL_THRESHOLD);
                    alert.setStatus(Alert.AlertStatus.ACTIVE);
                    alert.setFillPercentage(container.getFillPercentage());
                    alert.setMessage(String.format("Container %s has reached %.1f%% capacity", 
                        container.getName(), container.getFillPercentage()));
                    alertRepository.save(alert);
                }
            }
        }
    }
    
    @Transactional
    public void resolveAlert(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setStatus(Alert.AlertStatus.RESOLVED);
        alert.setResolvedAt(java.time.LocalDateTime.now());
        alertRepository.save(alert);
    }
}
