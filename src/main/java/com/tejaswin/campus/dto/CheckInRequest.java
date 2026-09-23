package com.tejaswin.campus.dto;

public class CheckInRequest {

    private String ticketCode;
    private String rollNumber;

    public CheckInRequest() {
    }

    public CheckInRequest(String ticketCode, String rollNumber) {
        this.ticketCode = ticketCode;
        this.rollNumber = rollNumber;
    }

    public String getTicketCode() {
        return ticketCode;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }
}
