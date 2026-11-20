package com.smartwaste.repository;

import com.smartwaste.model.Container;
import com.smartwaste.model.Container.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContainerRepository extends JpaRepository<Container, Long> {
    Optional<Container> findByContainerId(String containerId);
    List<Container> findByRegion(String region);
    List<Container> findByStatus(Status status);
    List<Container> findByRegionAndStatus(String region, Status status);
    
    @Query("SELECT c FROM Container c WHERE c.fillPercentage >= c.alertThreshold")
    List<Container> findContainersWithActiveAlerts();
    
    @Query("SELECT AVG(c.fillPercentage) FROM Container c WHERE c.status = 'ACTIVE'")
    Double getAverageFillPercentage();
    
    @Query("SELECT COUNT(c) FROM Container c WHERE c.fillPercentage >= c.alertThreshold")
    Long countContainersWithActiveAlerts();
}