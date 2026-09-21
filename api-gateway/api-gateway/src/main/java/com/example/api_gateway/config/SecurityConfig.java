package com.example.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Collections;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http) {

        JwtAuthenticationConverter jwtAuthenticationConverter =
                new JwtAuthenticationConverter();

        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwt -> {

            Object rolesObject = jwt.getClaim("realm_access") instanceof java.util.Map<?, ?> realmAccess
                    ? realmAccess.get("roles")
                    : null;

            if (rolesObject instanceof Collection<?> roles) {
                return roles.stream()
                        .map(Object::toString)
                        .map(role -> (GrantedAuthority)
                                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                        "ROLE_" + role.toUpperCase()
                                ))
                        .collect(java.util.stream.Collectors.toList());
            }

            return Collections.emptyList();
        });

        ReactiveJwtAuthenticationConverterAdapter reactiveConverter =
                new ReactiveJwtAuthenticationConverterAdapter(
                        jwtAuthenticationConverter
                );

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                .authorizeExchange(exchange -> exchange

                        .pathMatchers(HttpMethod.OPTIONS).permitAll()

                        .pathMatchers("/actuator/health").permitAll()

                        .pathMatchers(
                                HttpMethod.GET, "/api/accounts/me")
                        .authenticated()

                        .pathMatchers(HttpMethod.PUT, "/api/accounts/me")
                        .authenticated()

                        .pathMatchers(HttpMethod.POST, "/api/accounts")
                        .hasRole("ADMIN")

                        .pathMatchers(HttpMethod.GET, "/api/accounts")
                        .hasRole("ADMIN")

                        .pathMatchers(HttpMethod.DELETE, "/api/accounts/**")
                        .hasRole("ADMIN")

                        // Reading plans is allowed for authenticated users
                        .pathMatchers(HttpMethod.GET, "/api/plans/**")
                        .authenticated()

                        // Managing plans is ADMIN-only
                        .pathMatchers(HttpMethod.POST, "/api/plans/**")
                        .hasRole("ADMIN")

                        .pathMatchers(HttpMethod.PUT, "/api/plans/**")
                        .hasRole("ADMIN")

                        .pathMatchers(HttpMethod.DELETE, "/api/plans/**")
                        .hasRole("ADMIN")

                        .anyExchange().authenticated()
                )

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        reactiveConverter
                                )
                        )
                )

                .build();
    }
}