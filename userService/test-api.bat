@echo off
REM User Service API - Windows Test Commands
REM Port: 8081
REM Base URL: http://localhost:8081/api/users

setlocal enabledelayedexpansion
set BASE_URL=http://localhost:8081/api/users

echo ==================================
echo User Service API - Test Commands
echo ==================================
echo.

REM TEST 1: Register New User
echo TEST 1: Register New User
echo Command: POST /register
curl -X POST %BASE_URL%/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser123\",\"email\":\"testuser123@company.vn\",\"password\":\"password123\",\"confirmPassword\":\"password123\",\"fullName\":\"Test User\",\"phone\":\"0909999999\"}"
echo.
echo.

REM TEST 2: Login
echo ==================================
echo.
echo TEST 2: Login (Admin)
echo Command: POST /login
for /f "delims=" %%a in ('curl -s -X POST %BASE_URL%/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"password\"}"') do set RESPONSE=%%a
echo %RESPONSE%
REM Extract token (simplified - jq not available on Windows)
echo Note: Copy the token manually from response for next tests
echo.

REM TEST 3: Get All Users
echo ==================================
echo.
echo TEST 3: Get All Users
echo Command: GET /users
curl -s -X GET %BASE_URL% ^
  -H "Content-Type: application/json"
echo.
echo.

REM TEST 4: Get User by ID
echo ==================================
echo.
echo TEST 4: Get User by ID (ID: 2)
echo Command: GET /users/2
curl -s -X GET %BASE_URL%/2 ^
  -H "Content-Type: application/json"
echo.
echo.

REM TEST 5: Get User by Username
echo ==================================
echo.
echo TEST 5: Get User by Username (admin)
echo Command: GET /users/username/admin
curl -s -X GET %BASE_URL%/username/admin ^
  -H "Content-Type: application/json"
echo.
echo.

REM TEST 6: Verify Token (Manual - Paste Token)
echo ==================================
echo.
echo TEST 6: Verify Token
echo Command: POST /verify-token
echo.
echo Copy token from TEST 2 response and replace TOKEN_HERE below:
echo curls -X POST %BASE_URL%/verify-token ^
  -H "Content-Type: application/json" ^
  -d "\"TOKEN_HERE\""
echo.

REM TEST 7: Logout (Manual - Paste Token)
echo ==================================
echo.
echo TEST 7: Logout
echo Command: POST /logout
echo.
echo Copy token from TEST 2 response and replace TOKEN_HERE below:
echo curl -X POST %BASE_URL%/logout ^
  -H "Authorization: Bearer TOKEN_HERE"
echo.

echo ==================================
echo Instructions:
echo 1. Make sure User Service is running (port 8081)
echo 2. For TEST 6 and TEST 7, copy token from TEST 2 response
echo 3. Replace TOKEN_HERE with actual token
echo 4. Uncomment and run those commands manually
echo ==================================

pause
