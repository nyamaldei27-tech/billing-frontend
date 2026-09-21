FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar

# Expose the gateway port
EXPOSE 8083

ENTRYPOINT ["java", "-jar", "app.jar"]
