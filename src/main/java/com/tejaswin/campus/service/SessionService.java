package com.tejaswin.campus.service;

import com.tejaswin.campus.model.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class SessionService {

    public static final String USER_SESSION_KEY = "loggedInUser";

    private HttpSession getSession(boolean create) {
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attr == null) {
            return null;
        }
        return attr.getRequest().getSession(create);
    }

    public User getLoggedInUser() {
        HttpSession session = getSession(false);
        return (session != null) ? (User) session.getAttribute(USER_SESSION_KEY) : null;
    }

    public void setLoggedInUser(User user) {
        HttpSession session = getSession(true);
        if (session != null) {
            session.setAttribute(USER_SESSION_KEY, user);
        } else {
            throw new IllegalStateException("Cannot set user: no HTTP request context available");
        }
    }

    public void invalidateSession() {
        HttpSession session = getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    public boolean isAdmin() {
        User user = getLoggedInUser();
        return user != null && "ADMIN".equals(user.getRole());
    }
}
