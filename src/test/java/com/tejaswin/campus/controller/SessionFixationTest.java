package com.tejaswin.campus.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SessionFixationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Valid admin credentials redirect to dashboard")
    public void validLoginRedirectsToDashboard() throws Exception {
        mockMvc.perform(post("/admin/login")
                .param("username", "admin")
                .param("password", "admin123")
                .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/dashboard"));
    }

    @Test
    @DisplayName("Invalid credentials redirect to login with error")
    public void invalidLoginRedirectsWithError() throws Exception {
        mockMvc.perform(post("/admin/login")
                .param("username", "admin")
                .param("password", "wrongpassword")
                .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/login"));
    }

    @Test
    @DisplayName("Login without CSRF token is rejected")
    public void loginWithoutCsrfIsForbidden() throws Exception {
        mockMvc.perform(post("/admin/login")
                .param("username", "admin")
                .param("password", "admin123"))
                .andExpect(status().isForbidden());
    }
}
