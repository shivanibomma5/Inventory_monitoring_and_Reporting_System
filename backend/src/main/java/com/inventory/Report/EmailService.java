package com.inventory.Report;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String[] toAddresses, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toAddresses);
            message.setSubject(subject);
            message.setText(body);
            // From address is automatically populated from spring.mail.username
            mailSender.send(message);
            System.out.println("Email sent successfully to " + String.join(", ", toAddresses));
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            // We catch and log so that if credentials are not configured, the app doesn't crash completely during operations
        }
    }
}
