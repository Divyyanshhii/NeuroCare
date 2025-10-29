package com.NeuroCare.controller;

import com.NeuroCare.model.AuthResponse;
import com.NeuroCare.model.User;
import com.NeuroCare.model.dto.ForgotPasswordRequest;
import com.NeuroCare.model.dto.ResetPasswordRequest;
import com.NeuroCare.repository.UserRepository;
import com.NeuroCare.security.JwtUtil;
import com.NeuroCare.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private static final Set<String> blacklistedTokens = new HashSet<>();

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Signup API
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Email already registered");
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during signup: " + e.getMessage());
        }
    }

    // Login API
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        return userRepository.findByEmail(loginRequest.getEmail())
                .map(user -> {
                    if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                        String token = JwtUtil.generateToken(user.getEmail());
                        return ResponseEntity.ok(new AuthResponse(token));
                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(new AuthResponse("Invalid email or password!"));
                    }
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse("Invalid email or password!")));
    }

    // Forgot Password - request OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .map(user -> {
                    String otp = generateOtp();
                    user.setOtpCode(otp);
                    user.setOtpExpiry(Instant.now().plus(10, ChronoUnit.MINUTES));
                    userRepository.save(user);
                    emailService.sendOtpEmail(user.getEmail(), otp);
                    return ResponseEntity.ok("OTP sent to email if account exists");
                })
                .orElseGet(() -> ResponseEntity.ok("OTP sent to email if account exists"));
    }

    // Reset Password - verify OTP and set new password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .map(user -> {
                    if (user.getOtpCode() == null || user.getOtpExpiry() == null) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No OTP requested");
                    }
                    if (user.getOtpExpiry().isBefore(Instant.now())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("OTP expired");
                    }
                    if (!user.getOtpCode().equals(request.getOtp())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid OTP");
                    }
                    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                    user.setOtpCode(null);
                    user.setOtpExpiry(null);
                    userRepository.save(user);
                    return ResponseEntity.ok("Password reset successful");
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"));
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    // Logout API
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        blacklistedTokens.add(token);
        return ResponseEntity.ok("✅ Successfully logged out");
    }

    // Check if token is blacklisted
    public static boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }

    // Current User API
    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Missing or invalid Authorization header");
        }

        try {
            String token = authHeader.substring(7);

            // Check blacklist
            if (isTokenBlacklisted(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Token is invalidated (logged out)");
            }

            String email = JwtUtil.extractEmail(token);

            return userRepository.findByEmail(email)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("User not found"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired token");
        }
    }

    // Get all users (for testing/admin)
    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
