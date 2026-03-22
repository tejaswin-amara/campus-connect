package com.tejaswin.campus.security;

import com.tejaswin.campus.config.AppConfig;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateLimitingFilterTest {

    private RateLimitingFilter filter;

    @Mock
    private AppConfig appConfig;

    @Mock
    private AppConfig.RateLimit rateLimit;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() throws Exception {
        filter = new RateLimitingFilter(appConfig);
    }

    private void setupRateLimitMocks() {
        when(appConfig.getRateLimit()).thenReturn(rateLimit);
        when(rateLimit.getCapacity()).thenReturn(5);
        when(rateLimit.getTokens()).thenReturn(5);
        when(rateLimit.getMinutes()).thenReturn(1);
    }

    @Test
    void doFilterInternal_WithGetRequest_ShouldAlwaysAllow() throws Exception {
        when(request.getMethod()).thenReturn("GET");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WithPostRequestToAdminLogin_ShouldRateLimit() throws Exception {
        setupRateLimitMocks();
        when(request.getMethod()).thenReturn("POST");
        when(request.getServletPath()).thenReturn("/admin/login");
        when(response.getWriter()).thenReturn(new java.io.PrintWriter(new java.io.StringWriter()));
        when(request.getRemoteAddr()).thenReturn("1.2.3.4");

        for (int i = 0; i < 5; i++) {
            filter.doFilterInternal(request, response, filterChain);
        }
        verify(filterChain, times(5)).doFilter(request, response);

        filter.doFilterInternal(request, response, filterChain);
        verify(response).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        verify(filterChain, times(5)).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WithTrustedProxy_ShouldUseXffHeader() throws Exception {
        setupRateLimitMocks();
        when(request.getMethod()).thenReturn("POST");
        when(request.getServletPath()).thenReturn("/admin/login");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.1, 10.0.0.1");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);

    }
}
