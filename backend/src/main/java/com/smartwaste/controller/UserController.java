package com.smartwaste.controller;

import com.smartwaste.dto.UserDTO;
import com.smartwaste.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping
    public String listUsers(Model model) {
        List<UserDTO> users = userService.getAllUsers();
        model.addAttribute("users", users);
        return "admin/users/list";
    }
    
    @GetMapping("/create")
    public String createUserForm(Model model) {
        model.addAttribute("user", new UserDTO());
        return "admin/users/form";
    }
    
    @PostMapping("/create")
    public String createUser(@ModelAttribute UserDTO userDTO, 
                            @RequestParam String password) {
        userService.createUser(userDTO, password);
        return "redirect:/admin/users";
    }
    
    @GetMapping("/edit/{id}")
    public String editUserForm(@PathVariable Long id, Model model) {
        UserDTO user = userService.getUserById(id);
        model.addAttribute("user", user);
        return "admin/users/form";
    }
    
    @PostMapping("/edit/{id}")
    public String updateUser(@PathVariable Long id, @ModelAttribute UserDTO userDTO) {
        userService.updateUser(id, userDTO);
        return "redirect:/admin/users";
    }
    
    @PostMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "redirect:/admin/users";
    }
    
    @GetMapping("/{id}/history")
    public String getUserHistory(@PathVariable Long id, Model model) {
        UserDTO user = userService.getUserById(id);
        model.addAttribute("user", user);
        model.addAttribute("history", userService.getLoginHistory(id));
        return "admin/users/history";
    }
}
