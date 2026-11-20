package com.smartwaste.controller;

import com.smartwaste.model.Notification;
import com.smartwaste.service.NotificationService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    
    private final NotificationService notificationService;
    
    public WebSocketController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    @MessageMapping("/app/notifications")
    @SendTo("/topic/notifications")
    public Notification sendNotification(Notification notification) {
        return notification;
    }
}
