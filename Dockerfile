# Multi-stage Dockerfile for Campus Event Manager (Java 21 / Spring Boot)

# --- Stage 1: Build ---
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom first for dependency caching
COPY mvnw mvnw
COPY .mvn .mvn
COPY pom.xml pom.xml

# Make wrapper executable and download dependencies
RUN chmod +x mvnw && ./mvnw dependency:resolve -B

# Copy source and build
COPY src src
RUN ./mvnw clean package -DskipTests -B

# --- Stage 2: Runtime ---
FROM eclipse-temurin:21-jre-alpine

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy the built JAR from builder stage (using explicit name to avoid globbing issues)
COPY --from=builder /app/target/campus-event-manager-0.0.1-SNAPSHOT.jar app.jar

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R appuser:appgroup /app/uploads

# Set upload directory environment variable explicitely
ENV UPLOAD_DIR=/app/uploads
ENV PORT=9090

USER appuser

# Expose the configurable port (default 9090)
EXPOSE 9090

# Health check (Actuator) - using standard health endpoint
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:9090/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
