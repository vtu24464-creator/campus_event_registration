package com.campusx.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * SecurityConfig — Spring Security configuration.
 * Stateless JWT, CORS open (like Node.js cors({origin:'*'})).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CORS — allow all origins (matches Node.js setup)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Disable CSRF (stateless REST API with JWT)
                .csrf(csrf -> csrf.disable())

                // Session = STATELESS (no server-side sessions)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/events/**").permitAll()
                        .requestMatchers("/api/admin/**").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        // Serve static files
                        .requestMatchers("/", "/index.html", "/login.html", "/register.html",
                                "/events.html", "/dashboard.html",
                                "/admin-login.html", "/admin-dashboard.html",
                                "/certificate-preview.html", "/payment.html",
                                "/css/**", "/js/**", "/banners/**", "/data/**", "/*.ico")
                        .permitAll()
                        // All other /api/** require JWT
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())

                // Disable form login & httpBasic (pure REST API with JWT)
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                // Add JWT filter before Spring's username/password filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt strength 12, matches bcryptjs used in Node.js backend
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
