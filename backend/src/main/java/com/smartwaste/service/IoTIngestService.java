package com.smartwaste.service;

import com.smartwaste.model.FinalStats;
import com.smartwaste.model.SensorData;
import com.smartwaste.repository.ContainerRepository;
import com.smartwaste.repository.FinalStatsRepository;
import com.smartwaste.repository.SensorDataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Turns one gateway message into database rows.
 *
 * The Heltec gateway publishes to AWS IoT (topic smartbin/data):
 *   {"raw":"1,45,16.5,34.004200,-4.991800","rssi":-71.0,"snr":9.5,"gateway":"heltec-gateway"}
 * where raw = BIN_ID,FILL_%,DISTANCE_CM,LATITUDE,LONGITUDE (built by the Arduino sensor node).
 *
 * In the AWS deployment this logic lived in the database (SQL triggers on sensor_data
 * filling final_stats). Keeping it here makes the pipeline testable locally and in demo mode.
 */
@Service
public class IoTIngestService {

    private static final Logger log = LoggerFactory.getLogger(IoTIngestService.class);

    private final SensorDataRepository sensorDataRepository;
    private final FinalStatsRepository finalStatsRepository;
    private final ContainerRepository containerRepository;

    public IoTIngestService(SensorDataRepository sensorDataRepository,
                            FinalStatsRepository finalStatsRepository,
                            ContainerRepository containerRepository) {
        this.sensorDataRepository = sensorDataRepository;
        this.finalStatsRepository = finalStatsRepository;
        this.containerRepository = containerRepository;
    }

    public record GatewayMessage(String raw, Double rssi, Double snr, String gateway) {}

    @Transactional
    public SensorData ingest(GatewayMessage message) {
        if (message == null || message.raw() == null) {
            throw new IllegalArgumentException("Missing 'raw' field");
        }
        String[] parts = message.raw().trim().split(",");
        if (parts.length != 5) {
            throw new IllegalArgumentException("Expected 5 comma-separated values, got " + parts.length);
        }

        long binId;
        double fill, distance, lat, lon;
        try {
            binId = Long.parseLong(parts[0].trim());
            fill = Double.parseDouble(parts[1].trim());
            distance = Double.parseDouble(parts[2].trim());
            lat = Double.parseDouble(parts[3].trim());
            lon = Double.parseDouble(parts[4].trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Malformed sensor payload");
        }
        if (fill > 100 || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            throw new IllegalArgumentException("Sensor values out of range");
        }

        SensorData reading = new SensorData();
        reading.setContainerId(binId);
        reading.setRawData(message.raw());
        reading.setDistanceCm(distance);
        reading.setFillLevel(fill);
        reading.setLatitude(lat);
        reading.setLongitude(lon);
        reading.setRssi(message.rssi());
        reading.setSnr(message.snr());
        reading.setReceivedAt(LocalDateTime.now());
        sensorDataRepository.save(reading);

        // fill = -1 means the ultrasonic sensor timed out: keep the raw reading, don't touch the stats
        if (fill < 0) {
            log.warn("Sensor error reported by bin {}", binId);
            return reading;
        }

        FinalStats stats = finalStatsRepository.findByContainerId(binId).orElseGet(FinalStats::new);
        stats.setContainerId(binId);
        stats.setFillLevelPercent(fill);
        stats.setStatus(statusFor(fill));
        stats.setLastDistanceCm(distance);
        stats.setLastSignalStrength(message.rssi());
        stats.setLastUpdate(LocalDateTime.now());
        finalStatsRepository.save(stats);

        // GPS sends 0,0 until it has a fix: only move the container on a valid position
        if (lat != 0 && lon != 0) {
            containerRepository.findById(binId).ifPresent(container -> {
                container.setLatitude(lat);
                container.setLongitude(lon);
                containerRepository.save(container);
            });
        }
        return reading;
    }

    private static String statusFor(double fill) {
        if (fill >= 90) return "FULL";
        if (fill >= 70) return "ALMOST_FULL";
        if (fill <= 10) return "EMPTY";
        return "OK";
    }
}
