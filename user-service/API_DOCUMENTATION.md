# User Service API Documentation

## Overview
User Service quản lý:
- ✅ Đăng ký / Đăng nhập
- ✅ Phân quyền (USER / ADMIN)
- ✅ JWT Token Management
- ✅ Token Blacklist (Logout)
- ✅ Verify Token (cho các service khác)

**API Base URL**: `http://localhost:8081/api/users`

**Database**: `food_ordering_db` (shared)
**Tables**: `users`, `token_blacklist`

---

## 🔐 Authentication Endpoints

### 1. Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "nguyenvana",
  "email": "vana@company.vn",
  "password": "password123",
  "confirmPassword": "password123",
  "fullName": "Nguyen Van A",
  "phone": "0901000002"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": 9,
  "username": "nguyenvana",
  "email": "vana@company.vn",
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuZ3V5ZW52YW5hXG4iLCJ1c2VySWQiOjksImVtYWlsIjoiLCJzdWIiOiJuZ3V5ZW52YW5hIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3MDQxMjM0NTcsImV4cCI6MTcwNDIwOTg1N30.abc123def456"
}
```

---

### 2. Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "username": "nguyenvana",
  "password": "password123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "userId": 2,
  "username": "nguyenvana",
  "email": "vana@company.vn",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

---

### 3. Logout User
```http
POST /api/users/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200 OK)**:
```
Logged out successfully
```

---

### 4. Verify Token (cho các service khác gọi)
```http
POST /api/users/verify-token
Content-Type: application/json

"eyJhbGciOiJIUzI1NiJ9..."
```

**Response (200 OK - Valid)**:
```json
{
  "valid": true,
  "userId": 2,
  "username": "nguyenvana",
  "email": "vana@company.vn",
  "role": "USER",
  "message": "Token is valid"
}
```

**Response (200 OK - Invalid/Expired)**:
```json
{
  "valid": false,
  "message": "Invalid or expired token"
}
```

**Response (200 OK - Blacklisted)**:
```json
{
  "valid": false,
  "message": "Token has been blacklisted (user logged out)"
}
```

---

## 👥 User Endpoints

### 5. Get All Users
```http
GET /api/users
```

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@company.vn",
    "fullName": "Quan Tri Vien",
    "phone": "0901000001",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00"
  },
  {
    "id": 2,
    "username": "nguyenvana",
    "email": "vana@company.vn",
    "fullName": "Nguyen Van A",
    "phone": "0901000002",
    "role": "USER",
    "isActive": true,
    "createdAt": "2024-01-01T10:15:00"
  }
]
```

---

### 6. Get User by ID
```http
GET /api/users/{id}
```

**Example**: `GET /api/users/2`

**Response (200 OK)**:
```json
{
  "id": 2,
  "username": "nguyenvana",
  "email": "vana@company.vn",
  "fullName": "Nguyen Van A",
  "phone": "0901000002",
  "role": "USER",
  "isActive": true,
  "createdAt": "2024-01-01T10:15:00"
}
```

**Response (404 Not Found)**:
```
(empty body)
```

---

### 7. Get User by Username
```http
GET /api/users/username/{username}
```

**Example**: `GET /api/users/username/nguyenvana`

**Response (200 OK)**:
```json
{
  "id": 2,
  "username": "nguyenvana",
  "email": "vana@company.vn",
  "fullName": "Nguyen Van A",
  "phone": "0901000002",
  "role": "USER",
  "isActive": true,
  "createdAt": "2024-01-01T10:15:00"
}
```

---

## 📋 Sample Test Data

**Đã chuẩn bị sẵn trong food_ordering_db.sql**

| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | password | ADMIN | admin@company.vn |
| nguyenvana | password | USER | vana@company.vn |
| tranthib | password | USER | thib@company.vn |
| levanc | password | USER | vanc@company.vn |
| phamthid | password | USER | thid@company.vn |
| hoangtrane | password | USER | trane@company.vn |
| vuminh | password | USER | minhnv@company.vn |
| dothihoa | password | USER | hoadtt@company.vn |

---

## 🔄 Giao tiếp giữa Services

### Order Service gọi User Service để verify token:
```python
# Python
response = requests.post(
    'http://localhost:8081/api/users/verify-token',
    json=token,
    headers={'Content-Type': 'application/json'}
)
user_info = response.json()
if user_info['valid']:
    print(f"Valid token for user: {user_info['username']}")
