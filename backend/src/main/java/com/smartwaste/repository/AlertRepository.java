package com.smartwaste.repository;

import com.smartwaste.model.Alert;
import com.smartwaste.model.Alert.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByStatus(AlertStatus status);
    long countByStatus(AlertStatus status);
    List<Alert> findByContainerId(Long containerId);
    List<Alert> findByContainerIdAndStatus(Long containerId, AlertStatus status);
}
