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

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Create uploads directory
RUN mkdir -p uploads && chown -R appuser:appgroup /app

USER appuser

# Expose the configurable port (default 9090)
EXPOSE ${PORT:-9090}

# Health check (More lenient for cloud startup)
HEALTHCHECK --interval=60s --timeout=15s --start-period=60s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-9090}/admin/login || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
