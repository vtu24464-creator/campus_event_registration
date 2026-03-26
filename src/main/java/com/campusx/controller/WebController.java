package com.campusx.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * WebController — handles user-friendly routes that render HTML pages.
 */
@Controller
public class WebController {

    @GetMapping("/event/{id}/payment")
    public String paymentPage(@PathVariable Long id) {
        // Forward to the static payment.html
        return "forward:/payment.html";
    }
}
