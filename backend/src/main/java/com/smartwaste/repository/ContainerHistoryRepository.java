package com.smartwaste.repository;

import com.smartwaste.model.ContainerHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContainerHistoryRepository extends JpaRepository<ContainerHistory, Long> {
    List<ContainerHistory> findByContainerIdOrderByTimestampDesc(Long containerId);
    long countByActionAndTimestampAfter(String action, java.time.LocalDateTime after);
    long countByActionAndTimestampAfterAndContainer_Region(String action, java.time.LocalDateTime after, String region);
}
