FROM eclipse-temurin:25-jdk-alpine AS build

WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts ./
COPY src src

RUN chmod +x gradlew && ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:25-jre-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=build /app/build/libs/main-api-0.3.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
