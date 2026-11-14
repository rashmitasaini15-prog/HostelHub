
package com.hostelhub.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                .requestMatchers(
                    HttpMethod.OPTIONS, "/**"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/students/register",
                    "/api/auth/login"
                ).permitAll()

                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/webjars/**"
                ).permitAll()

                // Approved Student IDs - Admin only
                .requestMatchers(
                    "/api/approved-student-ids/**"
                ).hasRole("ADMIN")

                // Staff management - Admin only
                .requestMatchers(
                    "/api/staff/**"
                ).hasRole("ADMIN")

                // Student profile - Student and Admin
                .requestMatchers(
                    HttpMethod.GET, "/api/students/profile"
                ).hasAnyRole("STUDENT", "ADMIN")

                // View all students - Admin only
                .requestMatchers(
                    HttpMethod.GET, "/api/students"
                ).hasRole("ADMIN")

                // View students with pagination - Admin only
                .requestMatchers(
                    HttpMethod.GET, "/api/students/page"
                ).hasRole("ADMIN")

                // View individual student records - Admin only
                .requestMatchers(
                    HttpMethod.GET, "/api/students/*"
                ).hasRole("ADMIN")

                // Update academic year - Admin only
                .requestMatchers(
                    HttpMethod.PUT, "/api/students/*/academic-year"
                ).hasRole("ADMIN")

                // Deactivate student account - Admin only
                .requestMatchers(
                    HttpMethod.PUT, "/api/students/*/deactivate"
                ).hasRole("ADMIN")

                // Reactivate student account - Admin only
                .requestMatchers(
                    HttpMethod.PUT, "/api/students/*/reactivate"
                ).hasRole("ADMIN")

                // Delete student - Admin only
                .requestMatchers(
                    HttpMethod.DELETE, "/api/students/*"
                ).hasRole("ADMIN")

                // Room access
                .requestMatchers(
                    HttpMethod.GET, "/api/rooms/**"
                ).hasAnyRole("STUDENT", "WARDEN", "ADMIN")

                .requestMatchers(
                    HttpMethod.POST, "/api/rooms/**"
                ).hasAnyRole("WARDEN", "ADMIN")

                .requestMatchers(
                    HttpMethod.PUT, "/api/rooms/**"
                ).hasAnyRole("WARDEN", "ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/rooms/**"
                ).hasAnyRole("WARDEN", "ADMIN")

                // Complaint access
                .requestMatchers(
                    HttpMethod.POST, "/api/complaints"
                ).hasRole("STUDENT")

                .requestMatchers(
                    HttpMethod.GET, "/api/complaints/student/**"
                ).hasAnyRole("STUDENT", "ADMIN")

                .requestMatchers(
                    HttpMethod.GET, "/api/complaints"
                ).hasAnyRole("WARDEN", "ADMIN")

                .requestMatchers(
                    HttpMethod.PUT, "/api/complaints/*/status"
                ).hasAnyRole("WARDEN", "ADMIN")

                // Fee access
                .requestMatchers(
                    HttpMethod.GET, "/api/fees/student/**"
                ).hasAnyRole("STUDENT", "ADMIN")

                .requestMatchers(
                    HttpMethod.GET, "/api/fees"
                ).hasAnyRole("WARDEN", "ADMIN")

                .requestMatchers(
                    HttpMethod.POST, "/api/fees"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PUT, "/api/fees/*/pay"
                ).hasRole("ADMIN")

                // Leave request access
                .requestMatchers(
                    HttpMethod.POST, "/api/leave-requests"
                ).hasRole("STUDENT")

                .requestMatchers(
                    HttpMethod.GET, "/api/leave-requests/my"
                ).hasRole("STUDENT")

                .requestMatchers(
                    HttpMethod.GET, "/api/leave-requests"
                ).hasAnyRole("WARDEN", "ADMIN")

                .requestMatchers(
                    HttpMethod.PUT, "/api/leave-requests/*/status"
                ).hasAnyRole("WARDEN", "ADMIN")

                // Other authenticated endpoints
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}

