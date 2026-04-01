#!/bin/bash

# User Service API - Curl Test Commands
# Port: 8081
# Base URL: http://localhost:8081/api/users

BASE_URL="http://localhost:8081/api/users"

echo "=================================="
echo "User Service API - Curl Test Commands"
echo "=================================="
echo ""

# TEST 1: Register New User
echo "TEST 1: Register New User"
echo "Command: POST /register"
curl -X POST $BASE_URL/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "testuser123@company.vn",
    "password": "password123",
    "confirmPassword": "password123",
    "fullName": "Test User",
    "phone": "0909999999"
  }' \
  -w "\n\nStatus: %{http_code}\n\n"

echo ""
echo "=================================="
echo ""

# TEST 2: Login
echo "TEST 2: Login (Admin)"
echo "Command: POST /login"
TOKEN_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }')

echo $TOKEN_RESPONSE | jq '.'
TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token')
echo "Token extracted: ${TOKEN:0:50}..."
echo ""

# TEST 3: Get All Users
echo "=================================="
echo ""
echo "TEST 3: Get All Users"
echo "Command: GET /users"
curl -s -X GET $BASE_URL \
  -H "Content-Type: application/json" | jq '.'
echo ""

# TEST 4: Get User by ID
echo "=================================="
echo ""
echo "TEST 4: Get User by ID (ID: 2)"
echo "Command: GET /users/2"
curl -s -X GET $BASE_URL/2 \
  -H "Content-Type: application/json" | jq '.'
echo ""

# TEST 5: Get User by Username
echo "=================================="
echo ""
echo "TEST 5: Get User by Username (admin)"
echo "Command: GET /users/username/admin"
curl -s -X GET $BASE_URL/username/admin \
  -H "Content-Type: application/json" | jq '.'
echo ""

# TEST 6: Verify Token
echo "=================================="
echo ""
echo "TEST 6: Verify Token"
echo "Command: POST /verify-token"
echo "Token: $TOKEN"
curl -s -X POST $BASE_URL/verify-token \
  -H "Content-Type: application/json" \
  -d "\"$TOKEN\"" | jq '.'
echo ""

# TEST 7: Logout
echo "=================================="
echo ""
echo "TEST 7: Logout"
echo "Command: POST /logout"
curl -s -X POST $BASE_URL/logout \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n\nStatus: %{http_code}\n\n"
echo ""

# TEST 8: Verify Blacklisted Token
echo "=================================="
echo ""
echo "TEST 8: Verify Blacklisted Token (Should Fail)"
echo "Command: POST /verify-token (with blacklisted token)"
curl -s -X POST $BASE_URL/verify-token \
  -H "Content-Type: application/json" \
  -d "\"$TOKEN\"" | jq '.'
echo ""

echo "=================================="
echo "All tests completed!"
echo "=================================="
