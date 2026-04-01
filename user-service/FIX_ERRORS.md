# ⚠️ FIX JAVA & DATABASE ERRORS

## 🔧 Vấn đề

1. **Java version mismatch**: Hệ thống dùng Java 21 nhưng project cấu hình Java 17 → lỗi `TypeTag :: UNKNOWN`
2. **Maven chưa cài**: Không thể build project
3. **Cần chuyển từ H2 sang MariaDB**

## ✅ Giải pháp

### Bước 1: Cài đặt Maven

#### Windows (Command Prompt)

**Cách 1: Dùng Chocolatey (nếu có)**
```bash
choco install maven
```

**Cách 2: Tải từ Apache Maven**

1. Tải tại: https://maven.apache.org/download.cgi
   - Chọn **Binary zip archive** (apache-maven-3.9.x-bin.zip)

2. Giải nén vào: `C:\Program Files\maven`

3. Thêm vào **Environment Variables**:
   - Biến: `MAVEN_HOME`, Giá trị: `C:\Program Files\maven`
   - Thêm vào `PATH`: `C:\Program Files\maven\bin`

4. Kiểm tra:
```bash
mvn --version
```

### Bước 2: Cài đặt MariaDB

#### Windows

**Cách 1: Dùng Chocolatey**
```bash
choco install mariadb
```

**Cách 2: Tải installer**
1. Tải tại: https://mariadb.org/download/
2. Chạy installer
3. **Cấu hình mặc định**:
   - Username: `root`
   - Password: `root` (hoặc để trống, sau đó cập nhật)
   - Port: `3306`

4. Start MariaDB service:
```bash
# Windows Services
net start MariaDB
```

### Bước 3: Tạo Database

Sau khi MariaDB chạy, mở **Command Prompt** và chạy:

```bash
mysql -u root -p
# (nhập password nếu có, hoặc nhấn Enter nếu không có)
```

Trong MySQL prompt:
```sql
CREATE DATABASE user_service_db;
USE user_service_db;
SHOW TABLES;
EXIT;
```

### Bước 4: Build Project

```bash
cd c:\Users\PC\Desktop\userService

# Clean cache
mvn clean install

# Nếu lỗi, thử:
mvn clean install -U -DskipTests
```

### Bước 5: Chạy Service

```bash
mvn spring-boot:run
```

✅ Service sẽ chạy tại: **http://localhost:8081**

---

## 📋 Cấu hình đã cập nhật

**pom.xml:**
- ✅ Java 17 → **Java 21**
- ✅ H2 Database → **MariaDB 3.3.0**

**application.properties:**
- ✅ Database URL: `jdbc:mariadb://localhost:3306/user_service_db`
- ✅ Username: `root`, Password: `root`
- ✅ Hibernate dialect: `MariaDBDialect`
- ✅ DDL: `create-drop` → `update` (không xóa data)
- ✅ Connection pooling: HikariCP cấu hình tối ưu

---

## 🧪 Test MariaDB Connection

Sau khi service chạy:

```bash
# Login test
curl -X POST http://localhost:8081/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"john123"}'
```

Nếu nhật HTTP 200 + token → ✅ **MariaDB hoạt động!**

---

## ❌ Troubleshooting

### Lỗi: "mvn: command not found"
→ Maven chưa cài hoặc PATH chưa cập nhật. Restart Command Prompt sau khi cài.

### Lỗi: "Cannot connect to MariaDB"
```
1. Kiểm tra MariaDB service: net start MariaDB
2. Kiểm tra port: netstat -ano | findstr 3306
3. Kiểm tra username/password trong application.properties
```

### Lỗi: "Database user_service_db not found"
```bash
mysql -u root -p
mysql> CREATE DATABASE user_service_db;
```

### Lỗi: "ExceptionInInitializerError"
→ Đã fixed. Cần rebuild: `mvn clean install -U`

---

## 📝 Command Reference

```bash
# Build project
mvn clean install

# Build skip tests
mvn clean install -DskipTests

# Run service
mvn spring-boot:run

# Package to JAR
mvn clean package

# Update dependencies
mvn clean install -U

# View POMs
mvn pom:effective
```

---

## ✅ Kiểm tra Hoàn tất

Sau khi làm xong, service phải:
- ✅ Biên dịch thành công (không lỗi Java)
- ✅ Kết nối tới MariaDB
- ✅ Chạy tại port 8081
- ✅ Login/Register hoạt động

Chạy test:
```bash
curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "email":"test@test.com",
    "password":"test123",
    "confirmPassword":"test123",
    "fullName":"Test User"
  }'
```

Nếu thành công → `"success": true` ✅

---

**Đã cập nhật xong!** Sau khi hoàn tất các bước trên, hãy chạy:
```bash
mvn clean install
mvn spring-boot:run
```
