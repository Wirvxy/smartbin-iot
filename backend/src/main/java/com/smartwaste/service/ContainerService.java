package com.smartwaste.service;

import com.smartwaste.dto.ContainerDTO;
import com.smartwaste.model.Container;
import com.smartwaste.model.ContainerHistory;
import com.smartwaste.model.Container.Status;
import com.smartwaste.repository.AlertRepository;
import com.smartwaste.repository.ContainerHistoryRepository;
import com.smartwaste.repository.ContainerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContainerService {
    
    private final ContainerRepository containerRepository;
    private final ContainerHistoryRepository historyRepository;
    private final AlertRepository alertRepository;
    
    public ContainerService(ContainerRepository containerRepository,
                           ContainerHistoryRepository historyRepository,
                           AlertRepository alertRepository) {
        this.containerRepository = containerRepository;
        this.historyRepository = historyRepository;
        this.alertRepository = alertRepository;
    }
    
    public List<ContainerDTO> getAllContainers() {
        return containerRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public ContainerDTO getContainerById(Long id) {
        Container container = containerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Container not found"));
        return convertToDTO(container);
    }
    
    public ContainerDTO getContainerByContainerId(String containerId) {
        Container container = containerRepository.findByContainerId(containerId)
                .orElseThrow(() -> new RuntimeException("Container not found"));
        return convertToDTO(container);
    }
    
    public List<ContainerDTO> getContainersByRegion(String region) {
        return containerRepository.findByRegion(region).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ContainerDTO> getContainersByStatus(Status status) {
        return containerRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ContainerDTO> searchContainers(String keyword) {
        return containerRepository.findAll().stream()
                .filter(c -> (c.getName() != null && c.getName().toLowerCase().contains(keyword.toLowerCase())) ||
                           (c.getContainerId() != null && c.getContainerId().toLowerCase().contains(keyword.toLowerCase())) ||
                           (c.getAddress() != null && c.getAddress().toLowerCase().contains(keyword.toLowerCase())) ||
                           (c.getRegion() != null && c.getRegion().toLowerCase().contains(keyword.toLowerCase())))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ContainerDTO createContainer(ContainerDTO containerDTO) {
        if (containerRepository.findByContainerId(containerDTO.getContainerId()).isPresent()) {
            throw new RuntimeException("Container ID already exists");
        }
        
        Container container = new Container();
        container.setContainerId(containerDTO.getContainerId());
        container.setName(containerDTO.getName());
        container.setDescription(containerDTO.getDescription());
        container.setLatitude(containerDTO.getLatitude());
        container.setLongitude(containerDTO.getLongitude());
        container.setAddress(containerDTO.getAddress());
        container.setRegion(containerDTO.getRegion());
        container.setCapacity(containerDTO.getCapacity());
        container.setCurrentLevel(containerDTO.getCurrentLevel() != null ? containerDTO.getCurrentLevel() : 0.0);
        container.setAlertThreshold(containerDTO.getAlertThreshold() != null ? containerDTO.getAlertThreshold() : 80.0);
        container.setStatus(containerDTO.getStatus() != null ? containerDTO.getStatus() : Status.ACTIVE);
        
        Container savedContainer = containerRepository.save(container);
        
        // Record history
        recordHistory(savedContainer, "CREATE", "Container created");
        
        return convertToDTO(savedContainer);
    }
    
    @Transactional
    public ContainerDTO updateContainer(Long id, ContainerDTO containerDTO) {
        Container container = containerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Container not found"));
        
        container.setName(containerDTO.getName());
        container.setDescription(containerDTO.getDescription());
        container.setLatitude(containerDTO.getLatitude());
        container.setLongitude(containerDTO.getLongitude());
        container.setAddress(containerDTO.getAddress());
        container.setRegion(containerDTO.getRegion());
        container.setCapacity(containerDTO.getCapacity());
        container.setCurrentLevel(containerDTO.getCurrentLevel());
        container.setAlertThreshold(containerDTO.getAlertThreshold());
        container.setStatus(containerDTO.getStatus());
        
        Container updatedContainer = containerRepository.save(container);
        
        // Record history
        recordHistory(updatedContainer, "UPDATE", "Container updated");
        
        return convertToDTO(updatedContainer);
    }
    
    @Transactional
    public void updateContainerLevel(String containerId, Double newLevel) {
        Container container = containerRepository.findByContainerId(containerId)
                .orElseThrow(() -> new RuntimeException("Container not found"));
        
        container.setCurrentLevel(newLevel);
        container.calculateFillPercentage();
        
        if (container.getFillPercentage() != null && container.getFillPercentage() >= 100) {
            container.setStatus(Status.FULL);
        }
        
        containerRepository.save(container);
        
        // Record history
        recordHistory(container, "UPDATE", String.format("Level updated to %.2f%%", container.getFillPercentage()));
    }
    
    @Transactional
    public void collectContainer(Long id) {
        Container container = containerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Container not found"));
        
        container.setCurrentLevel(0.0);
        container.calculateFillPercentage();
        container.setStatus(Status.ACTIVE);
        container.setLastCollection(java.time.LocalDateTime.now());
        
        containerRepository.save(container);
        
        // Close the alerts that were open for this container
        alertRepository.findByContainerIdAndStatus(id, com.smartwaste.model.Alert.AlertStatus.ACTIVE)
                .forEach(alert -> {
                    alert.setStatus(com.smartwaste.model.Alert.AlertStatus.RESOLVED);
                    alert.setResolvedAt(java.time.LocalDateTime.now());
                    alertRepository.save(alert);
                });

        // Record history
        recordHistory(container, "COLLECTION", "Container collected");
    }
    
    @Transactional
    public void deleteContainer(Long id) {
        Container container = containerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Container not found"));
        
        // Remove dependent rows first (FK constraints), then the container itself
        alertRepository.deleteAll(alertRepository.findByContainerId(id));
        historyRepository.deleteAll(historyRepository.findByContainerIdOrderByTimestampDesc(id));
        container.getHistory().clear();
        containerRepository.delete(container);
    }
    
    public List<ContainerHistory> getContainerHistory(Long containerId) {
        return historyRepository.findByContainerIdOrderByTimestampDesc(containerId);
    }
    
    private void recordHistory(Container container, String action, String description) {
        ContainerHistory history = new ContainerHistory();
        history.setContainer(container);
        history.setFillLevel(container.getCurrentLevel());
        history.setFillPercentage(container.getFillPercentage());
        history.setAction(action);
        history.setDescription(description);
        historyRepository.save(history);
    }
    
    private ContainerDTO convertToDTO(Container container) {
        ContainerDTO dto = new ContainerDTO();
        dto.setId(container.getId());
        dto.setContainerId(container.getContainerId());
        dto.setName(container.getName());
        dto.setDescription(container.getDescription());
        dto.setLatitude(container.getLatitude());
        dto.setLongitude(container.getLongitude());
        dto.setAddress(container.getAddress());
        dto.setRegion(container.getRegion());
        dto.setCapacity(container.getCapacity());
        dto.setCurrentLevel(container.getCurrentLevel());
        dto.setFillPercentage(container.getFillPercentage());
        dto.setAlertThreshold(container.getAlertThreshold());
        dto.setStatus(container.getStatus());
        dto.setLastCollection(container.getLastCollection());
        dto.setLastUpdate(container.getLastUpdate());
        dto.setAlertTriggered(container.isAlertTriggered());
        return dto;
    }
}
