package com.tejaswin.campus.security;

import com.tejaswin.campus.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String username;
    private final String email;
    private final String password;
    private final String role;
    private final Long clubId;
    private final String clubName;
    private final String rollNumber;
    private final String department;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Long id, String username, String email, String password, String role,
                             Long clubId, String clubName, String rollNumber, String department,
                             Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.clubId = clubId;
        this.clubName = clubName;
        this.rollNumber = rollNumber;
        this.department = department;
        this.authorities = authorities;
    }

    public static CustomUserDetails fromUser(User user) {
        if (user == null) {
            return null;
        }

        String rawRole = user.getRole();
        if (rawRole == null || rawRole.isBlank()) {
            rawRole = "ROLE_STUDENT";
        }
        String normalizedRole = rawRole.startsWith("ROLE_") ? rawRole : "ROLE_" + rawRole.toUpperCase();

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(normalizedRole));

        return new CustomUserDetails(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                normalizedRole,
                user.getClubId(),
                user.getClubName(),
                user.getRollNumber(),
                user.getDepartment(),
                authorities
        );
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public Long getClubId() {
        return clubId;
    }

    public String getClubName() {
        return clubName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public String getDepartment() {
        return department;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
