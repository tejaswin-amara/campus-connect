package com.tejaswin.campus.controller;

import com.tejaswin.campus.dto.LoginRequest;
import com.tejaswin.campus.dto.RegisterRequest;
import com.tejaswin.campus.dto.UserSummaryResponse;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.repository.UserRepository;
import com.tejaswin.campus.security.CustomUserDetails;
import com.tejaswin.campus.security.SecurityAuditLogger;
import com.tejaswin.campus.service.SessionService;
import com.tejaswin.campus.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Controller
@Validated
public class AuthController {

    private final UserService userService;
    private final SessionService sessionService;
    private final SecurityAuditLogger auditLogger;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService,
                          SessionService sessionService,
                          SecurityAuditLogger auditLogger,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.sessionService = sessionService;
        this.auditLogger = auditLogger;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @GetMapping("/")
    public String root() {
        User guest = userService.getGuestUser();
        if (guest != null) {
            sessionService.setLoggedInUser(guest);
        }
        return "forward:/index.html";
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

        if (user == null || (!"ADMIN".equals(user.getRole()) && !"ROLE_ADMIN".equals(user.getRole()))) {
            auditLogger.logLoginAttempt(username, false, request.getRemoteAddr(), request.getHeader("User-Agent"));
            redirectAttributes.addFlashAttribute("error", "Invalid admin credentials!");
            return "redirect:/admin/login";
        }

        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        HttpSession newSession = request.getSession(true);
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                user.getUsername(), null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(authToken);
        newSession.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext());

        sessionService.setLoggedInUser(user);
        auditLogger.logLoginAttempt(username, true, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return "redirect:/admin/dashboard";
    }

    @PostMapping("/logout")
    public String webLogout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        sessionService.setLoggedInUser(null);
        return "redirect:/";
    }

    // --- REST Endpoints under /api/auth ---

    @PostMapping(value = "/api/auth/register", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        boolean validDomain = email.endsWith("@klh.edu.in") || email.endsWith(".edu") || email.contains(".edu.");
        if (!validDomain) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "Bad Request");
            error.put("message", "Registration requires an institutional email address (@klh.edu.in or ending with .edu)");
            error.put("status", HttpStatus.BAD_REQUEST.value());
            error.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        if (userRepository.findByUsername(request.getUsername().trim()).isPresent()) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "Conflict");
            error.put("message", "Username is already taken");
            error.put("status", HttpStatus.CONFLICT.value());
            error.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        boolean emailExists = userRepository.findAll().stream()
                .anyMatch(u -> email.equalsIgnoreCase(u.getEmail()));
        if (emailExists) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "Conflict");
            error.put("message", "Email is already registered");
            error.put("status", HttpStatus.CONFLICT.value());
            error.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_STUDENT");
        user.setRollNumber(request.getRollNumber().trim());
        user.setDepartment(request.getDepartment().trim());

        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(toSummary(saved));
    }

    @PostMapping(value = "/api/auth/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);

            HttpSession oldSession = request.getSession(false);
            if (oldSession != null) {
                oldSession.invalidate();
            }
            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            User user = userRepository.findById(userDetails.getId()).orElse(null);
            if (user != null) {
                sessionService.setLoggedInUser(user);
            }

            auditLogger.logLoginAttempt(loginRequest.getUsername(), true, request.getRemoteAddr(), request.getHeader("User-Agent"));

            return ResponseEntity.ok(toSummary(userDetails));
        } catch (AuthenticationException ex) {
            auditLogger.logLoginAttempt(loginRequest.getUsername(), false, request.getRemoteAddr(), request.getHeader("User-Agent"));
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "Unauthorized");
            error.put("message", "Invalid username or password");
            error.put("status", HttpStatus.UNAUTHORIZED.value());
            error.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @GetMapping(value = "/api/auth/me", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "Unauthorized");
            error.put("message", "Not authenticated");
            error.put("status", HttpStatus.UNAUTHORIZED.value());
            error.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        if (auth.getPrincipal() instanceof CustomUserDetails cud) {
            return ResponseEntity.ok(toSummary(cud));
        }

        if (auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails ud) {
            User user = userRepository.findByUsername(ud.getUsername()).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(toSummary(user));
            }
        }

        if (auth.getName() != null) {
            User user = userRepository.findByUsername(auth.getName()).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(toSummary(user));
            }
        }

        Map<String, Object> error = new LinkedHashMap<>();
        error.put("error", "Unauthorized");
        error.put("message", "Not authenticated");
        error.put("status", HttpStatus.UNAUTHORIZED.value());
        error.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @PostMapping(value = "/api/auth/logout", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<?> apiLogout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        sessionService.setLoggedInUser(null);
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }

    private UserSummaryResponse toSummary(User user) {
        String role = user.getRole();
        if (role != null && !role.startsWith("ROLE_")) {
            role = "ROLE_" + role.toUpperCase();
        }
        return new UserSummaryResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                role != null ? role : "ROLE_STUDENT",
                user.getClubId(),
                user.getClubName(),
                user.getRollNumber(),
                user.getDepartment()
        );
    }

    private UserSummaryResponse toSummary(CustomUserDetails cud) {
        return new UserSummaryResponse(
                cud.getId(),
                cud.getUsername(),
                cud.getEmail(),
                cud.getRole(),
                cud.getClubId(),
                cud.getClubName(),
                cud.getRollNumber(),
                cud.getDepartment()
        );
    }
}
