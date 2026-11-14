package com.hostelhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class HostelHubBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HostelHubBackendApplication.class, args);
    }

}
