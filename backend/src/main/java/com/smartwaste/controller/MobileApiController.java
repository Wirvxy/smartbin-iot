package com.smartwaste.controller;

import com.smartwaste.dto.ContainerDTO;
import com.smartwaste.model.FinalStats;
import com.smartwaste.model.SensorData;
import com.smartwaste.repository.ContainerHistoryRepository;
import com.smartwaste.service.ContainerService;
import com.smartwaste.service.DashboardService;
import com.smartwaste.service.IoTSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/mobile")
public class MobileApiController {

    private final ContainerService containerService;
    private final DashboardService dashboardService;
    private final IoTSyncService ioTSyncService;
    private final ContainerHistoryRepository historyRepository;

    public MobileApiController(ContainerService containerService,
                                DashboardService dashboardService,
                                IoTSyncService ioTSyncService,
                                ContainerHistoryRepository historyRepository) {
        this.containerService = containerService;
        this.dashboardService = dashboardService;
        this.ioTSyncService = ioTSyncService;
        this.historyRepository = historyRepository;
    }

    /**
     * GET /api/mobile/regions
     * Regions with their number of containers (the app's region picker)
     */
    @GetMapping("/regions")
    public ResponseEntity<List<Map<String, Object>>> getRegions() {
        Map<String, Long> counts = new TreeMap<>();
        for (ContainerDTO c : containerService.getAllContainers()) {
            if (c.getRegion() != null) {
                counts.merge(c.getRegion(), 1L, Long::sum);
            }
        }
        List<Map<String, Object>> regions = new ArrayList<>();
        counts.forEach((name, count) -> regions.add(Map.of("id", name, "name", name, "containerCount", count)));
        return ResponseEntity.ok(regions);
    }

    /**
     * GET /api/mobile/statistics/daily
     */
    @GetMapping("/statistics/daily")
    public ResponseEntity<Map<String, Object>> getDailyStatistics() {
        List<ContainerDTO> all = containerService.getAllContainers();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCollections", historyRepository.countByActionAndTimestampAfter(
                "COLLECTION", java.time.LocalDate.now().atStartOfDay()));
        stats.put("averageFillLevel", averageFill(all));
        // Same rule as the web dashboard: a bin is "to collect" once it passes its own alert threshold.
        stats.put("fullContainers", all.stream()
                .filter(c -> fill(c) >= (c.getAlertThreshold() != null ? c.getAlertThreshold() : 80.0)).count());
        stats.put("activeContainers", all.stream()
                .filter(c -> c.getStatus() == com.smartwaste.model.Container.Status.ACTIVE).count());
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/mobile/statistics/region/{region}
     */
    @GetMapping("/statistics/region/{region}")
    public ResponseEntity<Map<String, Object>> getRegionStatistics(@PathVariable String region) {
        List<ContainerDTO> inRegion = containerService.getContainersByRegion(region);
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalContainers", inRegion.size());
        stats.put("averageFillLevel", averageFill(inRegion));
        stats.put("collectionsToday", historyRepository.countByActionAndTimestampAfterAndContainer_Region(
                "COLLECTION", java.time.LocalDate.now().atStartOfDay(), region));
        stats.put("alerts", inRegion.stream().filter(ContainerDTO::isAlertTriggered).count());
        return ResponseEntity.ok(stats);
    }

    private static double fill(ContainerDTO c) {
        return c.getFillPercentage() != null ? c.getFillPercentage() : 0.0;
    }

    private static double averageFill(List<ContainerDTO> containers) {
        return containers.stream().mapToDouble(MobileApiController::fill).average().orElse(0.0);
    }

    /**
     * GET /api/mobile/containers
     * List all containers with real-time fill levels and GPS
     */
    @GetMapping("/containers")
    public ResponseEntity<List<ContainerDTO>> getAllContainers() {
        return ResponseEntity.ok(containerService.getAllContainers());
    }

    /**
     * GET /api/mobile/containers/{id}
     * Get single container details
     */
    @GetMapping("/containers/{id}")
    public ResponseEntity<ContainerDTO> getContainer(@PathVariable Long id) {
        return ResponseEntity.ok(containerService.getContainerById(id));
    }

    /**
     * GET /api/mobile/containers/region/{region}
     * Get containers by region
     */
    @GetMapping("/containers/region/{region}")
    public ResponseEntity<List<ContainerDTO>> getContainersByRegion(@PathVariable String region) {
        return ResponseEntity.ok(containerService.getContainersByRegion(region));
    }

    /**
     * GET /api/mobile/containers/{containerId}/sensor-history
     * Get sensor data history for a container
     */
    @GetMapping("/containers/{containerId}/sensor-history")
    public ResponseEntity<List<SensorData>> getSensorHistory(@PathVariable String containerId) {
        return ResponseEntity.ok(ioTSyncService.getSensorHistory(containerId));
    }

    /**
     * GET /api/mobile/containers/{containerId}/live
     * Get real-time IoT data for a container
     */
    @GetMapping("/containers/{containerId}/live")
    public ResponseEntity<?> getLiveData(@PathVariable String containerId) {
        Optional<FinalStats> stats = ioTSyncService.getCurrentStats(containerId);
        if (stats.isPresent()) {
            return ResponseEntity.ok(stats.get());
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * GET /api/mobile/dashboard
     * Dashboard stats for the mobile app
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    /**
     * GET /api/mobile/nearest
     * Find nearest container to given GPS coordinates
     */
    @GetMapping("/nearest")
    public ResponseEntity<ContainerDTO> findNearest(
            @RequestParam Double lat,
            @RequestParam Double lng) {
        List<ContainerDTO> all = containerService.getAllContainers();

        ContainerDTO nearest = null;
        double minDist = Double.MAX_VALUE;

        for (ContainerDTO c : all) {
            if (c.getLatitude() != null && c.getLongitude() != null) {
                double dist = haversine(lat, lng, c.getLatitude(), c.getLongitude());
                // Only suggest bins that are not full (< 80%)
                if (dist < minDist && fill(c) < 80) {
                    minDist = dist;
                    nearest = c;
                }
            }
        }

        if (nearest != null) {
            return ResponseEntity.ok(nearest);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * GET /api/mobile/latest-readings
     * Get latest sensor readings across all bins
     */
    @GetMapping("/latest-readings")
    public ResponseEntity<List<SensorData>> getLatestReadings() {
        return ResponseEntity.ok(ioTSyncService.getLatestReadings());
    }

    /**
     * Haversine formula to calculate distance between two GPS points (in meters)
     */
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371000; // Earth radius in meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
