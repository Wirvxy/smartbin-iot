package com.smartwaste.config;

import com.smartwaste.model.User;
import com.smartwaste.repository.UserRepository;
import com.smartwaste.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Records every dashboard login attempt (success and failure) in login_history,
 * so admins can spot brute-force attempts from the user's "History" page.
 */
@Component
public class LoginAuditHandler implements AuthenticationSuccessHandler, AuthenticationFailureHandler {

    private final UserService userService;
    private final UserRepository userRepository;

    public LoginAuditHandler(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        if (authentication.getPrincipal() instanceof User user) {
            userService.recordLogin(user.getId(), request.getRemoteAddr(),
                    request.getHeader("User-Agent"), true, null);
        }
        response.sendRedirect(request.getContextPath() + "/dashboard");
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        String username = request.getParameter("username");
        if (username != null) {
            userRepository.findByUsername(username).ifPresent(user ->
                    userService.recordLogin(user.getId(), request.getRemoteAddr(),
                            request.getHeader("User-Agent"), false, exception.getClass().getSimpleName()));
        }
        response.sendRedirect(request.getContextPath() + "/login?error=true");
    }
}
