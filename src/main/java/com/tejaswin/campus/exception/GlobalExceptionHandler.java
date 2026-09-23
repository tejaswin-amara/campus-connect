package com.tejaswin.campus.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.PAYLOAD_TOO_LARGE)
    public Object handleMaxSizeException(MaxUploadSizeExceededException exc, HttpServletRequest request, Model model) {
        logger.warn("File upload size exceeded: {}", exc.getMessage());
        if (isApiRequest(request)) {
            return buildJsonResponse("Payload Too Large", "File is too large! Please upload a smaller file.", HttpStatus.PAYLOAD_TOO_LARGE);
        }
        model.addAttribute("errorMessage", "File is too large! Please upload a smaller file.");
        model.addAttribute("status", HttpStatus.PAYLOAD_TOO_LARGE.value());
        return "error";
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NOT_FOUND)
    public Object handleNotFound(NoHandlerFoundException exc, HttpServletRequest request, Model model) {
        logger.debug("Page not found: {}", exc.getRequestURL());
        if (isApiRequest(request)) {
            return buildJsonResponse("Not Found", "The resource you requested could not be found.", HttpStatus.NOT_FOUND);
        }
        model.addAttribute("message", "The page you requested could not be found.");
        model.addAttribute("status", HttpStatus.NOT_FOUND.value());
        return "error";
    }

    @ExceptionHandler(EventNotFoundException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NOT_FOUND)
    public Object handleEventNotFound(EventNotFoundException exc, HttpServletRequest request, Model model) {
        logger.warn("Event not found: {}", exc.getMessage());
        if (isApiRequest(request)) {
            return buildJsonResponse("Not Found", exc.getMessage(), HttpStatus.NOT_FOUND);
        }
        model.addAttribute("message", exc.getMessage());
        model.addAttribute("status", HttpStatus.NOT_FOUND.value());
        return "error";
    }

    @ExceptionHandler(EventCapacityExhaustedException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CONFLICT)
    public Object handleEventCapacityExhausted(EventCapacityExhaustedException exc, HttpServletRequest request, Model model) {
        logger.warn("Event capacity exhausted: {}", exc.getMessage());
        if (isApiRequest(request)) {
            return buildJsonResponse("Conflict", exc.getMessage(), HttpStatus.CONFLICT);
        }
        model.addAttribute("message", exc.getMessage());
        model.addAttribute("status", HttpStatus.CONFLICT.value());
        return "error";
    }

    @ExceptionHandler(InvalidImageException.class)
    public Object handleInvalidImage(InvalidImageException exc,
                                     HttpServletRequest request,
                                     RedirectAttributes redirectAttributes) {
        logger.warn("Invalid image upload: {}", exc.getMessage());
        if (isApiRequest(request)) {
            return buildJsonResponse("Bad Request", exc.getMessage(), HttpStatus.BAD_REQUEST);
        }
        redirectAttributes.addFlashAttribute("error", exc.getMessage());
        return "redirect:/admin/dashboard";
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.FORBIDDEN)
    public Object handleAccessDenied(org.springframework.security.access.AccessDeniedException exc,
                                     HttpServletRequest request,
                                     Model model) {
        logger.warn("Security Access Denied: {}", exc.getMessage());
        if (isApiRequest(request)) {
            return buildJsonResponse("Forbidden", "Access denied: insufficient permissions", HttpStatus.FORBIDDEN);
        }
        model.addAttribute("message", "You do not have permission to access this resource.");
        model.addAttribute("status", HttpStatus.FORBIDDEN.value());
        return "error";
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public Object handleAuthenticationException(org.springframework.security.core.AuthenticationException exc,
                                                HttpServletRequest request,
                                                RedirectAttributes redirectAttributes) {
        logger.warn("Authentication failure: {}", exc.getMessage());
        if (isApiRequest(request)) {
            return buildJsonResponse("Unauthorized", exc.getMessage() != null ? exc.getMessage() : "Authentication required", HttpStatus.UNAUTHORIZED);
        }
        redirectAttributes.addFlashAttribute("error",
                "Your session has expired or authentication failed. Please login again.");
        return "redirect:/admin/login";
    }

    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.BAD_REQUEST)
    public Object handleConstraintViolation(jakarta.validation.ConstraintViolationException exc,
                                            HttpServletRequest request,
                                            Model model) {
        logger.warn("Constraint violation: {}", exc.getMessage());
        if (isApiRequest(request)) {
            return buildJsonResponse("Bad Request", "Invalid input provided: " + exc.getMessage(), HttpStatus.BAD_REQUEST);
        }
        model.addAttribute("message", "Invalid input provided.");
        model.addAttribute("status", HttpStatus.BAD_REQUEST.value());
        return "error";
    }

    @ExceptionHandler(org.springframework.web.bind.MissingServletRequestParameterException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.BAD_REQUEST)
    public Object handleMissingParam(org.springframework.web.bind.MissingServletRequestParameterException exc,
                                     HttpServletRequest request,
                                     Model model) {
        logger.warn("Missing request parameter: {}", exc.getParameterName());
        if (isApiRequest(request)) {
            return buildJsonResponse("Bad Request", "Required parameter '" + exc.getParameterName() + "' is missing.", HttpStatus.BAD_REQUEST);
        }
        model.addAttribute("message", "Required parameter '" + exc.getParameterName() + "' is missing.");
        model.addAttribute("status", HttpStatus.BAD_REQUEST.value());
        return "error";
    }

    @ExceptionHandler(Exception.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Object handleGenericException(Exception exc, HttpServletRequest request, Model model) {
        logger.error("Unhandled exception caught by GlobalExceptionHandler", exc);
        if (isApiRequest(request)) {
            return buildJsonResponse("Internal Server Error", "An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        model.addAttribute("message", "An unexpected error occurred. Please try again later.");
        model.addAttribute("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return "error";
    }

    private boolean isApiRequest(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri != null && uri.startsWith("/api/");
    }

    private ResponseEntity<Map<String, Object>> buildJsonResponse(String error, String message, HttpStatus status) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", error);
        body.put("message", message);
        body.put("status", status.value());
        body.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.status(status).body(body);
    }
}
