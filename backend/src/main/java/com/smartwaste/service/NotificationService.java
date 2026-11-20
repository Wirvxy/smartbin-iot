package com.smartwaste.service;

import com.smartwaste.model.Notification;
import com.smartwaste.model.User;
import com.smartwaste.repository.NotificationRepository;
import com.smartwaste.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    public NotificationService(NotificationRepository notificationRepository,
                              UserRepository userRepository,
                              SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }
    
    @Transactional
    public Notification createNotification(Long userId, Notification.NotificationType type, 
                                          String title, String message) {
        Notification notification = new Notification();
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            notification.setUser(user);
        }
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setStatus(Notification.NotificationStatus.UNREAD);
        
        Notification saved = notificationRepository.save(notification);
        
        // Send via WebSocket
        if (userId != null) {
            messagingTemplate.convertAndSend("/queue/notifications/" + userId, saved);
        } else {
            messagingTemplate.convertAndSend("/topic/notifications", saved);
        }
        
        return saved;
    }
    
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(
            userId, Notification.NotificationStatus.UNREAD);
    }
    
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setStatus(Notification.NotificationStatus.READ);
        notification.setReadAt(java.time.LocalDateTime.now());
        notificationRepository.save(notification);
    }
    
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndStatus(
            userId, Notification.NotificationStatus.UNREAD);
    }
}
