# Dockerfile para desplegar en Render / Cloud Run / Railway
# Etapa 1: Build (Maven + OpenJDK 17)
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app

# Copiar el archivo pom.xml y descargar dependencias
COPY spring-backend/pom.xml .
RUN mvn dependency:go-offline

# Copiar el código fuente y compilar
COPY spring-backend/src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Runtime (Entorno de ejecución ligero)
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copiar el archivo JAR generado desde la etapa de compilación
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto por defecto de Spring Boot o el que asigne Render ($PORT)
ENV PORT 8080
EXPOSE 8080

# Iniciar la aplicación
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
