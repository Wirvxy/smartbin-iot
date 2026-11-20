package com.smartwaste.controller;

import com.smartwaste.service.IoTIngestService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

/**
 * Entry point for the IoT pipeline (e.g. an AWS IoT Rule HTTP action, or a test client).
 * Authenticated with a shared key in the X-API-Key header, compared in constant time.
 */
@RestController
@RequestMapping("/api/iot")
public class IoTIngestController {

    private final IoTIngestService ingestService;
    private final byte[] apiKey;

    public IoTIngestController(IoTIngestService ingestService,
                               @Value("${app.iot-api-key}") String apiKey) {
        this.ingestService = ingestService;
        this.apiKey = apiKey.getBytes(StandardCharsets.UTF_8);
    }

    @PostMapping("/ingest")
    public ResponseEntity<Map<String, Object>> ingest(
            @RequestHeader(value = "X-API-Key", required = false) String key,
            @RequestBody IoTIngestService.GatewayMessage message) {

        if (key == null || !MessageDigest.isEqual(apiKey, key.getBytes(StandardCharsets.UTF_8))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid API key"));
        }
        try {
            var reading = ingestService.ingest(message);
            return ResponseEntity.ok(Map.of("status", "stored", "containerId", reading.getContainerId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
