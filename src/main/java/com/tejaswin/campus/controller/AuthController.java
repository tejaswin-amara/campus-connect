package com.tejaswin.campus.controller;

import com.tejaswin.campus.model.User;
import com.tejaswin.campus.service.UserService;
import com.tejaswin.campus.security.SecurityAuditLogger;
import com.tejaswin.campus.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import java.util.List;

@Controller
@Validated
public class AuthController {

    private final UserService userService;
    private final SessionService sessionService;
    private final SecurityAuditLogger auditLogger;

    public AuthController(UserService userService, SessionService sessionService, SecurityAuditLogger auditLogger) {
        this.userService = userService;
        this.sessionService = sessionService;
        this.auditLogger = auditLogger;
    }

    @GetMapping("/")
    public String root() {
        User guest = userService.getGuestUser();
        if (guest != null) {
            sessionService.setLoggedInUser(guest);
            return "redirect:/student/dashboard";
        }
        return "redirect:/admin/login";
    }

    @GetMapping("/admin/login")
    public String adminLoginPage() {
        return "admin_login";
    }

    @PostMapping("/admin/login")
    public String adminLogin(@RequestParam @Size(min = 1, max = 72) String username,
            @RequestParam @Size(min = 1, max = 72) String password,
            HttpServletRequest request,
            RedirectAttributes redirectAttributes) {

        if (password != null && password.length() > 72) {
            auditLogger.logLoginAttempt(username, false, request.getRemoteAddr(), request.getHeader("User-Agent"));
            redirectAttributes.addFlashAttribute("error", "Invalid admin credentials!");
            return "redirect:/admin/login";
        }

        User user = userService.authenticate(username, password);

        if (user == null || !"ADMIN".equals(user.getRole())) {
            auditLogger.logLoginAttempt(username, false, request.getRemoteAddr(), request.getHeader("User-Agent"));
            redirectAttributes.addFlashAttribute("error", "Invalid admin credentials!");
            return "redirect:/admin/login";
        }

        jakarta.servlet.http.HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        jakarta.servlet.http.HttpSession newSession = request.getSession(true);
        newSession.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext());

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                user.getUsername(), null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(authToken);
        newSession.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext());

        sessionService.setLoggedInUser(user);
        auditLogger.logLoginAttempt(username, true, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return "redirect:/admin/dashboard";
    }

}
