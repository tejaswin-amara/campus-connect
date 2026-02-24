package com.tejaswin.campus.service;

import com.tejaswin.campus.model.User;
import com.tejaswin.campus.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String dummyHash;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.dummyHash = passwordEncoder.encode("dummy_timing_mitigation_hash");
    }

    @Transactional(readOnly = true)
    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username).orElse(null);
        boolean match = false;

        if (user != null && user.getPassword() != null && password != null) {
            match = passwordEncoder.matches(password, user.getPassword());
        } else {
            // Constant-time dummy execution to prevent username enumeration timing attacks
            passwordEncoder.matches(password != null ? password : "", dummyHash);
        }

        return match ? user : null;
    }

    @Transactional(readOnly = true)
    public User getGuestUser() {
        return userRepository.findByUsername("guest").orElse(null);
    }
}
