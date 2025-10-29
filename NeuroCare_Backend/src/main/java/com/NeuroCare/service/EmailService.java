package com.NeuroCare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${neurocare.mail.from:NeuroCare <no-reply@neurocare.com>}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Your NeuroCare Password Reset OTP");
        message.setText("Your OTP is: " + otpCode + "\n\nIt will expire in 10 minutes. If you did not request this, ignore this email.");
        mailSender.send(message);
    }
}


