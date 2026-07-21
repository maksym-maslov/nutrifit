package ai.nutrifit.main_api;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.TimeZone;

@SpringBootApplication
@EnableAsync
public class MainApiApplication {

	public static void main(String[] args) {
		SpringApplication.run( MainApiApplication.class, args);
	}

	@PostConstruct
	void configureJvmTimezone() {
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
	}

}
