package com.tejaswin.campus.dto;

import java.time.LocalDateTime;

public class CheckInResponse {

    private boolean success;
    private String message;
    private String attendeeName;
    private String rollNumber;
    private String ticketCode;
    private LocalDateTime checkInTime;

    public CheckInResponse() {
    }

    public CheckInResponse(boolean success, String message, String attendeeName, String rollNumber, String ticketCode, LocalDateTime checkInTime) {
        this.success = success;
        this.message = message;
        this.attendeeName = attendeeName;
        this.rollNumber = rollNumber;
        this.ticketCode = ticketCode;
        this.checkInTime = checkInTime;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAttendeeName() {
        return attendeeName;
    }

    public void setAttendeeName(String attendeeName) {
        this.attendeeName = attendeeName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getTicketCode() {
        return ticketCode;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }
}
