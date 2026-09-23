package com.tejaswin.campus.dto;

public class UserSummaryResponse {

    private Long id;
    private String username;
    private String email;
    private String role;
    private Long clubId;
    private String clubName;
    private String rollNumber;
    private String department;

    public UserSummaryResponse() {
    }

    public UserSummaryResponse(Long id, String username, String email, String role, Long clubId, String clubName, String rollNumber, String department) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.clubId = clubId;
        this.clubName = clubName;
        this.rollNumber = rollNumber;
        this.department = department;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getClubId() {
        return clubId;
    }

    public void setClubId(Long clubId) {
        this.clubId = clubId;
    }

    public String getClubName() {
        return clubName;
    }

    public void setClubName(String clubName) {
        this.clubName = clubName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
