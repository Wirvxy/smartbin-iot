package com.smartwaste.config;

import com.smartwaste.controller.AlertController;
import com.smartwaste.controller.ContainerController;
import com.smartwaste.controller.DashboardController;
import com.smartwaste.controller.ReportController;
import com.smartwaste.controller.UserController;
import com.smartwaste.model.Alert.AlertStatus;
import com.smartwaste.repository.AlertRepository;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

/**
 * Adds the number of open alerts to every dashboard page, for the counter in the top bar.
 * Limited to the server-rendered controllers, so the mobile and IoT APIs skip this query.
 */
@ControllerAdvice(assignableTypes = {
        DashboardController.class, ContainerController.class, AlertController.class,
        ReportController.class, UserController.class
})
public class NavModelAdvice {

    private final AlertRepository alertRepository;

    public NavModelAdvice(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @ModelAttribute("openAlerts")
    public long openAlerts() {
        return alertRepository.countByStatus(AlertStatus.ACTIVE);
    }
}
