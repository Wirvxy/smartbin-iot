package com.smartwaste.controller;

import com.smartwaste.dto.ContainerDTO;
import com.smartwaste.service.ContainerService;
import com.smartwaste.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {
    
    private final ContainerService containerService;
    private final DashboardService dashboardService;
    
    public ApiController(ContainerService containerService, DashboardService dashboardService) {
        this.containerService = containerService;
        this.dashboardService = dashboardService;
    }
    
    @GetMapping("/containers")
    public ResponseEntity<List<ContainerDTO>> getAllContainers() {
        return ResponseEntity.ok(containerService.getAllContainers());
    }
    
    @GetMapping("/containers/{id}")
    public ResponseEntity<ContainerDTO> getContainer(@PathVariable Long id) {
        return ResponseEntity.ok(containerService.getContainerById(id));
    }
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }
    
    @PostMapping("/containers/{containerId}/level")
    public ResponseEntity<Map<String, String>> updateContainerLevel(
            @PathVariable String containerId,
            @RequestParam Double level) {
        containerService.updateContainerLevel(containerId, level);
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Container level updated");
        return ResponseEntity.ok(response);
    }
}
