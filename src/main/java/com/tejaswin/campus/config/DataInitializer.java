package com.tejaswin.campus.config;

import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.repository.EventRepository;
import com.tejaswin.campus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminPassword;

    public DataInitializer(UserRepository userRepository, EventRepository eventRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin-password:admin123}") String adminPassword) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Ensure Guest User Exists (CRITICAL: Required for auto-login on /)
        User guest = userRepository.findByUsernameForUpdate("guest").orElse(null);
        if (guest == null) {
            guest = new User();
            guest.setUsername("guest");
            guest.setPassword(passwordEncoder.encode("guest"));
            guest.setRole("STUDENT");
            userRepository.save(guest);
            logger.info("✅ Guest user created (auto-login enabled)");
        } else if (guest.getPassword() != null && !isBCryptHash(guest.getPassword())) {
            // Assumes pre-migration passwords are stored as plaintext. Risk of irreversible
            // double-hashing if prior schemes existed.
            guest.setPassword(passwordEncoder.encode(guest.getPassword()));
            userRepository.save(guest);
            logger.info("✅ Guest password migrated to BCrypt");
        }

        // 2. Ensure Admin User Exists
        User admin = userRepository.findByUsernameForUpdate("admin").orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            logger.info("✅ Admin user created");
        } else if (admin.getPassword() != null && !isBCryptHash(admin.getPassword())) {
            // Assumes pre-migration passwords are stored as plaintext. Risk of irreversible
            // double-hashing if prior schemes existed.
            admin.setPassword(passwordEncoder.encode(admin.getPassword()));
            userRepository.save(admin);
            logger.info("✅ Admin password migrated to BCrypt");
        } else if (admin.getPassword() != null && !passwordEncoder.matches(adminPassword, admin.getPassword())) {
            // Admin password env var changed — sync hash
            admin.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(admin);
            logger.info("✅ Admin password updated to match configured ADMIN_PASSWORD");
        }

        // 3. Ensure Sample Event Exists
        if (eventRepository.count() == 0) {
            Event welcomeEvent = new Event();
            welcomeEvent.setTitle("Welcome to CampusConnect!");
            welcomeEvent.setDescription(
                    "This is a sample event to show you around. You can register for events, view details, and more! Admins can delete this event from the admin dashboard.");
            welcomeEvent.setVenue("Virtual Campus");
            welcomeEvent.setCategory("Technical");
            welcomeEvent.setDateTime(LocalDateTime.now().plusDays(7));
            welcomeEvent.setEndDateTime(LocalDateTime.now().plusDays(7).plusHours(2));
            welcomeEvent.setMaxCapacity(100);

            eventRepository.save(welcomeEvent);
            logger.info("✅ Sample 'Welcome' event created.");
        }
    }

    /**
     * Returns true if the given password string is already a BCrypt hash.
     * BCrypt hashes always start with "$2a$", "$2b$", or "$2y$".
     */
    private boolean isBCryptHash(String password) {
        return password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$");
    }
}
