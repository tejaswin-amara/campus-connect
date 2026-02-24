package com.tejaswin.campus.controller;

import com.tejaswin.campus.model.User;
import com.tejaswin.campus.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/")
    public String root(HttpSession session) {
        User guest = userService.getGuestUser();
        logger.debug("Root accessed. Guest user found? {}", (guest != null));
        if (guest != null) {
            session.setAttribute("loggedInUser", guest);
            logger.info("Guest logged in. Session ID: {}", session.getId());
            return "redirect:/student/dashboard";
        }
        logger.warn("Guest user NOT found. Redirecting to admin login.");
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
            redirectAttributes.addFlashAttribute("error", "Invalid admin credentials!");
            return "redirect:/admin/login";
        }

        User user = userService.authenticate(username, password);

        if (user == null || !"ADMIN".equals(user.getRole())) {
            redirectAttributes.addFlashAttribute("error", "Invalid admin credentials!");
            return "redirect:/admin/login";
        }

        // Prevent session fixation: invalidate old session and start a fresh one
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

        newSession.setAttribute("loggedInUser", user);
        return "redirect:/admin/dashboard";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

}
