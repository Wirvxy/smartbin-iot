package com.smartwaste.controller;

import com.smartwaste.dto.ContainerDTO;
import com.smartwaste.model.Container.Status;
import com.smartwaste.service.ContainerService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/containers")
public class ContainerController {
    
    private final ContainerService containerService;
    
    public ContainerController(ContainerService containerService) {
        this.containerService = containerService;
    }
    
    @GetMapping
    public String listContainers(@RequestParam(required = false) String region,
                                @RequestParam(required = false) String status,
                                @RequestParam(required = false) String search,
                                Model model) {
        List<ContainerDTO> containers;
        
        if (search != null && !search.isEmpty()) {
            containers = containerService.searchContainers(search);
        } else if (region != null && !region.isEmpty() && status != null && !status.isEmpty()) {
            containers = containerService.getContainersByStatus(Status.valueOf(status));
            containers = containers.stream()
                    .filter(c -> region.equals(c.getRegion()))
                    .toList();
        } else if (region != null && !region.isEmpty()) {
            containers = containerService.getContainersByRegion(region);
        } else if (status != null && !status.isEmpty()) {
            containers = containerService.getContainersByStatus(Status.valueOf(status));
        } else {
            containers = containerService.getAllContainers();
        }
        
        // Get unique regions for filter dropdown
        List<String> regions = containerService.getAllContainers().stream()
                .map(ContainerDTO::getRegion)
                .distinct()
                .sorted()
                .toList();
        
        model.addAttribute("containers", containers);
        model.addAttribute("regions", regions);
        model.addAttribute("selectedRegion", region);
        model.addAttribute("selectedStatus", status);
        model.addAttribute("searchQuery", search);
        return "containers/list";
    }
    
    @GetMapping("/create")
    public String createContainerForm(Model model) {
        model.addAttribute("container", new ContainerDTO());
        return "containers/form";
    }
    
    @PostMapping("/create")
    public String createContainer(@ModelAttribute ContainerDTO containerDTO) {
        containerService.createContainer(containerDTO);
        return "redirect:/containers";
    }
    
    @GetMapping("/edit/{id}")
    public String editContainerForm(@PathVariable Long id, Model model) {
        ContainerDTO container = containerService.getContainerById(id);
        model.addAttribute("container", container);
        return "containers/form";
    }
    
    @PostMapping("/edit/{id}")
    public String updateContainer(@PathVariable Long id, @ModelAttribute ContainerDTO containerDTO) {
        containerService.updateContainer(id, containerDTO);
        return "redirect:/containers";
    }
    
    @PostMapping("/delete/{id}")
    public String deleteContainer(@PathVariable Long id) {
        containerService.deleteContainer(id);
        return "redirect:/containers";
    }
    
    @GetMapping("/{id}")
    public String viewContainer(@PathVariable Long id, Model model) {
        ContainerDTO container = containerService.getContainerById(id);
        model.addAttribute("container", container);
        model.addAttribute("history", containerService.getContainerHistory(id));
        return "containers/view";
    }
    
    @PostMapping("/{id}/collect")
    public String collectContainer(@PathVariable Long id) {
        containerService.collectContainer(id);
        return "redirect:/containers/" + id;
    }
}
