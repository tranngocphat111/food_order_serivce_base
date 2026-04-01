# User Service - Mini Food Ordering System

User Service là một Spring Boot 3 microservice quản lý người dùng cho hệ thống đặt món ăn nội bộ.

## Tính năng

✅ Đăng ký người dùng (Register)
✅ Đăng nhập (Login)
✅ Lấy danh sách tất cả người dùng
✅ Lấy thông tin người dùng theo ID hoặc username
✅ JWT Token cho xác thực
✅ Phân quyền USER/ADMIN
✅ H2 In-memory Database

## Công nghệ sử dụng

- **Spring Boot 3.2.4**
- **Spring Security** - Mã hóa mật khẩu BCrypt
- **JWT (jjwt 0.12.5)** - Token authentication
- **Spring Data JPA** - ORM
- **H2 Database** - In-memory database
- **Lombok** - Giảm boilerplate code
- **Maven** - Build tool

## Cấu trúc dự án

```
src/main/java/com/foodorder/user/
├── controller/     - REST API endpoints
├── service/        - Business logic
├── repository/     - Database access (JPA)
├── entity/         - JPA entities
├── dto/            - Data Transfer Objects
├── util/           - Utility classes (JWT)
└── config/         - Configuration classes

src/main/resources/
└── application.properties  - Application configuration
```

## API Endpoints

### 1. Đăng ký người dùng
```
POST /api/users/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "pass123",
  "confirmPassword": "pass123",
  "fullName": "John Doe"
}

Response:
{
  "userId": 1,
  "username": "john",
  "email": "john@example.com",
  "token": "eyJhbGc...",
  "success": true,
  "message": "User registered successfully"
}
```

### 2. Đăng nhập
```
POST /api/users/login
Content-Type: application/json

{
  "username": "john",
  "password": "pass123"
}

Response:
{
  "userId": 1,
  "username": "john",
  "email": "john@example.com",
  "token": "eyJhbGc...",
  "success": true,
  "message": "Login successful"
}
```

### 3. Lấy tất cả người dùng
```
GET /api/users

Response:
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
  ...
]
```

### 4. Lấy người dùng theo ID
```
GET /api/users/{id}

Response:
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

### 5. Lấy người dùng theo username
```
GET /api/users/username/{username}

Response: (same as above)
```

### 6. Xác thực token
```
POST /api/users/verify-token
Content-Type: text/plain

eyJhbGc...

Response: true/false
```

## Cài đặt và chạy

### 1. Yêu cầu
- JDK 17+
- Maven 3.6+
- Git

### 2. Clone/Download Project
```bash
cd c:/Users/PC/Desktop/userService
```

### 3. Build Project
```bash
mvn clean install
```

### 4. Chạy Service
```bash
mvn spring-boot:run
```

Service sẽ chạy tại: `http://localhost:8081`

### 5. Kiểm tra H2 Console (optional)
Truy cập: `http://localhost:8081/h2-console`
- JDBC URL: `jdbc:h2:mem:userservicedb`
- User: `sa`
- Password: (để trống)

## Dữ liệu mẫu được tạo sẵn

Service tự động tạo 3 user khi khởi động:

| Username | Password | Role  | Email                    |
|----------|----------|-------|--------------------------|
| admin    | admin123 | ADMIN | admin@foodorder.com      |
| testuser | test123  | USER  | testuser@example.com     |
| john     | john123  | USER  | john@example.com         |

## Cấu hình

**application.properties** chứa các cấu hình:
- `server.port=8081` - Cổng chạy service
- `jwt.secret` - Secret key cho JWT
- `jwt.expiration` - Thời gian hết hạn token (86400000ms = 24 giờ)
- `spring.jpa.hibernate.ddl-auto=create-drop` - Tạo table tự động

## Ghi chú quan trọng

1. **CORS được bật** - Có thể gọi từ frontend trên domain khác
2. **Security được cấu hình** - Chỉ các endpoint auth được cho phép anonymous
3. **Password được mã hóa** - Sử dụng BCrypt (cost = 10)
4. **JWT Token** - Hết hạn sau 24 giờ
5. **Logging** - DEBUG level cho package `com.foodorder.user`

## Testing với Postman/cURL

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

### Get All Users
```bash
curl -X GET http://localhost:8081/api/users
```

## Kết nối với các dịch vụ khác

Khi Food Service, Order Service, Payment Service cần kiểm tra user, gọi:

```bash
# Kiểm tra user tồn tại
GET http://192.168.x.x:8081/api/users/{userId}

# Xác thực token
POST http://192.168.x.x:8081/api/users/verify-token
```

## Troubleshooting

**Lỗi: Port 8081 đã được sử dụng**
```bash
# Đổi port trong application.properties
server.port=8081
```

**Lỗi: Maven dependencies không tải**
```bash
mvn clean install -U
```

**JWT token không hợp lệ**
```
Kiểm tra:
- jwt.secret trong application.properties
- Thời gian server có đúng không
- Token đã hết hạn chưa
```

## Giai đoạn tiếp theo (Homework)

- [ ] Dockerize service
- [ ] Tạo docker-compose
- [ ] Integration tests
- [ ] API documentation (Swagger)
- [ ] Database migration (Flyway/Liquibase)

## Tác giả

Người 2 - User Service Developer

---

**Phiên bản:** 1.0.0
**Ngày:** 2026-04-01
**Spring Boot:** 3.2.4
**Java:** 17
