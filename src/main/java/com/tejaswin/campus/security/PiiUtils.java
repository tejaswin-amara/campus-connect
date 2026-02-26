package com.tejaswin.campus.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Utility class for anonymizing PII before logging.
 * Uses deterministic one-way hashing so logs remain correlatable
 * without exposing raw identifiers.
 */
public final class PiiUtils {

    private PiiUtils() {
        // utility class
    }

    /**
     * Returns the first 8 hex characters of the SHA-256 hash of the input.
     * Deterministic: the same input always produces the same token.
     */
    public static String hashIdentifier(String raw) {
        if (raw == null || raw.isBlank()) {
            return "[empty]";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (int i = 0; i < 4; i++) { // 4 bytes = 8 hex chars
                hex.append(String.format("%02x", hash[i]));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is guaranteed by the JVM spec; this should never happen
            return "[hash-error]";
        }
    }

    /**
     * Redacts a filename to only its extension (e.g., "report.pdf" → "*.pdf").
     * If no extension is present, returns "[no-ext]".
     */
    public static String redactFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "[empty]";
        }
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < fileName.length() - 1) {
            return "*" + fileName.substring(dotIndex);
        }
        return "[no-ext]";
    }

    /**
     * Truncates a user-agent string to at most 30 characters.
     */
    public static String truncateUserAgent(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "[empty]";
        }
        if (userAgent.length() <= 30) {
            return userAgent;
        }
        return userAgent.substring(0, 30) + "…";
    }
}
