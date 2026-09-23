package com.tejaswin.campus.dto;

import java.time.LocalDateTime;

public class AttendeeItem {

    private Long registrationId;
    private Long userId;
    private String username;
    private String email;
    private String rollNumber;
    private String department;
    private boolean checkedIn;
    private LocalDateTime checkInTime;
    private String ticketCode;
    private LocalDateTime registrationDate;
    private String status;

    public AttendeeItem() {
    }

    public AttendeeItem(Long registrationId, Long userId, String username, String email, String rollNumber, String department, boolean checkedIn, LocalDateTime checkInTime, String ticketCode, LocalDateTime registrationDate, String status) {
        this.registrationId = registrationId;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.rollNumber = rollNumber;
        this.department = department;
        this.checkedIn = checkedIn;
        this.checkInTime = checkInTime;
        this.ticketCode = ticketCode;
        this.registrationDate = registrationDate;
        this.status = status;
    }

    public Long getRegistrationId() {
        return registrationId;
    }

    public void setRegistrationId(Long registrationId) {
        this.registrationId = registrationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public boolean isCheckedIn() {
        return checkedIn;
    }

    public void setCheckedIn(boolean checkedIn) {
        this.checkedIn = checkedIn;
    }

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public String getTicketCode() {
        return ticketCode;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
