package com.smartwaste.repository;

import com.smartwaste.model.SensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {
    // CORRECTION : On demande un Long au lieu d'un String
    List<SensorData> findTop100ByContainerIdOrderByReceivedAtDesc(Long containerId);
    List<SensorData> findTop10ByOrderByReceivedAtDesc();
}