FROM eclipse-temurin:21-jdk-jammy@sha256:074d6f95f1e69965dbd23750a37ec3b234025d0864e9821e0b1fba0763a3e853 AS build
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -B dependency:go-offline
COPY src ./src
RUN ./mvnw -B package -DskipTests

FROM eclipse-temurin:21-jre-jammy@sha256:8ecbec1f32912979c15b86aaf98f7082a77d318a7f92af3d9fe2c0fd2723df10
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 9090
ENTRYPOINT ["java", "-XX:+ExitOnOutOfMemoryError", "-jar", "app.jar"]
