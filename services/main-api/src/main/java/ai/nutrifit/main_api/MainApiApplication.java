package ai.nutrifit.main_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MainApiApplication {

	public static void main(String[] args) {
		SpringApplication.run( MainApiApplication.class, args);
	}

}
