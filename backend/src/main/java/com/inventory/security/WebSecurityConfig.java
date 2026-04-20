package com.inventory.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;

    public WebSecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                             AuthenticationProvider authenticationProvider) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {

        httpSecurity
                // Disable CSRF
                .csrf(csrf -> csrf.disable())

                // Enable CORS for frontend (React)
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of("http://localhost:3000"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))

                // Stateless session (JWT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorization rules
               .authorizeHttpRequests(auth -> auth

    // PUBLIC
    .requestMatchers("/error").permitAll()
    .requestMatchers("/auth/**").permitAll()

    // USERS
    .requestMatchers("/api/users/**").hasRole("ADMIN")

    // PRODUCTS (FIXED)
    .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/product")
    .hasAnyRole("ADMIN", "SUPPLIER")

.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/products/**")
    .hasAnyRole("ADMIN", "SUPPLIER", "STAFF")

.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/product/**")
    .hasAnyRole("ADMIN", "SUPPLIER", "STAFF")

.requestMatchers("/api/product/**")
    .hasAnyRole("ADMIN", "SUPPLIER")

    // REPORTS
    .requestMatchers("/api/report/**").hasAnyRole("ADMIN", "STAFF")

    // EVERYTHING ELSE
    .anyRequest().authenticated()
)

                // Authentication provider
                .authenticationProvider(authenticationProvider)

                // JWT filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build();
    }
}