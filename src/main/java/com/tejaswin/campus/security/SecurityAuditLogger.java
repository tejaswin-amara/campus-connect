package com.tejaswin.campus.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

@Component
public class SecurityAuditLogger {
    private static final Logger logger = LoggerFactory.getLogger(SecurityAuditLogger.class);

    public void logLoginAttempt(String username, boolean success, String ip, String userAgent) {
        try {
            String userHash = PiiUtils.hashIdentifier(username);
            String ipHash = PiiUtils.hashIdentifier(ip);
            String uaTruncated = PiiUtils.truncateUserAgent(userAgent);

            MDC.put("event_type", "LOGIN_ATTEMPT");
            MDC.put("login_user", userHash);
            MDC.put("login_success", String.valueOf(success));
            MDC.put("client_ip", ipHash);
            MDC.put("user_agent", uaTruncated);

            if (success) {
                logger.info("AUDIT: Successful login for user_hash: {}", userHash);
            } else {
                logger.warn("AUDIT: Failed login attempt for user_hash: {} from ip_hash: {}", userHash, ipHash);
            }
        } finally {
            MDC.clear();
        }
    }

    public void logFileUpload(String username, String fileName, long size, String result) {
        try {
            String userHash = PiiUtils.hashIdentifier(username);
            String fileRedacted = PiiUtils.redactFileName(fileName);

            MDC.put("event_type", "FILE_UPLOAD");
            MDC.put("upload_user", userHash);
            MDC.put("file_name", fileRedacted);
            MDC.put("file_size", String.valueOf(size));
            MDC.put("upload_result", result);

            logger.info("AUDIT: File upload attempt: {} by user_hash: {} - Status: {}", fileRedacted, userHash, result);
        } finally {
            MDC.clear();
        }
    }

    public void logSecurityLinkClick(String username, String linkType, Long targetId) {
        try {
            String userHash = PiiUtils.hashIdentifier(username);

            MDC.put("event_type", "SECURITY_LINK_CLICK");
            MDC.put("user", userHash);
            MDC.put("link_type", linkType);
            MDC.put("target_id", String.valueOf(targetId));

            logger.info("AUDIT: user_hash {} clicked security link {} for target ID {}", userHash, linkType, targetId);
        } finally {
            MDC.clear();
        }
    }
}
