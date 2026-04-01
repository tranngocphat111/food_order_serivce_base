# 🚀 QUICK START - User Service

**Chỉ 5 bước để chạy User Service & test API!**

---

## 📋 Điều kiện tiên quyết

- ✅ Java 21+
- ✅ Maven 3.8.0+
- ✅ MariaDB (chạy on port 3306)
- ✅ Postman hoặc Curl

---

## ⚡ 5 Bước Để Chạy

### Bước 1: Setup Database (2 phút)

**Command Prompt** (Admin):
```cmd
mysql -u root -p
```

**Nhập password**: `root`

**Trong MySQL prompt**:
```sql
CREATE DATABASE food_ordering_db CHARACTER SET utf8mb4;
EXIT;
```

**Import dữ liệu**:
```cmd
cd c:\Users\PC\Desktop\userService
mysql -u root -p food_ordering_db < food_ordering_db.sql
```

✅ Database ready!

---

### Bước 2: Build Project (3 phút)

```cmd
cd c:\Users\PC\Desktop\userService
mvn clean install -DskipTests
```

⏳ Đợi tới khi thấy `BUILD SUCCESS`

---

### Bước 3: Chạy Service (1 phút)

```cmd
mvn spring-boot:run
```

**Logs sẽ hiện**:
```
Started UserServiceApplication in 5.234 seconds
✅ Database initialized with 8 users
Server running on http://localhost:8081
```

✅ Service chạy xong! **Đừng đóng terminal này**

---

### Bước 4: Import API Collection vào Postman (1 phút)

1. Mở **Postman**
2. **File → Import**
3. Chọn file: `User-Service-API.postman_collection.json`
4. **Import**

✅ Postman ready!

---

### Bước 5: Test Các API (2 phút)

Trong Postman, chạy lần lượt:

1. **Login** → Copy token từ response
   ```
   username: admin
   password: password
   ```

2. **Verify Token** → Paste token
   ```
   Token sẽ validate thành công
   ```

3. **Get All Users** → Xem danh sách 8 users

4. **Logout** → Blacklist token
   ```
   Paste token từ Authorization header
   ```

5. **Verify Token lại** → Token bị blacklist
   ```
   Thấy: "valid": false, "message": "Token has been blacklisted"
   ```

✅ **Hoàn thành! Tất cả API đều hoạt động!**

---

## 🧪 Nếu Dùng Curl (Thay Vì Postman)

**Terminal / Command Prompt**:

```cmd
# Test 1: Login
curl -X POST http://localhost:8081/api/users/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"password\"}"

# Copy token từ response

# Test 2: Verify Token
curl -X POST http://localhost:8081/api/users/verify-token ^
  -H "Content-Type: application/json" ^
  -d "\"TOKEN_HỎI_COPY_ĐỢI_BƯỚC_1\""

# Test 3: Get All Users
curl -X GET http://localhost:8081/api/users
```

📖 **Chi tiết**: Xem `CURL_TEST_COMMANDS.md`

---

## 📊 Sample Users Có Sẵn

| Username | Password | Role |
|----------|----------|------|
| admin | password | ADMIN |
| nguyenvana | password | USER |
| tranthib | password | USER |
| (+ 5 users khác) | password | USER |

---

## 🔗 URLs & Endpoints

- **Service URL**: `http://localhost:8081`
- **API Base**: `http://localhost:8081/api/users`

**Main Endpoints**:
- `POST /api/users/register` - Đăng ký
- `POST /api/users/login` - Đăng nhập
- `POST /api/users/logout` - Đăng xuất
- `GET /api/users` - Lấy tất cả users
- `GET /api/users/{id}` - Lấy user by ID
- `GET /api/users/username/{username}` - Lấy user by username
- `POST /api/users/verify-token` - Verify token (dùng cho other services)

---

## ❌ Lỗi Thường Gặp

### "Connection refused"
```
→ Service chưa chạy
→ Chạy: mvn spring-boot:run (trong tab terminal khác)
```

### "Cannot connect to MariaDB"
```
→ MariaDB chưa chạy
→ Chạy: net start MariaDB (Command Prompt - Admin)
```

### "Database not found"
```
→ Bước 1 chưa hoàn thành
→ Chạy lại: CREATE DATABASE food_ordering_db;
→ Import SQL data
```

### "Port 8081 already in use"
```
→ Giết process đang chiếm port
→ taskkill /PID {PID} /F
→ Hoặc đổi port trong application.properties
```

---

## 📁 File Tài Liệu

- `POSTMAN_TEST_GUIDE.md` - Chi tiết test Postman
- `CURL_TEST_COMMANDS.md` - Chi tiết test Curl
- `API_DOCUMENTATION.md` - Đầy đủ API reference
- `SETUP.md` - Hướng dẫn setup chi tiết
- `README.md` - Tổng quan project

---

## ✅ Kiểm Tra Hoàn Thành

Sau 5 bước trên, bạn sẽ có:

- ✅ Database với 8 sample users
- ✅ User Service chạy port 8081
- ✅ API endpoints hoạt động
- ✅ JWT token verification working
- ✅ Token blacklist (logout) working

---

## 🔄 Lần Sau Chạy Lại

Nếu tắt máy và muốn chạy lại:

```cmd
# Terminal 1: Start MariaDB
net start MariaDB

# Terminal 2: Run User Service
cd c:\Users\PC\Desktop\userService
mvn spring-boot:run

# Terminal 3: Open Postman & test
(Postman sẽ vẫn có collection từ lần trước)
```

---

## 🎓 Tiếp Theo

Sau khi User Service chạy OK:

1. **Frontend** (Người 1) - Gọi login/register API
2. **Food Service** (Người 3) - Tạo port 8082
3. **Order Service** (Người 4) - Gọi verify-token từ User Service
4. **Payment Service** (Người 5) - Tương tự Order Service

---

**⏱️ Tổng thời gian**: ~15-20 phút
**🎯 Kết quả**: User Service fully operational ✅

---

**Nếu gặp vấn đề**: Xem file `TROUBLESHOOTING.md` hoặc docs chi tiết
