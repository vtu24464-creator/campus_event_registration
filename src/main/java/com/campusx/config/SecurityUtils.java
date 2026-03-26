package com.campusx.config;

import org.springframework.security.core.context.SecurityContextHolder;

/**
 * SecurityUtils — convenience helper to get the authenticated user's ID
 * from the Spring Security context in any controller method.
 */
public class SecurityUtils {

    private SecurityUtils() {
    }

    /**
     * Returns the current JWT-authenticated user's ID (Long).
     * Only valid inside @Authenticated controller methods.
     */
    public static Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return (Long) principal;
    }
}
