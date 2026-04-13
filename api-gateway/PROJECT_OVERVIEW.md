# API Gateway - Complete Microservices Solution

## 📋 Project Overview

This API Gateway is a centralized entry point for the Food Order microservices architecture. It handles routing, authentication, CORS, logging, and error handling for all downstream microservices.

## 🏗️ Technology Stack

- **Framework:** Spring Boot 3.2.0
- **Gateway:** Spring Cloud Gateway 2023.0.0
- **Runtime:** Java 17+
- **Build Tool:** Maven 3.6+
- **HTTP Client:** WebClient (reactive)
- **Logging:** SLF4J + Logback
- **Other:** Lombok, Jackson

## 📁 Project Structure

```
api-gateway/
├── src/main/
│   ├── java/com/foodorder/gateway/
│   │   ├── ApiGatewayApplication.java          # Main entry point
│   │   ├── config/
│   │   │   ├── GlobalCorsConfig.java          # CORS configuration
│   │   │   └── WebClientConfig.java           # WebClient setup
│   │   ├── filter/
│   │   │   ├── JwtAuthenticationFilter.java   # JWT verification
│   │   │   └── LoggingFilter.java            # Request/response logging
│   │   ├── service/
│   │   │   └── TokenVerificationService.java # Token verification
│   │   ├── model/
│   │   │   └── ApiResponse.java              # Response wrapper
│   │   └── exception/
│   │       └── GlobalExceptionHandler.java   # Error handling
│   └── resources/
│       ├── application.yml                   # Development config
│       └── application-prod.yml              # Production config
├── pom.xml                                    # Maven dependencies
├── README.md                                  # Overview
├── QUICK_START.md                             # Setup guide
├── FRONTEND_INTEGRATION.md                    # Frontend integration
├── DEPLOYMENT.md                              # Production deployment
├── build-and-run.sh                           # Linux build script
├── build-and-run.bat                          # Windows build script
└── .gitignore

```

## 🚀 Quick Start

### Prerequisites

- Java 17 or higher installed
- Maven 3.6 or higher
- All microservices running (ports 8081-8084)

### Build & Run

**Windows:**

```bash
build-and-run.bat
```

**Linux/macOS:**

```bash
chmod +x build-and-run.sh
./build-and-run.sh
```

**Manual:**

```bash
mvn clean install
mvn spring-boot:run
```

Gateway starts on: **http://localhost:8080**

## 📡 Routing Configuration

| Endpoint        | Target Service  | Port |
| --------------- | --------------- | ---- |
| `/api/users/**` | USER-SERVICE    | 8081 |
| `/foods/**`     | FOOD-SERVICE    | 8082 |
| `/orders/**`    | ORDER-SERVICE   | 8083 |
| `/payments/**`  | PAYMENT-SERVICE | 8084 |

## 🔐 Security Features

✅ **JWT Authentication**

- Extracts token from `Authorization: Bearer <token>`
- Verifies tokens via USER-SERVICE
- Returns 401 for invalid/missing tokens
- Public endpoints bypass authentication

✅ **CORS Support**

- Configured for frontend (localhost:5173)
- Supports all HTTP methods
- Allows credentials
- Configurable age for preflight caching

✅ **Error Handling**

- Global exception handler
- Standardized error responses
- HTTP status mapping
- Detailed logging

## 📊 Key Features

### 1. Smart Routing

- Path-based routing to microservices
- Automatic prefix stripping
- Header preservation
- Query parameter forwarding

### 2. Authentication Filter

- Automatic Bearer token extraction
- Skip public endpoints (login, register, health)
- Token validation
- Unauthorized error responses

### 3. Logging Filter

- All incoming requests logged
- Response status and duration tracked
- Sensitive headers masked (Authorization)
- Request/response lifecycle visibility

### 4. Global CORS Configuration

- Frontend origin whitelisting
- Method restrictions (GET, POST, PUT, DELETE, PATCH, OPTIONS)
- Custom header allowance
- Credentials support

### 5. Exception Handling

- Catches all unhandled exceptions
- Maps to appropriate HTTP status codes
- JSON error responses
- Timestamp tracking

## 🧪 Test Endpoints

### Public Endpoint (No Auth)

```bash
# Login to get token
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Protected Endpoint (With Auth)

```bash
# Get user profile (requires token)
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Gateway Health

```bash
curl http://localhost:8080/actuator/health
```

## 🔄 Frontend Integration

Update your React frontend's Axios configuration:

```typescript
// Before
baseURL: "http://localhost:8081";

// After
baseURL: "http://localhost:8080";
```

Gateway automatically routes to correct microservice based on URL path.

See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) for detailed guide.

## 📦 Configuration

### Development (Default)

```yaml
server.port: 8080
logging.level: DEBUG
cors.allowed-origins: http://localhost:5173
```

### Production

```yaml
server.port: 8080
logging.level: WARN
cors.allowed-origins: https://yourdomain.com
```

Run with production profile:

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=prod"
```

## 📈 Performance Considerations

- **Connection Pooling:** 500 max connections per route
- **Timeouts:** 10 seconds for read/write operations
- **Compression:** Enabled for responses > 1KB
- **Reuse:** WebClient uses pooled connections

## 🐳 Docker Support

Build Docker image:

```bash
docker build -t api-gateway:1.0.0 .
```

Run container:

```bash
docker run -p 8080:8080 api-gateway:1.0.0
```

## 📚 Documentation

- **README.md** - This file
- **QUICK_START.md** - Step-by-step setup guide
- **FRONTEND_INTEGRATION.md** - Frontend integration instructions
- **DEPLOYMENT.md** - Production deployment guide

## 🐛 Troubleshooting

### Gateway won't start

- Check if port 8080 is available
- Verify Java 17+ is installed
- Check Maven installation

### 502 Bad Gateway

- Verify microservices are running
- Check service URLs in configuration
- Test microservice endpoint directly

### 401 Unauthorized

- Ensure `Authorization: Bearer <token>` header is present
- Verify token is valid
- Check endpoint authentication requirements

### CORS errors in browser

- Verify frontend URL is in allowed origins
- Clear browser cache
- Check browser console for actual error

## 🔗 Related Services

- **USER-SERVICE:** http://localhost:8081/api/users
- **FOOD-SERVICE:** http://localhost:8082/foods
- **ORDER-SERVICE:** http://localhost:8083/orders
- **PAYMENT-SERVICE:** http://localhost:8084/payments

## 📝 API Response Format

All responses follow this format:

```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "timestamp": 1681234567890
}
```

## 🔐 Security Best Practices

1. Use HTTPS in production
2. Implement token expiration
3. Add rate limiting
4. Use strong secret keys
5. Never log sensitive data
6. Validate all inputs
7. Use API versioning

## 📊 Monitoring

View health check:

```bash
curl http://localhost:8080/actuator/health
```

View metrics:

```bash
curl http://localhost:8080/actuator/metrics
```

View logs:

```bash
tail -f logs/api-gateway.log
```

## 🎯 Next Steps

1. ✅ Review this project structure
2. ✅ Start all microservices
3. ✅ Start API Gateway
4. ✅ Update frontend to use gateway
5. ✅ Test end-to-end flow
6. ✅ Deploy to production

## 📄 License

MIT License - See [LICENSE](./LICENSE) file

## 👨‍💻 Author

Built for Food Order Microservices Architecture

---

**Version:** 1.0.0  
**Last Updated:** 2024

For support and updates, visit the project documentation or contact the development team.
