package com.smartwaste.repository;

import com.smartwaste.model.Notification;
import com.smartwaste.model.Notification.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, NotificationStatus status);
    List<Notification> findByStatus(NotificationStatus status);
    long countByUserIdAndStatus(Long userId, NotificationStatus status);
}
