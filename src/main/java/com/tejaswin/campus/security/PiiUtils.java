package com.tejaswin.campus.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public final class PiiUtils {

    private PiiUtils() {

    }

    public static String hashIdentifier(String raw) {
        if (raw == null || raw.isBlank()) {
            return "[empty]";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (int i = 0; i < 4; i++) {
                hex.append(String.format("%02x", hash[i]));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {

            return "[hash-error]";
        }
    }

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
