package com.tejaswin.campus.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class EventCapacityExhaustedException extends RuntimeException {
    public EventCapacityExhaustedException(String message) {
        super(message);
    }
}
