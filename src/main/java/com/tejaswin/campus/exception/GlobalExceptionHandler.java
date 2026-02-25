package com.tejaswin.campus.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.PAYLOAD_TOO_LARGE)
    public String handleMaxSizeException(MaxUploadSizeExceededException exc, Model model) {
        logger.warn("File upload size exceeded: {}", exc.getMessage());
        model.addAttribute("errorMessage", "File is too large! Please upload a smaller file.");
        model.addAttribute("status", HttpStatus.PAYLOAD_TOO_LARGE.value());
        return "error";
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleNotFound(NoHandlerFoundException exc, Model model) {
        logger.debug("Page not found: {}", exc.getRequestURL());
        model.addAttribute("message", "The page you requested could not be found.");
        model.addAttribute("status", HttpStatus.NOT_FOUND.value());
        return "error";
    }

    @ExceptionHandler(EventNotFoundException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleEventNotFound(EventNotFoundException exc, Model model) {
        logger.warn("Event not found: {}", exc.getMessage());
        model.addAttribute("message", exc.getMessage());
        model.addAttribute("status", HttpStatus.NOT_FOUND.value());
        return "error";
    }

    @ExceptionHandler(InvalidImageException.class)
    public String handleInvalidImage(InvalidImageException exc,
            org.springframework.web.servlet.mvc.support.RedirectAttributes redirectAttributes) {
        logger.warn("Invalid image upload: {}", exc.getMessage());
        redirectAttributes.addFlashAttribute("error", exc.getMessage());
        return "redirect:/admin/dashboard";
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleAccessDenied(org.springframework.security.access.AccessDeniedException exc, Model model) {
        logger.warn("Security Access Denied: {}", exc.getMessage());
        model.addAttribute("message", "You do not have permission to access this resource.");
        model.addAttribute("status", HttpStatus.FORBIDDEN.value());
        return "error";
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public String handleAuthenticationException(org.springframework.security.core.AuthenticationException exc,
            RedirectAttributes redirectAttributes) {
        logger.warn("Authentication failure: {}", exc.getMessage());
        redirectAttributes.addFlashAttribute("error",
                "Your session has expired or authentication failed. Please login again.");
        return "redirect:/admin/login";
    }

    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleConstraintViolation(jakarta.validation.ConstraintViolationException exc,
            RedirectAttributes redirectAttributes) {
        logger.warn("Constraint violation: {}", exc.getMessage());
        redirectAttributes.addFlashAttribute("error", "Invalid input provided!");
        return "redirect:/admin/login";
    }

    @ExceptionHandler(org.springframework.web.bind.MissingServletRequestParameterException.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleMissingParam(org.springframework.web.bind.MissingServletRequestParameterException exc,
            Model model) {
        logger.warn("Missing request parameter: {}", exc.getParameterName());
        model.addAttribute("message", "Required parameter '" + exc.getParameterName() + "' is missing.");
        model.addAttribute("status", HttpStatus.BAD_REQUEST.value());
        return "error";
    }

    @ExceptionHandler(Exception.class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleGenericException(Exception exc, Model model) {
        logger.error("Unhandled exception caught by GlobalExceptionHandler", exc);
        model.addAttribute("message", "An unexpected error occurred. Please try again later.");
        model.addAttribute("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return "error";
    }
}
