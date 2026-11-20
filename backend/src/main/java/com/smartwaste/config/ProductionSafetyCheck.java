package com.smartwaste.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * Refuses to start in production with the development defaults
 * (dev JWT key, default admin password, default IoT key).
 */
@Component
@Profile("prod")
public class ProductionSafetyCheck {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${app.admin-password}")
    private String adminPassword;

    @Value("${app.iot-api-key}")
    private String iotApiKey;

    @EventListener(ApplicationReadyEvent.class)
    public void verify() {
        if (jwtSecret.startsWith("dev-only") || jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("Set a strong JWT_SECRET (32+ characters) before running in prod");
        }
        if ("admin123".equals(adminPassword)) {
            throw new IllegalStateException("Set ADMIN_PASSWORD before running in prod");
        }
        if ("dev-iot-key".equals(iotApiKey)) {
            throw new IllegalStateException("Set IOT_API_KEY before running in prod");
        }
    }
}
