package com.inventory;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE users MODIFY role VARCHAR(50)");
            System.out.println("✅ Database migration: Changed 'role' column type to VARCHAR(50)");

            // Foolproof Categories Update
            jdbcTemplate.execute("INSERT IGNORE INTO categories (id, name, description) VALUES (1, 'temp_c1', '')");
            jdbcTemplate.execute("INSERT IGNORE INTO categories (id, name, description) VALUES (2, 'temp_c2', '')");
            jdbcTemplate.execute("INSERT IGNORE INTO categories (id, name, description) VALUES (3, 'temp_c3', '')");
            jdbcTemplate.execute("INSERT IGNORE INTO categories (id, name, description) VALUES (4, 'temp_c4', '')");
            
            // First pass: rename all to temporary names to avoid unique constraint violations
            jdbcTemplate.execute("UPDATE categories SET name = CONCAT('temp_c_', id)");
            
            // Second pass: set exact names
            jdbcTemplate.execute("UPDATE categories SET name = 'Electronics', description = 'Electronic items' WHERE id = 1");
            jdbcTemplate.execute("UPDATE categories SET name = 'Furniture', description = 'Home and office furniture' WHERE id = 2");
            jdbcTemplate.execute("UPDATE categories SET name = 'Groceries', description = 'Daily groceries and food' WHERE id = 3");
            jdbcTemplate.execute("UPDATE categories SET name = 'Stationery', description = 'Office and school supplies' WHERE id = 4");

            // Foolproof Supplier Update
            jdbcTemplate.execute("INSERT IGNORE INTO supplier (id, name, contact_email, phone) VALUES (1, 'temp_s1', '', '')");
            jdbcTemplate.execute("INSERT IGNORE INTO supplier (id, name, contact_email, phone) VALUES (2, 'temp_s2', '', '')");
            jdbcTemplate.execute("INSERT IGNORE INTO supplier (id, name, contact_email, phone) VALUES (3, 'temp_s3', '', '')");
            jdbcTemplate.execute("INSERT IGNORE INTO supplier (id, name, contact_email, phone) VALUES (4, 'temp_s4', '', '')");
            
            // First pass: rename all to temporary names
            jdbcTemplate.execute("UPDATE supplier SET name = CONCAT('temp_s_', id)");
            
            // Second pass: set exact names
            jdbcTemplate.execute("UPDATE supplier SET name = 'ABC Traders', contact_email = 'abc@traders.com', phone = '1234567890' WHERE id = 1");
            jdbcTemplate.execute("UPDATE supplier SET name = 'Reliance Suppliers', contact_email = 'reliance@suppliers.com', phone = '0987654321' WHERE id = 2");
            jdbcTemplate.execute("UPDATE supplier SET name = 'Global Distributors', contact_email = 'global@distributors.com', phone = '1112223333' WHERE id = 3");
            jdbcTemplate.execute("UPDATE supplier SET name = 'Local Vendor', contact_email = 'local@vendor.com', phone = '4445556666' WHERE id = 4");

            System.out.println("✅ Database migration: Seeded correct categories and suppliers");
        } catch (Exception e) {
            System.err.println("⚠️ Database migration skipped/failed: " + e.getMessage());
        }
    }
}
