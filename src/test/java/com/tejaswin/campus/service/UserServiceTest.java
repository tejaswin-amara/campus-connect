package com.tejaswin.campus.service;

import com.tejaswin.campus.model.User;
import com.tejaswin.campus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void testAuthenticateSuccess() {
        User user = new User();
        user.setUsername("admin");
        user.setPassword("hashedpassword");
        user.setRole("ADMIN");

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("admin123", "hashedpassword")).thenReturn(true);

        User result = userService.authenticate("admin", "admin123");

        assertNotNull(result);
        assertEquals("admin", result.getUsername());
        assertEquals("ADMIN", result.getRole());
        verify(userRepository, times(1)).findByUsername("admin");
    }

    @Test
    void testAuthenticateWrongPassword() {
        User user = new User();
        user.setUsername("admin");
        user.setPassword("hashedpassword");

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hashedpassword")).thenReturn(false);

        User result = userService.authenticate("admin", "wrongpassword");

        assertNull(result);
    }

    @Test
    void testAuthenticateUserNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        User result = userService.authenticate("nonexistent", "password");

        assertNull(result);
    }

    @Test
    void testAuthenticateNullPassword() {
        User user = new User();
        user.setUsername("admin");
        user.setPassword(null);

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));

        User result = userService.authenticate("admin", "admin123");

        assertNull(result);
    }

    @Test
    void testGetGuestUserExists() {
        User guest = new User();
        guest.setUsername("guest");
        guest.setRole("STUDENT");

        when(userRepository.findByUsername("guest")).thenReturn(Optional.of(guest));

        User result = userService.getGuestUser();

        assertNotNull(result);
        assertEquals("guest", result.getUsername());
        assertEquals("STUDENT", result.getRole());
    }

    @Test
    void testGetGuestUserNotFound() {
        when(userRepository.findByUsername("guest")).thenReturn(Optional.empty());

        User result = userService.getGuestUser();

        assertNull(result);
    }
}
