# USER SERVICE - CURL TEST COMMANDS

## Setup
Set BASE_URL=http://localhost:8081/api/users

---

## TEST 1: Register New User
```
curl -X POST http://localhost:8081/api/users/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser123\",\"email\":\"testuser123@company.vn\",\"password\":\"password123\",\"confirmPassword\":\"password123\",\"fullName\":\"Test User\",\"phone\":\"0909999999\"}"
```

Expected Response (201):
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

**Save token for next tests!**

---

## TEST 2: Login
```
curl -X POST http://localhost:8081/api/users/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"password\"}"
```

Expected Response (200):
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

**Save token!**

---

## TEST 3: Get All Users
```
curl -X GET http://localhost:8081/api/users ^
  -H "Content-Type: application/json"
```

Expected Response (200):
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
  ... more users
]
```

---

## TEST 4: Get User by ID
```
curl -X GET http://localhost:8081/api/users/2 ^
  -H "Content-Type: application/json"
```

Expected Response (200):
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

## TEST 5: Get User by Username
```
curl -X GET http://localhost:8081/api/users/username/admin ^
  -H "Content-Type: application/json"
```

Expected Response (200):
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

## TEST 6: Verify Token
Replace TOKEN_HERE with actual token from TEST 2 or TEST 1:

```
curl -X POST http://localhost:8081/api/users/verify-token ^
  -H "Content-Type: application/json" ^
  -d "\"TOKEN_HERE\""
```

Example (with actual token):
```
curl -X POST http://localhost:8081/api/users/verify-token ^
  -H "Content-Type: application/json" ^
  -d "\"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJJZCI6MSwiZW1haWwiOiJhZG1pbkBjb21wYW55LnZuIiwicm9sZSI6IkFETUluIiwiaWF0IjoxNzA0MTIzNDU3LCJleHAiOjE3MDQyMDk4NTd9.abc123\""
```

Expected Response (200 - Valid Token):
```json
{
  "valid": true,
  "userId": 1,
  "username": "admin",
  "email": "admin@company.vn",
  "role": "ADMIN",
  "message": "Token is valid"
}
```

Expected Response (200 - Invalid/Expired Token):
```json
{
  "valid": false,
  "message": "Invalid or expired token"
}
```

---

## TEST 7: Logout
Replace TOKEN_HERE with actual token:

```
curl -X POST http://localhost:8081/api/users/logout ^
  -H "Authorization: Bearer TOKEN_HERE"
```

Example:
```
curl -X POST http://localhost:8081/api/users/logout ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJJZCI6MSwiZW1haWwiOiJhZG1pbkBjb21wYW55LnZuIiwicm9sZSI6IkFETUluIiwiaWF0IjoxNzA0MTIzNDU3LCJleHAiOjE3MDQyMDk4NTd9.abc123"
```

Expected Response (200):
```
Logged out successfully
```

---

## TEST 8: Verify Blacklisted Token (After Logout)
Try to verify the same token you just logged out with:

```
curl -X POST http://localhost:8081/api/users/verify-token ^
  -H "Content-Type: application/json" ^
  -d "\"TOKEN_THAT_WAS_LOGGED_OUT\""
```

Expected Response (200):
```json
{
  "valid": false,
  "message": "Token has been blacklisted (user logged out)"
}
```

---

## 📋 Sample Users in Database

| Username | Password |
|----------|----------|
| admin | password |
| nguyenvana | password |
| tranthib | password |
| levanc | password |
| phamthid | password |
| hoangtrane | password |
| vuminh | password |
| dothihoa | password |

---

## 💡 Tips

1. **Copy-paste** curl commands vào Command Prompt (cmd.exe)
2. **Token**: Copy từ response JSON, dùng cho TEST 6 và TEST 7
3. **Format**: Đảm bảo `^` ở cuối dòng (Windows continuation)
4. **Pretty Print**: Thêm `| jq '.'` nếu có jq (hoặc dùng Postman)

---

## ⚠️ Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Connection refused | Service chưa chạy | `mvn spring-boot:run` |
| Invalid token | Token hết hạn/sai | Login lại để lấy token mới |
| Token blacklisted | Đã logout rồi | Login lại |
| Username exists | User đã tồn tại | Dùng username khác |
| Passwords mismatch | password ≠ confirmPassword | Nhập lại |

---

## 🚀 Complete Test Workflow

1. **TEST 2**: Login → Get token
2. **TEST 3**: Get all users (verify service works)
3. **TEST 4**: Get user by ID
4. **TEST 5**: Get user by username
5. **TEST 6**: Verify token (should be valid)
6. **TEST 7**: Logout (blacklist token)
7. **TEST 8**: Verify same token (should be invalid)
8. **TEST 2 again**: Login again → Get new token

✅ Nếu tất cả pass → User Service hoạt động bình thường!

---

**Version**: 1.0.0
**Last Updated**: April 2026
