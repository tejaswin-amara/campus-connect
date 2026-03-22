package com.tejaswin.campus.config;

import com.tejaswin.campus.model.User;
import com.tejaswin.campus.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@SpringBootTest
class DataInitializerTest {

    @Autowired
    private DataInitializer dataInitializer;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Test
    void run_ShouldCreateUsersIfNotFound() throws Exception {
        when(userRepository.findByUsernameForUpdate(anyString())).thenReturn(Optional.empty());

        dataInitializer.run();

        verify(userRepository, atLeast(2)).save(any(User.class));
    }

    @Test
    void run_ShouldMigratePasswordIfNotBCrypt() throws Exception {
        User guest = new User();
        guest.setUsername("guest");
        guest.setPassword("plainText");
        guest.setRole("STUDENT");

        when(userRepository.findByUsernameForUpdate("guest")).thenReturn(Optional.of(guest));
        when(userRepository.findByUsernameForUpdate("admin")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");

        dataInitializer.run();

        verify(userRepository, atLeastOnce()).save(guest);
        verify(passwordEncoder, atLeastOnce()).encode("plainText");
    }
}