```

### Java/Spring:
```java
@FeignClient("user-service")
public interface UserServiceClient {
    @PostMapping("/api/users/verify-token")
    TokenVerifyResponse verifyToken(@RequestBody String token);
}
```

---

## 🗄️ Database Schema

### users table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,      -- BCrypt hash
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('USER','ADMIN') DEFAULT 'USER',
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### token_blacklist table
```sql
CREATE TABLE token_blacklist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token LONGTEXT UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    blacklisted_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🚀 Quick Start

### 1. Chuẩn bị Database
```bash
# Tạo database và import data
mysql -u root -p < food_ordering_db.sql

# Hoặc qua HeidiSQL/MySQL Workbench

# Kiểm tra
mysql -u root -p
mysql> USE food_ordering_db;
mysql> SELECT COUNT(*) FROM users;
```

### 2. Build Project
```bash
cd c:\Users\PC\Desktop\userService
mvn clean install
```

### 3. Run Service
```bash
mvn spring-boot:run
```

### 4. Test API (sử dụng curl hoặc Postman)
```bash
# Test login
curl -X POST http://localhost:8081/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'

# Sẽ trả về token
# Dùng token này cho các request khác

# Test verify token
curl -X POST http://localhost:8081/api/users/verify-token \
  -H "Content-Type: application/json" \
  -d "eyJhbGciOiJIUzI1NiJ9..."

# Test logout
curl -X POST http://localhost:8081/api/users/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

---

## ⚙️ Configuration

**application.properties**:
```properties
# Server
server.port=8081
spring.application.name=user-service

# Database (shared food_ordering_db)
spring.datasource.url=jdbc:mariadb://localhost:3306/food_ordering_db
spring.datasource.username=root
spring.datasource.password=root

# JWT
jwt.secret=mynoonersecretkeyforfoodorderingsystemminibysoftware
jwt.expiration=86400000  # 24 hours in ms

# JPA
spring.jpa.hibernate.ddl-auto=update
```

---

## 🔗 Integration Points

### Order Service (port 8083) dùng User Service:
- ✅ Verify token trước khi tạo order
- ✅ Lấy thông tin user từ token
- ✅ Lưu user_id vào bảng orders

### Payment Service (port 8084) dùng User Service:
- ✅ Verify token trước khi tạo payment
- ✅ Lấy user_id từ token để tạo payment

---

## 📝 Notes

1. **Token Format**: JWT với format `Bearer {token}`
2. **Token Expiration**: 24 giờ (86400000 ms)
3. **Password**: Được hash bằng BCrypt trong database
4. **Token Blacklist**: Khi logout, token sẽ được thêm vào blacklist
5. **CORS**: Cho phép từ tất cả origins (`*`)

---

## ❌ Error Handling

| Status | Message | Ý nghĩa |
|--------|---------|---------|
| 201 | User registered successfully | Đăng ký thành công |
| 200 | Login successful | Đăng nhập thành công |
| 400 | Username already exists | Username đã tồn tại |
| 400 | Email already exists | Email đã tồn tại |
| 400 | Passwords do not match | Password không khớp |
| 401 | Invalid username or password | Thông tin đăng nhập sai |
| 401 | User account is inactive | Tài khoản đã bị vô hiệu hóa |
| 404 | User not found | Không tìm thấy user |

---

**Phiên bản**: 1.0.0
**Ngôn ngữ**: Java 21
**Framework**: Spring Boot 3.2.4
**Database**: MariaDB / MySQL 8.0+
