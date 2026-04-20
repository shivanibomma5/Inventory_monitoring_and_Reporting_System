package com.inventory.Report;

import com.inventory.dao.ProductDAO;
import com.inventory.database_system.entity.Product;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class InventoryReportService {

    private final ProductDAO productDAO;
    private final EmailService emailService;

    @Value("${app.admin.email:}")
    private String[] adminEmails;

    public InventoryReportService(ProductDAO productDAO, EmailService emailService) {
        this.productDAO = productDAO;
        this.emailService = emailService;
    }

    public void checkAndSendLowStockAlert() {
        try {
            List<Product> allProducts = productDAO.getAllProducts();
            List<String> lowStockLines = new ArrayList<>();

            for (Product product : allProducts) {
                System.out.println(
                        product.getId() + "|" +
                        product.getName() + "|" +
                        product.getQuantity() + "|" +
                        product.getPrice() + "|" +
                        product.getReorderLevel()
                );

                if (product.isLowStock()) {
                    lowStockLines.add(
                            String.format(" - %s (ID: %d) | Category: %s | Quantity: %d | Reorder Level: %d | Price: %.2f",
                                    product.getName(),
                                    product.getId(),
                                    product.getCategory().getName(),
                                    product.getQuantity(),
                                    product.getReorderLevel(),
                                    product.getPrice().doubleValue())
                    );
                }
            }

            if (!lowStockLines.isEmpty()) {
                sendLowStockAlert(lowStockLines);
            } else {
                System.out.println("All products are sufficiently stocked.");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void sendLowStockAlert(List<String> lowStockLines) {
        if (adminEmails == null || adminEmails.length == 0 || (adminEmails.length == 1 && adminEmails[0].equals("YOUR_GMAIL_ADDRESS_HERE"))) {
            System.err.println("Admin email not configured! Skipping low stock email alert.");
            return;
        }

        String subject = "LOW STOCK ALERT — Action Required";

        StringBuilder body = new StringBuilder();
        body.append("Hello,\n\n");
        body.append("The following products have dropped below their reorder level:\n\n");
        for (String line : lowStockLines) {
            body.append(line).append("\n");
        }
        body.append("\nPlease restock these items as soon as possible.\n\n");
        body.append("-- Inventory System");

        emailService.sendEmail(
                adminEmails,
                subject,
                body.toString()
        );

        System.out.println("Low stock alert sent for " + lowStockLines.size() + " product(s).");
    }
}
