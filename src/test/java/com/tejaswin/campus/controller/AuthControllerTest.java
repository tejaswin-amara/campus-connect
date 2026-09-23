package com.tejaswin.campus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tejaswin.campus.dto.LoginRequest;
import com.tejaswin.campus.dto.RegisterRequest;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.repository.UserRepository;
import com.tejaswin.campus.security.CustomUserDetails;
import com.tejaswin.campus.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    private User adminUser;
    private CustomUserDetails studentDetails;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setPassword("hashedPassword");
        adminUser.setRole("ADMIN");

        studentDetails = new CustomUserDetails(
                5L, "student1", "student1@klh.edu.in", "pass", "ROLE_STUDENT",
                null, null, "2100030101", "CSE",
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );
    }

    @Test
    void showAdminLogin_ShouldReturnLoginView() throws Exception {
        mockMvc.perform(get("/admin/login"))
                .andExpect(status().isOk())
                .andExpect(view().name("admin_login"));
    }

    @Test
    void adminLogin_WithValidCredentials_ShouldRedirectToDashboard() throws Exception {
        when(userService.authenticate("admin", "test-admin-password")).thenReturn(adminUser);

        mockMvc.perform(post("/admin/login")
                .param("username", "admin")
                .param("password", "test-admin-password")
                .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/dashboard"));
    }

    @Test
    void adminLogin_WithInvalidCredentials_ShouldRedirectWithError() throws Exception {
        when(userService.authenticate(anyString(), anyString())).thenReturn(null);

        mockMvc.perform(post("/admin/login")
                .param("username", "invalid")
                .param("password", "wrong")
                .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/login"))
                .andExpect(flash().attributeExists("error"));
    }

    @Test
    void logout_ShouldInvalidateSessionAndRedirectToRoot() throws Exception {
        mockMvc.perform(post("/logout")
                .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"));
    }

    // --- Tests for REST /api/auth endpoints ---

    @Test
    void register_WithValidInstitutionalEmail_ShouldReturnCreated() throws Exception {
        when(userRepository.findByUsername("newstudent")).thenReturn(Optional.empty());
        when(userRepository.findAll()).thenReturn(List.of());
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(99L);
            return u;
        });

        RegisterRequest req = new RegisterRequest(
                "newstudent", "newstudent@klh.edu.in", "password123", "2100030999", "CSE"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(99))
                .andExpect(jsonPath("$.username").value("newstudent"))
                .andExpect(jsonPath("$.role").value("ROLE_STUDENT"));
    }

    @Test
    void register_WithNonInstitutionalEmail_ShouldReturn400BadRequest() throws Exception {
        RegisterRequest req = new RegisterRequest(
                "badstudent", "student@gmail.com", "password123", "2100030999", "CSE"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void login_WithValidCredentials_ShouldReturnUserSummary() throws Exception {
        CustomUserDetails userDetails = new CustomUserDetails(
                1L, "admin", "admin@campus.edu", "pass", "ROLE_ADMIN",
                null, null, "ADM01", "Admin",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        when(authenticationManager.authenticate(any())).thenReturn(authToken);
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        LoginRequest req = new LoginRequest("admin", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));
    }

    @Test
    void login_WithInvalidCredentials_ShouldReturn401() throws Exception {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        LoginRequest req = new LoginRequest("admin", "wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    void getCurrentUser_WhenAuthenticated_ShouldReturnClaims() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .with(user(studentDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.username").value("student1"))
                .andExpect(jsonPath("$.email").value("student1@klh.edu.in"))
                .andExpect(jsonPath("$.role").value("ROLE_STUDENT"));
    }

    @Test
    void getCurrentUser_WhenUnauthenticated_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    void apiLogout_ShouldInvalidateAndReturnSuccess() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
