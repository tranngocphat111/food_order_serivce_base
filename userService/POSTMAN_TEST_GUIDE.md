# User Service - Postman Test Guide

## 📦 Import Collection

1. **Mở Postman**
2. **File → Import**
3. **Chọn file**: `User-Service-API.postman_collection.json`
4. **Click Import**

---

## 🔧 Setup Environment Variables

Trong Postman, các biến còn chưa được cấu hình. Bạn có 2 cách:

### Cách 1: Setup qua UI (Recommended)
1. Mở **Environment** (tab bên trái)
2. Click **Create + / New Environment**
3. Tên: `User Service Dev`
4. Thêm các biến:

| VARIABLE | VALUE | TYPE |
|----------|-------|------|
| `base_url` | `http://localhost:8081` | string |
| `token` | (để trống) | string |
| `userId` | (để trống) | string |
| `username` | (để trống) | string |

5. Click **Save**
6. Chọn environment này từ dropdown

### Cách 2: Sửa JSON (Advanced)
Mở file `User-Service-API.postman_collection.json` và thay đổi `variable` section.

---

## 🧪 Test Các API (Lần lượt)

### **Test 1: Register New User**
```
POST /api/users/register
```

**Request Body**:
```json
{
  "username": "testuser123",
  "email": "testuser123@company.vn",
  "password": "password123",
  "confirmPassword": "password123",
  "fullName": "Test User",
  "phone": "0909999999"
}
```

**Expected Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": 9,
  "username": "testuser123",
  "email": "testuser123@company.vn",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

✅ **Token sẽ tự save vào biến `{{token}}`** (từ test script)

---

### **Test 2: Login**
```
POST /api/users/login
```

**Request Body**:
```json
{
  "username": "admin",
  "password": "password"
}
```

**Expected Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "userId": 1,
  "username": "admin",
  "email": "admin@company.vn",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

✅ **Token sẽ tự save vào biến `{{token}}`**

---

### **Test 3: Verify Token**
```
POST /api/users/verify-token
```

**Request Body** (ghi token vừa lấy được):
```
"eyJhbGciOiJIUzI1NiJ9..."
```

**Hoặc dùng variable**:
```
"{{token}}"
```

**Expected Response (200 - Valid)**:
```json
{
  "valid": true,
  "userId": 1,
  "username": "admin",
  "email": "admin@company.vn",
  "role": "USER",
  "message": "Token is valid"
}
```

---

### **Test 4: Get All Users**
```
GET /api/users
```

**Expected Response (200)**:
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
  // ... more users
]
```

---

### **Test 5: Get User by ID**
```
GET /api/users/2
```

**Expected Response (200)**:
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

### **Test 6: Get User by Username**
```
GET /api/users/username/admin
```

**Expected Response (200)**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@company.vn",
  "fullName": "Quan Tri Vien",
  "phone": "0901000001",
  "role": "ADMIN",
  "isActive": true,
  "createdAt": "2024-01-01T10:00:00"
}
```

---

### **Test 7: Logout**
```
POST /api/users/logout
```

**Header**:
```
Authorization: Bearer {{token}}
```

**Expected Response (200)**:
```
Logged out successfully
```

✅ **Token sẽ được blacklist. Nếu verify lại sẽ báo lỗi!**

---

### **Test 8: Verify Blacklisted Token**
```
POST /api/users/verify-token
```

**Request Body**:
```
"{{token}}"
```

**Expected Response (200)**:
```json
{
  "valid": false,
  "message": "Token has been blacklisted (user logged out)"
}
```

---

## 📊 Sample Test Users (Sẵn có trong DB)

Sử dụng các user này để test:

| Username | Password | Role |
|----------|----------|------|
| admin | password | ADMIN |
| nguyenvana | password | USER |
| tranthib | password | USER |
| levanc | password | USER |
| phamthid | password | USER |
| hoangtrane | password | USER |
| vuminh | password | USER |
| dothihoa | password | USER |

---

## 🚀 Quick Test Flow

1. **Đăng nhập** → Login endpoint → Lấy token
2. **Verify token** → Verify-Token endpoint → Token hợp lệ?
3. **Lấy thông tin** → Get All Users → Xem danh sách
4. **Đăng xuất** → Logout endpoint → Token bị blacklist
5. **Verify lại** → Verify-Token endpoint → Token không hợp lệ ✓

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Connection refused - localhost:8081"
**Giải pháp**:
```bash
# Kiểm tra service đã chạy chưa
curl http://localhost:8081/api/users

# Chạy service
cd c:\Users\PC\Desktop\userService
mvn spring-boot:run
```

### Issue 2: "Invalid or expired token"
**Giải pháp**:
- Token đã hết hạn (24 giờ)
- Token đã bị logout (blacklist)
- Token sai format
→ Login lại để lấy token mới

### Issue 3: "Token has been blacklisted"
**Giải pháp**:
- Bạn đã logout rồi
- Login lại để lấy token mới

### Issue 4: "Username already exists"
**Giải pháp**:
- Thay đổi username (vd: testuser2, testuser3, ...)
- Hoặc dùng user có sẵn để login

### Issue 5: "Passwords do not match"
**Giải pháp**:
- `password` và `confirmPassword` phải giống nhau

---

## 📝 Test Scenarios

### Scenario 1: Người dùng mới đăng ký
```
1. POST /register (testuser, email, password)
   → Response: 201, token lưu tự động
2. GET /users
   → Response: 200, thấy testuser trong danh sách
3. POST /verify-token
   → Response: 200, valid=true, userId_mới
```

### Scenario 2: Đăng nhập & Logout
```
1. POST /login (admin, password)
   → Response: 200, token lưu tự động
2. POST /logout (Bearer token)
   → Response: 200 "Logged out successfully"
3. POST /verify-token
   → Response: 200, valid=false (blacklisted)
4. POST /login lại
   → Response: 200, token mới lưu tự động
```

### Scenario 3: Lấy thông tin user
```
1. GET /users
   → Response: 200, danh sách 8 users
2. GET /users/2
   → Response: 200, thông tin user id 2
3. GET /users/username/nguyenvana
   → Response: 200, thông tin user nguyenvana
```

---

## 🎯 Automation Scripts (Test)

Postman sẽ tự động:
1. **Sau khi Register** → Lưu token, userId, username vào biến
2. **Sau khi Login** → Lưu token, userId, username vào biến
3. **Các API khác** → Dùng biến `{{token}}` tự động

---

## 🔍 Debug Tips

### View Token Details
Token là JWT. Decode tại: https://jwt.io

Paste token vào, sẽ thấy:
```json
{
  "sub": "admin",        // username
  "userId": 1,
  "email": "admin@company.vn",
  "role": "ADMIN",
  "iat": 1704124234,     // issued at
  "exp": 1704210634      // expires at
}
```

### Check Response Headers
- `Content-Type: application/json`
- `Content-Length: xxx`
- Không có custom headers

### View Request/Response Details
Postman auto-logs:
- **Request**: Method, URL, Headers, Body
- **Response**: Status, Headers, Body, Time

---

## ✅ Checklist Trước Deploy

Sau khi test xong, kiểm tra:

- [ ] Register endpoint hoạt động
- [ ] Login endpoint trả về token hợp lệ
- [ ] Token có thể verify được
- [ ] Get all users trả về 8 users
- [ ] Get user by ID hoạt động
- [ ] Get user by username hoạt động
- [ ] Logout blacklist token
- [ ] Verify blacklisted token báo lỗi
- [ ] Không có error trong console

---

**Postman Collection Updated**: April 2026
**Version**: 1.0.0
