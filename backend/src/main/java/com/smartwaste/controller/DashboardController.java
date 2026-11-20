package com.smartwaste.controller;

import com.smartwaste.dto.ContainerDTO;
import com.smartwaste.service.ContainerService;
import com.smartwaste.service.DashboardService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
public class DashboardController {

    private final DashboardService dashboardService;
    private final ContainerService containerService;

    public DashboardController(DashboardService dashboardService, ContainerService containerService) {
        this.dashboardService = dashboardService;
        this.containerService = containerService;
    }

    @GetMapping({"/", "/dashboard"})
    public String dashboard(Model model) {
        model.addAttribute("stats", dashboardService.getDashboardStats());
        return "dashboard/index";
    }

    /**
     * JSON for the dashboard's map and charts. Served on the session-authenticated web chain:
     * the page used to call /api/containers, which requires a JWT the browser doesn't have,
     * so the markers and live stats never loaded.
     */
    @GetMapping("/dashboard/data/containers")
    @ResponseBody
    public List<ContainerDTO> containers() {
        return containerService.getAllContainers();
    }

    @GetMapping("/dashboard/data/stats")
    @ResponseBody
    public Map<String, Object> stats() {
        return dashboardService.getDashboardStats();
    }
}
