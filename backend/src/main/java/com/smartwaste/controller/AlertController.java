package com.smartwaste.controller;

import com.smartwaste.model.Alert;
import com.smartwaste.service.AlertService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/alerts")
public class AlertController {
    
    private final AlertService alertService;
    
    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }
    
    @GetMapping
    public String listAlerts(Model model) {
        List<Alert> alerts = alertService.getActiveAlerts();
        model.addAttribute("alerts", alerts);
        return "alerts/list";
    }
    
    @PostMapping("/{id}/resolve")
    public String resolveAlert(@PathVariable Long id) {
        alertService.resolveAlert(id);
        return "redirect:/alerts";
    }
}
