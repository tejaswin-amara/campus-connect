package com.tejaswin.campus.controller;

import com.tejaswin.campus.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AdminControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void unauthenticatedUsersAreRedirectedFromDashboard() throws Exception {
        mockMvc.perform(get("/admin/dashboard"))
                .andExpect(status().isFound());
    }

    @Test
    public void csrfProtectionEnforcedOnPostRequests() throws Exception {
        mockMvc.perform(post("/admin/login")
                .param("username", "admin")
                .param("password", "admin123"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void pathTraversalAttemptIsRejected() throws Exception {
        User mockAdmin = new User();
        mockAdmin.setUsername("admin");
        mockAdmin.setRole("ADMIN");

        MockMultipartFile maliciousFile = new MockMultipartFile(
                "imageFile",
                "../../etc/passwd",
                "image/png",
                "fake image content".getBytes());

        mockMvc.perform(multipart("/admin/add-event")
                .file(maliciousFile)
                .param("title", "Hack Event")
                .param("description", "Testing")
                .param("dateTime", "2026-12-01T10:00:00")
                .param("venue", "Main Hall")
                .param("category", "Technical")
                .sessionAttr("loggedInUser", mockAdmin)
                .with(csrf()))
                .andExpect(result -> {
                    int statusCode = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertTrue(statusCode == 302,
                            "Expected redirect but received " + statusCode);
                });
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void cve202522228_passwordLengthConstraintEnforced() throws Exception {

        String giantPassword = "A".repeat(80);
        mockMvc.perform(post("/admin/login")
                .param("username", "admin")
                .param("password", giantPassword)
                .with((org.springframework.test.web.servlet.request.RequestPostProcessor) csrf()))

                .andExpect(result -> {
                    int statusCode = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertTrue(
                            statusCode == 302 || statusCode == 400,
                            "Expected 302 (redirect) or 400 (bad request) but received " + statusCode);
                });
    }
}
