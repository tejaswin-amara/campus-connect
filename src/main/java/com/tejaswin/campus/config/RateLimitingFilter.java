package com.tejaswin.campus.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitingFilter.class);

    private final AppConfig appConfig;
    private final ConcurrentHashMap<String, Bucket> loginBuckets = new ConcurrentHashMap<>();

    public RateLimitingFilter(AppConfig appConfig) {
        this.appConfig = appConfig;
    }

    private Bucket getOrCreateLoginBucket(String ip) {
        return loginBuckets.computeIfAbsent(ip, key -> {
            Bandwidth limit = Bandwidth.builder()
                    .capacity(appConfig.getRateLimit().getCapacity())
                    .refillGreedy(appConfig.getRateLimit().getTokens(),
                            Duration.ofMinutes(appConfig.getRateLimit().getMinutes()))
                    .build();
            return Bucket.builder()
                    .addLimit(limit)
                    .build();
        });
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || !xfHeader.contains(request.getRemoteAddr())) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        if ("/admin/login".equals(request.getRequestURI()) && "POST".equalsIgnoreCase(request.getMethod())) {
            String ip = getClientIp(request);
            Bucket bucket = getOrCreateLoginBucket(ip);

            if (!bucket.tryConsume(1)) {
                logger.warn("Rate limit exceeded for admin login attempts from IP: {}", ip);
                response.setStatus(429); // 429 Too Many Requests
                response.getWriter().write("Too many login attempts. Please try again later.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
