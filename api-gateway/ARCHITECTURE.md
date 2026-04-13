# Architecture & Visual Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React/Vite)                              │
│                         http://localhost:5173                                │
│                        (All API calls through gateway)                       │
└──────────────────────────────────────────┬──────────────────────────────────┘
                                           │
                                           │ HTTP Requests
                                           │ (All routes: /api/*, /foods/*, /orders/*, /payments/*)
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🚪 API GATEWAY (Port 8080)                            │
│                     Spring Cloud Gateway - Main Orchestrator                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 1️⃣  CORS Filter                                                      │   │
│  │ ✓ Check Origin (localhost:5173)                                       │   │
│  │ ✓ Allow Methods (GET, POST, PUT, DELETE, PATCH, OPTIONS)            │   │
│  │ ✓ Allow Headers (*)                                                   │   │
│  │ ✓ Expose Authorization & Content-Type                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 2️⃣  JWT Authentication Filter                                        │   │
│  │ ✓ Extract from Authorization: Bearer <token>                         │   │
│  │ ✓ Validate Token Format                                              │   │
│  │ ✓ Check Public Endpoints                                             │   │
│  │ ✓ Return 401 if Invalid/Missing                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 3️⃣  Path Routing Engine                                              │   │
│  │ Pattern Matching:                                                     │   │
│  │ ├─ /api/users/** → USER-SERVICE (8081)                              │   │
│  │ ├─ /foods/** → FOOD-SERVICE (8082)                                  │   │
│  │ ├─ /orders/** → ORDER-SERVICE (8083)                                │   │
│  │ └─ /payments/** → PAYMENT-SERVICE (8084)                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 4️⃣  Request Logging Filter                                           │   │
│  │ ✓ Log Method, Path, Query Params                                     │   │
│  │ ✓ Track Request Duration                                             │   │
│  │ ✓ Log Response Status                                                │   │
│  │ ✓ Mask Sensitive Headers                                             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 5️⃣  Exception Handler                                                │   │
│  │ ✓ Catch All Exceptions                                               │   │
│  │ ✓ Map to HTTP Status Codes                                           │   │
│  │ ✓ Return Standardized JSON Error                                     │   │
│  │ ✓ Log Error Details                                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
        │                    │                    │                    │
        │                    │                    │                    │
        ▼                    ▼                    ▼                    ▼
    ┌────────────┐      ┌────────────┐      ┌────────────┐      ┌────────────┐
    │   USER-    │      │   FOOD-    │      │   ORDER-   │      │  PAYMENT-  │
    │  SERVICE   │      │  SERVICE   │      │  SERVICE   │      │  SERVICE   │
    │ :8081      │      │ :8082      │      │ :8083      │      │ :8084      │
    │            │      │            │      │            │      │            │
    │ Routes:    │      │ Routes:    │      │ Routes:    │      │ Routes:    │
    │ • POST     │      │ • GET /    │      │ • GET /    │      │ • POST /   │
    │   /login   │      │   foods    │      │   orders   │      │   payments │
    │ • POST     │      │ • GET /    │      │ • POST /   │      │ • GET /    │
    │   /register│      │   foods/:id│      │   orders   │      │   payments │
    │ • GET /    │      │ • POST /   │      │ • GET /    │      │ • GET /    │
    │   profile  │      │   foods    │      │   orders/:id      │   payments/│
    │            │      │ • PUT /    │      │ • PUT /    │      │   :id      │
    │ Database   │      │   foods/:id│      │   orders   │      │            │
    │ Storage    │      │ • DELETE / │      │ • DELETE / │      │ Database   │
    │            │      │   foods/:id│      │   orders   │      │ Storage    │
    └────────────┘      └────────────┘      └────────────┘      └────────────┘
```

---

## Request Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           DETAILED REQUEST FLOW                            │
└────────────────────────────────────────────────────────────────────────────┘

🌐 Frontend Makes Request
│
│ GET http://localhost:8080/api/users/profile
│ Header: Authorization: Bearer eyJhbGc...
│
▼
┌─ API Gateway (8080) ─────────────────────────────────────────────────────┐
│                                                                            │
│ 1. CORS Validation                                                        │
│    ✓ Check Origin: http://localhost:5173                                 │
│    ✓ Check Method: GET allowed                                           │
│    ✓ Return CORS Headers                                                 │
│                                                                            │
│ 2. JWT Filter                                                             │
│    ✓ Extract token from Authorization header                             │
│    ✓ Validate format: Bearer <token>                                     │
│    ✓ Check if endpoint is public (it's not)                              │
│    ✓ Token is valid → Continue                                           │
│                                                                            │
│ 3. Routing Decision                                                       │
│    ✓ Match path: /api/users/profile                                      │
│    ✓ Router: /api/users/** → USER-SERVICE                                │
│    ✓ Destination: http://localhost:8081                                  │
│                                                                            │
│ 4. Logging & Forwarding                                                   │
│    ✓ Log: >>> [INCOMING] GET /api/users/profile                          │
│    ✓ Add Authorization header                                            │
│    ✓ Forward to USER-SERVICE                                             │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
│
▼
┌─ USER-SERVICE (8081) ────────────────────────────────────────────────────┐
│                                                                            │
│ 1. Receive Request                                                        │
│    GET /api/users/profile                                                │
│    Header: Authorization: Bearer eyJhbGc...                              │
│                                                                            │
│ 2. Process Request                                                        │
│    ✓ Verify token with database                                          │
│    ✓ Fetch user profile data                                             │
│    ✓ Return response                                                      │
│                                                                            │
│ 3. Response Format                                                        │
│    {                                                                      │
│      "statusCode": 200,                                                  │
│      "message": "Profile retrieved",                                     │
│      "data": {                                                           │
│        "id": 1,                                                          │
│        "name": "John Doe",                                               │
│        "email": "john@example.com"                                       │
│      }                                                                    │
│    }                                                                      │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
│
▼
┌─ API Gateway (Response Handling) ───────────────────────────────────────┐
│                                                                            │
│ 1. Receive Response from USER-SERVICE                                    │
│                                                                            │
│ 2. Log Response                                                           │
│    ✓ Log: <<< [RESPONSE] 200 GET /api/users/profile (125ms)             │
│                                                                            │
│ 3. Return to Frontend                                                    │
│    ✓ Same status code (200)                                              │
│    ✓ Same response body                                                  │
│    ✓ Add CORS headers                                                    │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
│
▼
🌐 Frontend Receives Response
   200 OK
   {
     "statusCode": 200,
     "message": "Profile retrieved",
     "data": { ... }
   }
```

---

## Authentication Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        JWT AUTHENTICATION FLOW                             │
└────────────────────────────────────────────────────────────────────────────┘

1️⃣  LOGIN REQUEST (Public Endpoint - No Token Needed)
    ┌─────────────────────────────────────────────────────────┐
    │ POST http://localhost:8080/api/users/login              │
    │ {                                                        │
    │   "email": "user@example.com",                           │
    │   "password": "password123"                              │
    │ }                                                        │
    └─────────────────────────────────────────────────────────┘
                            │
                            ▼
    🚪 API Gateway
       - CORS Check ✓
       - JWT Check: Path is public (/api/users/login) ✓
       - Route to USER-SERVICE ✓
       - Log request ✓
                            │
                            ▼
    👤 USER-SERVICE
       - Verify credentials
       - Generate JWT token
       - Return token in response
                            │
                            ▼
    Response (200 OK)
    {
      "statusCode": 200,
      "message": "Login successful",
      "data": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }


2️⃣  STORE TOKEN
    Local Storage: localStorage.setItem('access_token', token)


3️⃣  PROTECTED REQUEST (With Token)
    ┌──────────────────────────────────────────────────────────┐
    │ GET http://localhost:8080/api/users/profile              │
    │ Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...    │
    └──────────────────────────────────────────────────────────┘
                            │
                            ▼
    🚪 API Gateway
       - CORS Check ✓
       - JWT Filter:
         ├─ Extract token from Bearer header ✓
         ├─ Validate format (has "Bearer " prefix) ✓
         ├─ Check if path is protected ✓
         └─ Allow request (token valid)
       - Route to USER-SERVICE ✓
       - Log request ✓
                            │
                            ▼
    👤 USER-SERVICE
       - Receive Authorization header
       - Verify token validity
       - Fetch protected data
       - Return response
                            │
                            ▼
    Response (200 OK)
    Profile data


4️⃣  MISSING TOKEN (Error Scenario)
    ┌──────────────────────────────────────────────────────────┐
    │ GET http://localhost:8080/api/users/profile              │
    │ (No Authorization header)                                │
    └──────────────────────────────────────────────────────────┘
                            │
                            ▼
    🚪 API Gateway - JWT Filter
       - Check Authorization header: MISSING ❌
       - Path requires auth: /api/users/profile ✓
       - Return 401 Unauthorized
                            │
                            ▼
    Response (401 Unauthorized)
    {
      "statusCode": 401,
      "message": "Missing Authorization header",
      "timestamp": 1681234567890
    }


5️⃣  INVALID TOKEN (Error Scenario)
    ┌──────────────────────────────────────────────────────────┐
    │ GET http://localhost:8080/api/users/profile              │
    │ Header: Authorization: INVALID_TOKEN_HERE                │
    └──────────────────────────────────────────────────────────┘
                            │
                            ▼
    🚪 API Gateway - JWT Filter
       - Check Authorization header: Found ✓
       - Extract token: INVALID_TOKEN_HERE
       - Validate format: NO "Bearer " prefix ❌
       - Return 401 Unauthorized
                            │
                            ▼
    Response (401 Unauthorized)
    {
      "statusCode": 401,
      "message": "Invalid Authorization header format"
    }
```

---

## CORS Preflight Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          CORS PREFLIGHT REQUEST                            │
└────────────────────────────────────────────────────────────────────────────┘

Browser Issues Preflight OPTIONS Request
│
│ OPTIONS http://localhost:8080/foods
│ Origin: http://localhost:5173
│ Access-Control-Request-Method: POST
│ Access-Control-Request-Headers: content-type
│
▼
API Gateway - CORS Config
│
├─ Check Origin: http://localhost:5173 ✓ (in allowed list)
├─ Check Method: POST ✓ (in allowed methods)
├─ Check Headers: content-type ✓ (all headers allowed with *)
│
▼
Response Headers
│
├─ Access-Control-Allow-Origin: http://localhost:5173
├─ Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
├─ Access-Control-Allow-Headers: *
├─ Access-Control-Max-Age: 3600
├─ Access-Control-Allow-Credentials: true
│
▼
Browser Caches Preflight (1 hour)

For next 3600 seconds, browser will NOT send preflight request for:
- Origin: http://localhost:5173
- Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
- Headers: Any header
```

---

## Error Handling Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        ERROR HANDLING - SCENARIOS                          │
└────────────────────────────────────────────────────────────────────────────┘

Scenario 1: Service Unavailable
────────────────────────────────
request → gateway → tries to connect to SERVICE (8081) → FAILS
                    ↓
                GlobalExceptionHandler catches
                ↓
                Maps to 502 Bad Gateway
                ↓
                Response: {
                  "statusCode": 502,
                  "message": "Bad Gateway"
                }


Scenario 2: Invalid Input
─────────────────────────
request → gateway → SERVICE → Validates input → BAD REQUEST
                                                ↓
                    GlobalExceptionHandler catches (from service)
                                                ↓
                    Maps to 400 Bad Request
                                                ↓
                    Response: {
                      "statusCode": 400,
                      "message": "Invalid request parameters"
                    }


Scenario 3: Unauthorized
────────────────────────
request (no token) → JWT Filter → Validates → FAILS
                                  ↓
                    Intercepts request
                                  ↓
                    Returns 401 immediately (never reaches service)
                                  ↓
                    Response: {
                      "statusCode": 401,
                      "message": "Missing Authorization header"
                    }


Scenario 4: Unhandled Exception
────────────────────────────────
request → gateway → service → throws exception
                    ↑
                    |
            GlobalExceptionHandler
                    ↓
            Logs error with stack trace
                    ↓
            Returns generic 500 error
                    ↓
            Response: {
              "statusCode": 500,
              "message": "Internal Server Error"
            }
```

---

## Configuration Layers

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION.YML CONFIGURATION                         │
└────────────────────────────────────────────────────────────────────────────┘

Level 1: Server Configuration
├─ port: 8080
├─ compression.enabled: true
└─ servlet.context-path: /

Level 2: Spring Cloud Gateway
├─ globalcors:
│  └─ allowed-origins: ["http://localhost:5173"]
├─ gateway.default-filters:
│  └─ RemoveRequestHeader: Content-Length
└─ gateway routes (see ApiGatewayApplication.java)

Level 3: Logging Configuration
├─ root: INFO
├─ com.foodorder.gateway: DEBUG
├─ org.springframework.cloud.gateway: DEBUG
└─ file path: logs/api-gateway.log

Level 4: WebClient Configuration
├─ connection timeout: 5 seconds
├─ read timeout: 10 seconds
├─ write timeout: 10 seconds
└─ max pooled connections: 500

Level 5: Custom Gateway Properties
├─ gateway.auth.service-url: http://localhost:8081
└─ gateway.auth.verify-token-endpoint: /api/users/verify-token
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT ARCHITECTURE                      │
└────────────────────────────────────────────────────────────────────────────┘

📱 Users' Browsers
│
├─ HTTPS: *.yourdomain.com
│
▼
🚪 Load Balancer (Nginx/HAProxy)
│
├─ SSL/TLS Termination
├─ Redirect HTTP → HTTPS
├─ Load balancing algorithm
│
▼
🌐 API Gateway Instances (3 instances for HA)
│
├─ Instance 1: Port 8080
├─ Instance 2: Port 8080
└─ Instance 3: Port 8080

│
├─ Shared Configuration
├─ Centralized Logging
└─ Monitoring & Metrics


Each Gateway Instance connects to:
│
├─ 📊 USER-SERVICE       (8081)
├─ 🍕 FOOD-SERVICE       (8082)
├─ 📦 ORDER-SERVICE      (8083)
└─ 💳 PAYMENT-SERVICE    (8084)

│
├─ Health Checks every 30s
├─ Circuit Breakers for failures
└─ Automatic failover


External Services:
│
├─ 📊 Prometheus (Metrics)
├─ 📈 Grafana (Dashboards)
├─ 📝 ELK Stack (Logging)
└─ 🚨 Alerting System
```

---

## Port Summary

```
┌─────────────────────────────────────────┐
│          ALL PORTS AT A GLANCE          │
├─────────────────────────────────────────┤
│ 8080 → API Gateway (Main Entry Point)   │
├─────────────────────────────────────────┤
│ 8081 → USER-SERVICE                     │
│ 8082 → FOOD-SERVICE                     │
│ 8083 → ORDER-SERVICE                    │
│ 8084 → PAYMENT-SERVICE                  │
├─────────────────────────────────────────┤
│ 3000+ → Frontend (varies by setup)      │
│ 5173  → Frontend (Vite default)         │
├─────────────────────────────────────────┤
│ Production HTTPS:                       │
│ 443   → API Gateway (SSL)               │
│ 80    → Redirect to HTTPS               │
└─────────────────────────────────────────┘
```

---

For implementation details, see individual files:

- [README.md](./README.md) - Full overview
- [QUICK_START.md](./QUICK_START.md) - Setup guide
- [CODE FILES](../api-gateway) - Source code
