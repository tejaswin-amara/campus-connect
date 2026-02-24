package com.tejaswin.campus.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.tejaswin.campus.config.AppConfig;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterAccess(java.time.Duration.ofMinutes(20))
            .build();
    private final AppConfig appConfig;

    public RateLimitingFilter(AppConfig appConfig) {
        this.appConfig = appConfig;
    }

    private Bucket createNewBucket() {
        AppConfig.RateLimit config = appConfig.getRateLimit();
        Bandwidth limit = Bandwidth.builder()
                .capacity(config.getCapacity())
                .refillIntervally(config.getTokens(), Duration.ofMinutes(config.getMinutes()))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        if ("POST".equalsIgnoreCase(request.getMethod()) && "/admin/login".equals(request.getServletPath())) {
            String ip = getClientIp(request);
            Bucket bucket = buckets.get(ip, k -> createNewBucket());

            if (bucket.tryConsume(1)) {
                filterChain.doFilter(request, response);
            } else {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many login attempts. Please try again in 15 minutes.");
            }
        } else {
            filterChain.doFilter(request, response);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        // Only trust XFF from known internal/proxy addresses; otherwise use direct IP.
        String remoteAddr = request.getRemoteAddr();
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && isTrustedProxy(remoteAddr)) {
            return xfHeader.split(",")[0].trim();
        }
        return remoteAddr;
    }

    private boolean isTrustedProxy(String addr) {
        // configure via AppConfig or env var; e.g. "127.0.0.1", "10.0.0.0/8"
        return addr.startsWith("127.") || addr.startsWith("10.");
    }
}
