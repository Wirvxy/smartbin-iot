package com.smartwaste.dto;

import com.smartwaste.model.User.Role;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private boolean enabled;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
}
