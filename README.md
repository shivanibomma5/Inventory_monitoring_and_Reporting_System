# Inventory Monitoring and Reporting System

A full-stack inventory monitoring application built using **Spring Boot** and **React**. This project helps manage products, stock, suppliers, and users with role-based access and reporting features.

---

##  Table of Contents

- Features  
- Tech Stack  
- Project Structure  
- Architecture Overview  
- Database Schema  
- API Reference  
- Security & Roles  
- Getting Started  

---

##  Features

### 🔹 Backend
- JWT Authentication (Login/Register)
- Role-Based Access (ADMIN, SUPPLIER, CUSTOMER)
- Product Management (Add, Update, Delete)
- Stock Management (Increase / Reduce)
- Category & Supplier Management
- Global Exception Handling
- Email Reports for Inventory
- Input Validation

###  Frontend
- Login & Registration UI
- Dashboard with Reports
- Product Management Interface
- Role-based UI Access
- Alerts for Low Stock

---

##  Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA (Hibernate)
- MySQL

### Frontend
- React JS
- Axios
- HTML/CSS

---

## Project Structure


backend/
│
├── database/
│ └── DatabaseConnection.java
│
├── inventory/
│ ├── authservice/
│ ├── config/
│ ├── controller/
│ │ ├── AuthController.java
│ │ ├── UserController.java
│ │ ├── GlobalExceptionHandler.java
│ │
│ ├── dao/
│ │ └── ProductDAO.java
│ │
│ ├── database_system/
│ │ ├── entity/
│ │ │ ├── Product.java
│ │ │ ├── Category.java
│ │ │ ├── Supplier.java
│ │ │ └── Transaction.java
│ │ │
│ │ ├── repository/
│ │ ├── ProductRepository.java
│ │ ├── CategoryRepository.java
│ │ └── SupplierRepository.java
│
│ ├── dto/
│ │ ├── AuthRequest.java
│ │ ├── AuthResponse.java
│ │ └── RegisterRequest.java
│
│ ├── entity/
│ │ ├── User.java
│ │ └── Role.java
│
│ ├── Report/
│ │ ├── EmailService.java
│ │ └── InventoryReportService.java
│
│ ├── repository/
│ │ └── UserRepository.java
│
│ ├── security/
│ │ ├── CorsConfig.java
│ │ ├── JwtAuthenticationFilter.java
│ │ ├── SecurityBeansConfig.java
│ │ └── WebSecurityConfig.java
│
│ ├── service/
│ │ ├── InventoryService.java
│ │ ├── ProductService.java
│ │ └── validation/
│
│ ├── utils/
│ │ └── DatabaseMigration.java
│
│ └── ServerApplication.java
│
├── resources/
│ ├── application.properties
│ └── stockmanagement.sql
│
└── pom.xml

frontend/
└── React application files


---

##  Architecture Overview


React Frontend
↓
REST API (Spring Boot)
↓
Service Layer
↓
DAO / Repository Layer
↓
MySQL Database


---

## 🗄️ Database Schema

Main Tables:
- Users
- Products
- Categories
- Suppliers
- Transactions

Relationships:
- Product → Category
- Product → Supplier
- Transaction → Product

---

## 🔗 API Reference

### Authentication
- `POST /auth/register`
- `POST /auth/login`

### Products
- `GET /api/products`
- `POST /api/product`
- `DELETE /api/product/{id}`

### Stock
- `POST /api/increase/{id}/{qty}`
- `POST /api/reduce/{id}/{qty}`

---

##  Security & Roles

- JWT-based authentication
- Roles:
  - ADMIN
  - SUPPLIER
  - CUSTOMER

### Permissions:
- ADMIN → Full access  
- SUPPLIER → Manage products  
- CUSTOMER → View only  

---

##  Getting Started

### Prerequisites
- Java 17+
- Node.js
- MySQL

---

###  Backend Setup

```bash
cd backend
mvn spring-boot:run
