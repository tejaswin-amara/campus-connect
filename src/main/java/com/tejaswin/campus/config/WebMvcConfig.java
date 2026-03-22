package com.tejaswin.campus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final Path uploadBaseDir;
    private final int bcryptStrength;

    public WebMvcConfig(com.tejaswin.campus.config.AppConfig appConfig) {
        this.uploadBaseDir = Paths.get(appConfig.getUploadDir()).toAbsolutePath().normalize();
        this.bcryptStrength = appConfig.getBcryptStrength();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(bcryptStrength);
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {

        String uploadUri = uploadBaseDir.toUri().toString();
        if (!uploadUri.endsWith("/")) {
            uploadUri += "/";
        }

        String absolutePath = uploadBaseDir.toAbsolutePath().toString().replace("\\", "/");
        if (!absolutePath.endsWith("/")) {
            absolutePath += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadUri)
                .addResourceLocations("file:" + absolutePath)
                .setCachePeriod(3600);

        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600);
    }

}
