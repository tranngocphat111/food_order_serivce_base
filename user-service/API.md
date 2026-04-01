# API Reference - User Service

## Base URL
```
http://localhost:8081
```

## Endpoints

### 1️⃣ Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "pass123",
  "confirmPassword": "pass123",
  "fullName": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "userId": 1,
  "username": "john",
  "email": "john@example.com",
  "token": "eyJhbGc...",
  "success": true,
  "message": "User registered successfully"
}
```

**Validation:**
- Username must be unique
- Email must be unique
- Password >= 6 characters
- Password must match confirmPassword

---

### 2️⃣ Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "username": "john",
  "password": "pass123"
}
```

**Response (200 OK):**
```json
{
  "userId": 1,
  "username": "john",
  "email": "john@example.com",
  "token": "eyJhbGc...",
  "success": true,
  "message": "Login successful"
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

---

### 3️⃣ Get All Users
```http
GET /api/users
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "USER",
    "active": true,
    "createdAt": "2026-04-01T10:00:00"
  },
  {
    "id": 2,
    "username": "admin",
    "email": "admin@foodorder.com",
    "fullName": "Admin User",
    "role": "ADMIN",
    "active": true,
    "createdAt": "2026-04-01T09:00:00"
  }
]
```

---

### 4️⃣ Get User by ID
```http
GET /api/users/{id}
```

**Example:**
```http
GET /api/users/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "active": true,
  "createdAt": "2026-04-01T10:00:00"
}
```

**Error (404 Not Found):**
```json
null
```

---

### 5️⃣ Get User by Username
```http
GET /api/users/username/{username}
```

**Example:**
```http
GET /api/users/username/john
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "active": true,
  "createdAt": "2026-04-01T10:00:00"
}
```

---

### 6️⃣ Verify Token
```http
POST /api/users/verify-token
Content-Type: text/plain

eyJhbGciOiJIUzUxMiJ9...
```

**Response (200 OK):**
```
true
```

or

```
false
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK - Request successful |
| 201  | Created - Resource created |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Invalid credentials |
| 404  | Not Found - Resource not found |
| 500  | Internal Server Error |

---

## Headers

### Request Headers
```
Content-Type: application/json
Accept: application/json
```

### Response Headers
```
Content-Type: application/json;charset=UTF-8
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## CORS Configuration

**Allowed Origins:** All (`*`)
**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS
**Allowed Headers:** All
**Max Age:** 3600 seconds

---

## Error Responses

### Register Errors

**Username already exists:**
```json
{
  "success": false,
  "message": "Username already exists"
}
```

**Email already exists:**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**Password mismatch:**
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

**Password too short:**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

### Login Errors

**Invalid credentials:**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

**User inactive:**
```json
{
  "success": false,
  "message": "User account is inactive"
}
```

---

## cURL Examples

### Register
```bash
curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "alice123",
    "confirmPassword": "alice123",
    "fullName": "Alice Smith"
  }'
```

### Login
```bash
curl -X POST http://localhost:8081/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "john123"
  }'
```

### Get all users
```bash
curl -X GET http://localhost:8081/api/users \
  -H "Content-Type: application/json"
```

### Get user by ID
```bash
curl -X GET http://localhost:8081/api/users/1 \
  -H "Content-Type: application/json"
```

### Get user by username
```bash
curl -X GET http://localhost:8081/api/users/username/john \
  -H "Content-Type: application/json"
```

### Verify token
```bash
curl -X POST http://localhost:8081/api/users/verify-token \
  -H "Content-Type: text/plain" \
  -d "eyJhbGc..."
```

---

## Integration Guide

### Gọi từ Food Service

**Kiểm tra user tồn tại:**
```java
// Gọi User Service
RestTemplate restTemplate = new RestTemplate();
UserResponse user = restTemplate.getForObject(
  "http://192.168.x.x:8081/api/users/{id}",
  UserResponse.class,
  userId
);
```

### Gọi từ Order Service

**Validate user trước khi tạo order:**
```bash
curl -X GET http://192.168.x.x:8081/api/users/{userId}
```

### Gọi từ Payment Service

**Verify token trước xử lý payment:**
```bash
curl -X POST http://192.168.x.x:8081/api/users/verify-token \
  -H "Content-Type: text/plain" \
  -d "{token}"
```

---

## Notes

- Tất cả timestamp sử dụng ISO 8601 format: `YYYY-MM-DDTHH:mm:ss`
- JWT Token hết hạn sau 24 giờ (86400000ms)
- Password được mã hóa BCrypt, không thể decode
- CORS được bật cho tất cả origins (có thể thay đổi trong SecurityConfig)

---

**Version:** 1.0.0
**Last Updated:** 2026-04-01
