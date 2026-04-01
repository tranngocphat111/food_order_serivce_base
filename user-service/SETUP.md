# HƯỚNG DẪN CHẠY USER SERVICE

## 📋 Yêu cầu

- JDK 17 trở lên
- Maven 3.6+
- IDE: IntelliJ IDEA / VS Code / Eclipse (optional)

## 🚀 Bước 1: Build Project

Mở Command Prompt / Terminal, điều hướng tới thư mục project:

```bash
cd c:\Users\PC\Desktop\userService
```

Build project:
```bash
mvn clean install
```

✅ Sẽ mất khoảng 2-5 phút tùy tốc độ internet (lần đầu tải dependencies)

## 🎯 Bước 2: Chạy Service

```bash
mvn spring-boot:run
```

Nếu thành công, sẽ thấy output tương tự:
```
2026-04-01 10:30:15.123  INFO 12345 --- [main] c.f.user.UserServiceApplication : Started UserServiceApplication in 5.123 seconds
2026-04-01 10:30:15.234  INFO 12345 --- [main] c.f.user.config.DataInitializer : Admin user created: admin / admin123
2026-04-01 10:30:15.235  INFO 12345 --- [main] c.f.user.config.DataInitializer : Test user created: testuser / test123
```

✅ Service chạy tại: **http://localhost:8081**

## 🧪 Bước 3: Test API

### Cách 1: Dùng Postman
1. Mở Postman
2. Tạo request mới (POST)
3. URL: `http://localhost:8081/api/users/login`
4. Headers: `Content-Type: application/json`
5. Body (JSON):
```json
{
  "username": "john",
  "password": "john123"
}
```
6. Nhấn Send

### Cách 2: Dùng cURL (Command Line)

**Login:**
```bash
curl -X POST http://localhost:8081/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john\",\"password\":\"john123\"}"
```

**Register user mới:**
```bash
curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"alice\",\"email\":\"alice@example.com\",\"password\":\"alice123\",\"confirmPassword\":\"alice123\",\"fullName\":\"Alice\"}"
```

**Get all users:**
```bash
curl http://localhost:8081/api/users
```

**Get user by ID:**
```bash
curl http://localhost:8081/api/users/1
```

### Cách 3: Dùng VS Code REST Client Extension

Tạo file `test.rest`:

```rest
### Login
POST http://localhost:8081/api/users/login
Content-Type: application/json

{
  "username": "john",
  "password": "john123"
}

### Register
POST http://localhost:8081/api/users/register
Content-Type: application/json

{
  "username": "bob",
  "email": "bob@example.com",
  "password": "bob123",
  "confirmPassword": "bob123",
  "fullName": "Bob"
}

### Get All Users
GET http://localhost:8081/api/users

### Get User by ID
GET http://localhost:8081/api/users/1

### Get User by Username
GET http://localhost:8081/api/users/username/john
```

Nhấn "Send Request" trên mỗi request.

## 📊 Dữ liệu mẫu

**User được tạo sẵn khi khởi động:**

| Username | Password | Email                   | Role  |
|----------|----------|-------------------------|-------|
| admin    | admin123 | admin@foodorder.com     | ADMIN |
| testuser | test123  | testuser@example.com    | USER  |
| john     | john123  | john@example.com        | USER  |

## 🔧 Cấu hình Server

**File:** `src/main/resources/application.properties`

```properties
# Cổng chạy
server.port=8081

# Secret key JWT (không nên thay đổi)
jwt.secret=mynoonersecretkeyforfoodorderingsystemminibysoftware

# Thời gian hết hạn token (24 giờ)
jwt.expiration=86400000

# Database (H2 in-memory)
spring.datasource.url=jdbc:h2:mem:userservicedb
```

## 🌐 Xem H2 Database (Optional)

Truy cập: **http://localhost:8081/h2-console**

- JDBC URL: `jdbc:h2:mem:userservicedb`
- User: `sa`
- Password: (để trống, nhấn Connect)

## 🔐 JWT Token Format

Sau khi login/register thành công, sẽ nhận được token:

```json
{
  "success": true,
  "message": "Login successful",
  "userId": 1,
  "username": "john",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huIiwidXNlcklkIjoxLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcwNjc1MDYxNSwiZXhwIjoxNzA2ODM3MDE1fQ...."
}
```

Token có thể dùng để:
- Xác thực request tới các service khác
- Validate bằng endpoint `/api/users/verify-token`

## ⚠️ Troubleshooting

**Lỗi: Cannot find symbol / compilation error**
- Đảm bảo JDK 17+ đã cài
- Chạy: `mvn clean install -U`

**Lỗi: Port 8081 already in use**
- Đổi port trong `application.properties`
- Hoặc tắt service khác đang chiếm port

**Lỗi: Database connection refused**
- H2 là in-memory, tự động tạo, bình thường không lỗi
- Nếu có lỗi, xóa folder `target/` và build lại

**Login không thành công**
- Kiểm tra username/password đúng chưa (case-sensitive)
- Dùng user test: `john` / `john123`

## 📝 Khi kết thúc

Nhấn `Ctrl+C` để dừng service.

---

## ✅ Checklist hoàn thành

- [ ] Build project: `mvn clean install`
- [ ] Chạy service: `mvn spring-boot:run`
- [ ] Test login: POST /api/users/login
- [ ] Test register: POST /api/users/register
- [ ] Test get users: GET /api/users
- [ ] Service chạy tại port 8081

Nếu tất cả xanh → **User Service đã sẵn sàng!** ✨
