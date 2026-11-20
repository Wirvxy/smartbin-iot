package com.smartwaste.config;

import com.smartwaste.service.IoTIngestService;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Random;

/**
 * Demo profile only: behaves like the real Arduino node (BIN_ID = 1) + Heltec gateway,
 * producing the same "id,fill,distance,lat,lon" payload every 5 seconds.
 * The bin slowly fills up, triggers an alert above 80 %, and is "emptied" at 100 %.
 */
@Component
@Profile("demo")
public class SensorSimulator {

    private static final int BIN_ID = 1;
    private static final double BIN_HEIGHT_CM = 30.0;   // same constant as the Arduino sketch
    private static final double LAT = 34.004200;
    private static final double LON = -4.991800;

    private final IoTIngestService ingestService;
    private final Random random = new Random();
    private double fill = 35.0;

    public SensorSimulator(IoTIngestService ingestService) {
        this.ingestService = ingestService;
    }

    @Scheduled(fixedRate = 5000, initialDelay = 3000)
    public void sendReading() {
        fill += 1.5 + random.nextDouble() * 2.5;
        if (fill >= 100) {
            fill = 5;   // collected
        }
        int fillPercent = (int) Math.round(Math.min(fill, 100));
        double distance = BIN_HEIGHT_CM * (100 - fillPercent) / 100.0;
        String raw = String.format(Locale.ROOT, "%d,%d,%.1f,%.6f,%.6f", BIN_ID, fillPercent, distance, LAT, LON);

        double rssi = -65 - random.nextDouble() * 20;   // typical 433 MHz values at short range
        double snr = 6 + random.nextDouble() * 5;
        ingestService.ingest(new IoTIngestService.GatewayMessage(raw, rssi, snr, "simulated-gateway"));
    }
}
