package com.smartwaste.service;

import com.smartwaste.model.Container;
import com.smartwaste.model.FinalStats;
import com.smartwaste.model.SensorData;
import com.smartwaste.repository.ContainerRepository;
import com.smartwaste.repository.FinalStatsRepository;
import com.smartwaste.repository.SensorDataRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class IoTSyncService {

    private final FinalStatsRepository finalStatsRepository;
    private final SensorDataRepository sensorDataRepository;
    private final ContainerRepository containerRepository;

    public IoTSyncService(FinalStatsRepository finalStatsRepository,
                          SensorDataRepository sensorDataRepository,
                          ContainerRepository containerRepository) {
        this.finalStatsRepository = finalStatsRepository;
        this.sensorDataRepository = sensorDataRepository;
        this.containerRepository = containerRepository;
    }

    @Scheduled(fixedRate = 5000)
    @Transactional
    public void syncIoTData() {
        // On récupère les dernières stats calculées par vos Triggers SQL
        List<FinalStats> allStats = finalStatsRepository.findAll();

        for (FinalStats stats : allStats) {
            if (stats.getContainerId() != null) {
                // TENTATIVE 1 : On cherche par l'ID numérique (Clé primaire)
                Optional<Container> containerOpt = containerRepository.findById(stats.getContainerId());
                
                // TENTATIVE 2 : Si pas trouvé, on cherche par le Code (ex: "BIN-ESP32")
                if (containerOpt.isEmpty()) {
                    containerOpt = containerRepository.findByContainerId(stats.getContainerId().toString());
                }

                if (containerOpt.isPresent()) {
                    Container container = containerOpt.get();

                    if (stats.getFillLevelPercent() != null) {
                        double fillPercent = stats.getFillLevelPercent();
                        
                        // MISE À JOUR RÉELLE DES DONNÉES
                        container.setFillPercentage(fillPercent);
                        boolean operatorStatus = container.getStatus() == Container.Status.MAINTENANCE
                                || container.getStatus() == Container.Status.INACTIVE;
                        if (!operatorStatus) {
                            container.setStatus(Container.Status.ACTIVE);
                        }
                        
                        if (container.getCapacity() != null && container.getCapacity() > 0) {
                            container.setCurrentLevel((fillPercent / 100.0) * container.getCapacity());
                        }

                        // Gestion auto du statut "Plein"
                        if (fillPercent >= 100 && !operatorStatus) {
                            container.setStatus(Container.Status.FULL);
                        }
                    }
                    // On force l'enregistrement dans la table CONTAINERS
                    containerRepository.save(container);
                }
            }
        }
    }

    public List<SensorData> getSensorHistory(String containerCode) {
        Optional<Container> containerOpt = containerRepository.findByContainerId(containerCode);
        if (containerOpt.isPresent()) {
            return sensorDataRepository.findTop100ByContainerIdOrderByReceivedAtDesc(containerOpt.get().getId());
        }
        return List.of();
    }

    public List<SensorData> getLatestReadings() {
        return sensorDataRepository.findTop10ByOrderByReceivedAtDesc();
    }

    public Optional<FinalStats> getCurrentStats(String containerCode) {
        Optional<Container> containerOpt = containerRepository.findByContainerId(containerCode);
        if (containerOpt.isPresent()) {
            return finalStatsRepository.findByContainerId(containerOpt.get().getId());
        }
        return Optional.empty();
    }
}