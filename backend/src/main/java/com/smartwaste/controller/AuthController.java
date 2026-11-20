package com.smartwaste.controller;

import com.smartwaste.dto.LoginRequest;
import com.smartwaste.model.User;
import com.smartwaste.repository.UserRepository;
import com.smartwaste.security.JwtTokenProvider;
import com.smartwaste.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager,
                         JwtTokenProvider tokenProvider,
                         UserService userService,
                         UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/login")
    public String loginPage(@RequestParam(required = false) String error,
                           @RequestParam(required = false) String logout,
                           Model model) {
        if (error != null) {
            model.addAttribute("error", "Nom d'utilisateur ou mot de passe incorrect.");
        }
        if (logout != null) {
            model.addAttribute("message", "Vous êtes déconnecté.");
        }
        return "auth/login";
    }

    /**
     * JSON login used by the mobile app. Accepts a username or an email.
     * Returns 200 {token, user} or 401 (the old version returned 200 with "Error: ..." as the token).
     */
    @PostMapping("/api/auth/login")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest,
                                                     HttpServletRequest request) {
        String username = loginRequest.getUsername();
        if ((username == null || username.isBlank()) && loginRequest.getEmail() != null) {
            username = userRepository.findByEmail(loginRequest.getEmail().trim())
                    .map(User::getUsername)
                    .orElse(loginRequest.getEmail().trim());
        }
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, loginRequest.getPassword()));
            User user = (User) authentication.getPrincipal();
            userService.recordLogin(user.getId(), ip, userAgent, true, null);

            String displayName = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
                    + (user.getLastName() != null ? user.getLastName() : "")).trim();
            return ResponseEntity.ok(Map.of(
                    "token", tokenProvider.generateToken(authentication),
                    "user", Map.of(
                            "id", user.getId(),
                            "name", displayName.isEmpty() ? user.getUsername() : displayName,
                            "email", user.getEmail(),
                            "role", user.getRole().name().toLowerCase())));
        } catch (AuthenticationException e) {
            String attempted = username;
            if (attempted != null) {
                userRepository.findByUsername(attempted).ifPresent(u ->
                        userService.recordLogin(u.getId(), ip, userAgent, false, e.getClass().getSimpleName()));
            }
            // Same message whether the user exists or not (no account enumeration)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }
    }
}
