package com.smartwaste.controller;

import com.smartwaste.service.ContainerService;
import com.smartwaste.service.DashboardService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Controller
@RequestMapping("/reports")
public class ReportController {
    
    private final ContainerService containerService;
    private final DashboardService dashboardService;
    
    public ReportController(ContainerService containerService, DashboardService dashboardService) {
        this.containerService = containerService;
        this.dashboardService = dashboardService;
    }
    
    @GetMapping
    public String reportsPage() {
        return "reports/index";
    }
    
    @GetMapping("/pdf")
    public ResponseEntity<byte[]> generatePdfReport(@RequestParam(required = false) String region) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            com.itextpdf.text.Document document = new com.itextpdf.text.Document();
            com.itextpdf.text.pdf.PdfWriter.getInstance(document, baos);
            
            document.open();
            document.add(new com.itextpdf.text.Paragraph("Smart Waste Management - Report"));
            document.add(new com.itextpdf.text.Paragraph("Generated: " + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
            document.add(new com.itextpdf.text.Paragraph(" "));
            
            var stats = dashboardService.getDashboardStats();
            document.add(new com.itextpdf.text.Paragraph("Total Containers: " + stats.get("totalContainers")));
            document.add(new com.itextpdf.text.Paragraph("Active Containers: " + stats.get("activeContainers")));
            document.add(new com.itextpdf.text.Paragraph("Average Fill Percentage: " + stats.get("averageFillPercentage") + "%"));
            
            document.close();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "report_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(baos.toByteArray());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/csv")
    public ResponseEntity<String> generateCsvReport() {
        StringBuilder csv = new StringBuilder();
        csv.append("Container ID,Name,Region,Capacity,Current Level,Fill %,Status\n");
        
        containerService.getAllContainers().forEach(container -> {
            csv.append(container.getContainerId()).append(",")
               .append(container.getName()).append(",")
               .append(container.getRegion()).append(",")
               .append(container.getCapacity()).append(",")
               .append(container.getCurrentLevel()).append(",")
               .append(container.getFillPercentage()).append(",")
               .append(container.getStatus()).append("\n");
        });
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "containers_" + 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csv.toString());
    }
}
