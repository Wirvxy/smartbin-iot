package com.smartwaste.repository;

import com.smartwaste.model.FinalStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface FinalStatsRepository extends JpaRepository<FinalStats, Long> {
    Optional<FinalStats> findByContainerId(Long containerId);
    List<FinalStats> findAll();
}