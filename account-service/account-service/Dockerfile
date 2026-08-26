# Step 1: Use an official OpenJDK runtime as a parent image
FROM eclipse-temurin:21-jdk-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the built executable jar file into the container
COPY target/*.jar app.jar

# Step 4: Expose the port the service runs on
EXPOSE 8081

# Step 5: Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]