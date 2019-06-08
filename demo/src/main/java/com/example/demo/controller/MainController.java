package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

	@GetMapping("/login")
    public String login() {
        return "login";
    }
	
	@GetMapping("/upload")
    public String upload() {
        return "upload";
    }
}
