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
            // code, name, address, region, lat, lng, capacity (L), initial fill %, status
            // Real places in Fès; region = arrondissement, so the mobile app's district picker makes sense.
            {"BIN-0001", "SmartBin EST Fès", "Route d'Imouzzer, EST Fès", "Saïss", 34.0042, -4.9918, 120.0, 35.0, "ACTIVE"},
            {"BIN-0002", "Bab Boujloud", "Place Bab Boujloud, Fès Médina", "Fès-Médina", 34.0617, -4.9840, 240.0, 82.0, "ACTIVE"},
            {"BIN-0003", "Avenue Hassan II", "Avenue Hassan II, Ville Nouvelle", "Agdal", 34.0394, -5.0014, 240.0, 47.0, "ACTIVE"},
            {"BIN-0004", "Place R'cif", "Place R'cif, Fès Médina", "Fès-Médina", 34.0627, -4.9726, 360.0, 91.0, "ACTIVE"},
            {"BIN-0005", "Gare de Fès", "Rue Lalla Asmaa, Agdal", "Agdal", 34.0454, -5.0043, 240.0, 23.0, "ACTIVE"},
            {"BIN-0006", "Bab Semmarine", "Grande Rue de Fès Jdid", "Fès Jdid", 34.0543, -4.9900, 360.0, 64.0, "ACTIVE"},
            {"BIN-0007", "Complexe sportif", "Route du Parc, Fès Shore", "Saïss", 34.0026, -4.9701, 360.0, 76.0, "ACTIVE"},
            {"BIN-0008", "Bab Ftouh", "Rue Sidi Ali Boughaleb, Fès Médina", "Fès-Médina", 34.0599, -4.9653, 240.0, 15.0, "MAINTENANCE"},
            {"BIN-0009", "Borj Fez", "Boulevard Allal El Fassi, Agdal", "Agdal", 34.0459, -4.9948, 240.0, 97.0, "ACTIVE"},
            {"BIN-0010", "Jardin Jnan Sbil", "Avenue Moulay Hassan, Fès Jdid", "Fès Jdid", 34.0599, -4.9881, 120.0, 54.0, "ACTIVE"},
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
            container.setStatus((Double) s[7] >= 100 ? Container.Status.FULL : Container.Status.valueOf((String) s[8]));
            container.calculateFillPercentage();
            containerRepository.save(container);
        }
    }
}
