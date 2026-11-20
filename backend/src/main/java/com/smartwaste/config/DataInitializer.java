package com.smartwaste.config;

import com.smartwaste.model.Container;
import com.smartwaste.model.User;
import com.smartwaste.repository.ContainerRepository;
import com.smartwaste.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ContainerRepository containerRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Value("${app.admin-password}")
    private String adminPassword;

    @Value("${app.manager-password}")
    private String managerPassword;

    public DataInitializer(UserRepository userRepository,
                          ContainerRepository containerRepository,
                          PasswordEncoder passwordEncoder,
                          Environment environment) {
        this.userRepository = userRepository;
        this.containerRepository = containerRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        // Default accounts are created only once. The previous version re-set the
        // admin password to a hard-coded value on every startup, which silently
        // undid any password change made in production.
        createUserIfMissing("admin", adminPassword, "admin@smartwaste.ma", "Admin", "User", User.Role.ADMIN);
        createUserIfMissing("manager", managerPassword, "manager@smartwaste.ma", "Manager", "User", User.Role.MANAGER);

        boolean demo = Arrays.asList(environment.getActiveProfiles()).contains("demo");
        if (demo && containerRepository.count() == 0) {
            createSampleContainers();
        }
    }

    private void createUserIfMissing(String username, String rawPassword, String email,
                                     String firstName, String lastName, User.Role role) {
        if (userRepository.existsByUsername(username)) {
            return;
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        user.setEnabled(true);
        userRepository.save(user);
    }

    /**
     * Demo containers placed around real streets in Fès, Meknès, Rabat and Casablanca.
     * Container #1 (BIN-0001) is the one fed by the simulated LoRa sensor node (BIN_ID = 1).
     */
    private void createSampleContainers() {
        Object[][] samples = {
            // code, name, address, region, lat, lng, capacity (L), initial fill %
            {"BIN-0001", "SmartBin EST Fès", "Route d'Imouzzer, EST Fès", "Fès-Meknès", 34.0042, -4.9918, 120.0, 35.0},
            {"BIN-0002", "Bab Boujloud", "Place Bab Boujloud, Fès Médina", "Fès-Meknès", 34.0618, -4.9839, 240.0, 82.0},
            {"BIN-0003", "Avenue Hassan II", "Avenue Hassan II, Fès Ville Nouvelle", "Fès-Meknès", 34.0372, -5.0004, 240.0, 47.0},
            {"BIN-0004", "Place El Hedim", "Place El Hedim, Meknès", "Fès-Meknès", 33.8937, -5.5662, 360.0, 91.0},
            {"BIN-0005", "Agdal", "Avenue de France, Agdal, Rabat", "Rabat-Salé-Kénitra", 33.9935, -6.8528, 240.0, 23.0},
            {"BIN-0006", "Tour Hassan", "Boulevard Mohamed Lyazidi, Rabat", "Rabat-Salé-Kénitra", 34.0239, -6.8227, 360.0, 64.0},
            {"BIN-0007", "Twin Center", "Boulevard Zerktouni, Maârif, Casablanca", "Casablanca-Settat", 33.5898, -7.6323, 360.0, 76.0},
            {"BIN-0008", "Corniche Aïn Diab", "Boulevard de la Corniche, Casablanca", "Casablanca-Settat", 33.5935, -7.6690, 240.0, 15.0},
            {"BIN-0009", "Boulevard Mohammed V", "Boulevard Mohammed V, Casablanca", "Casablanca-Settat", 33.5951, -7.6187, 240.0, 97.0},
            {"BIN-0010", "Jardin Jnan Sbil", "Avenue Moulay Hassan, Fès", "Fès-Meknès", 34.0606, -4.9906, 120.0, 54.0},
        };

        for (Object[] s : samples) {
            Container container = new Container();
            container.setContainerId((String) s[0]);
            container.setName((String) s[1]);
            container.setDescription("Conteneur intelligent (capteur ultrason + GPS, LoRa 433 MHz)");
            container.setAddress((String) s[2]);
            container.setRegion((String) s[3]);
            container.setLatitude((Double) s[4]);
            container.setLongitude((Double) s[5]);
            container.setCapacity((Double) s[6]);
            container.setCurrentLevel((Double) s[6] * (Double) s[7] / 100.0);
            container.setAlertThreshold(80.0);
            container.setStatus((Double) s[7] >= 100 ? Container.Status.FULL : Container.Status.ACTIVE);
            container.calculateFillPercentage();
            containerRepository.save(container);
        }
    }
}
