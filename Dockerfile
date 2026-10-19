# ==============================================================================
# Stage 1: Frontend Builder (Vite + React + Tailwind + TypeScript)
# ==============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend-redesign

# Enable pnpm package manager
RUN corepack enable && corepack prepare pnpm@9 --activate || npm install -g pnpm@9

# Copy package definitions for layer caching
COPY frontend-redesign/package.json frontend-redesign/pnpm-lock.yaml ./
COPY frontend-redesign/pnpm-workspace.yaml* ./

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy frontend source and compile production bundle into /build/frontend-redesign/dist
COPY frontend-redesign/ ./
RUN pnpm run build

# ==============================================================================
# Stage 2: Backend Builder (Spring Boot 4.1 / Java 21)
# ==============================================================================
FROM maven:3.9-eclipse-temurin-21 AS backend-builder

WORKDIR /build

# Cache Maven dependencies
COPY pom.xml ./
COPY .mvn ./.mvn
COPY mvnw ./
RUN mvn dependency:go-offline -B || true

# Copy Spring Boot source
COPY src ./src

# Import static output from Stage 1 into src/main/resources/static/
COPY --from=frontend-builder /build/frontend-redesign/dist/ src/main/resources/static/

# Package the executable JAR
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Stage 3: Production Runtime (Minimal Temurin 21 JRE Alpine)
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine AS runtime

# Security: Run as unprivileged user (nonroot / UID 10001)
RUN addgroup -g 10001 -S nonroot && adduser -u 10001 -S nonroot -G nonroot

WORKDIR /app

# Copy the built JAR from Stage 2
COPY --from=backend-builder /build/target/campus-event-manager-0.0.1-SNAPSHOT.jar app.jar

# Create uploads directory and enforce ownership
RUN mkdir -p /app/uploads && chown -R nonroot:nonroot /app

# Container configuration & JVM performance tuning
ARG PORT=8080
ENV PORT=${PORT} \
    UPLOAD_DIR=/app/uploads \
    JAVA_OPTS="-XX:InitialRAMPercentage=40.0 -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

USER 10001:10001

EXPOSE ${PORT}

# Healthcheck via Spring Actuator endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]
