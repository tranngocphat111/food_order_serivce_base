# Payment + Notification Service (Nguoi 5)

Service nay phuc vu vai tro **Payment + Notification** trong bai Mini Food Ordering theo Service-Based Architecture.

## 1. Cong nghe

- Java 17
- Spring Boot 3
- REST API
- Luu payment in-memory (khong dung DB)

## 2. Chuc nang

- `POST /payments`
  - Nhan thong tin thanh toan (`COD` / `BANKING`)
  - Goi Order Service de cap nhat trang thai order thanh `PAID`
  - Gui notification (log console hoac REST API)

## 3. Cau hinh quan trong

File: `src/main/resources/application.yml`

- `server.port`: default `8084`
- `integration.order-service.base-url`: URL Order Service (LAN IP)
- `integration.order-service.update-status-path`: path update status, mac dinh `/orders/{orderId}/status`
- `integration.notification.mode`: `LOG` hoac `REST`
- `integration.notification.endpoint`: endpoint notification neu mode `REST`
- `app.cors.allowed-origins`: danh sach IP frontend duoc phep goi API

## 4. Chay service

```bash
mvn spring-boot:run
```

Hoac build jar:

```bash
mvn clean package
java -jar target/payment-notification-service-1.0.0.jar
```

## 5. API mau

### Request

```http
POST /payments
Content-Type: application/json

{
  "orderId": 123,
  "userId": 10,
  "paymentMethod": "COD"
}
```

### Response (201)

```json
{
  "paymentId": 1001,
  "orderId": 123,
  "userId": 10,
  "paymentMethod": "COD",
  "paymentStatus": "SUCCESS",
  "paidAt": "2026-04-01T10:15:30.123Z",
  "message": "Thanh toan thanh cong"
}
```

## 6. Luu y tich hop voi Order Service

Mac dinh service nay goi:

- `PUT {order-service-base-url}/orders/{orderId}/status`

Body gui sang Order Service:

```json
{
  "status": "PAID",
  "paymentMethod": "COD"
}
```

Neu team ban dang dung endpoint khac, chi can doi `update-status-path` trong `application.yml`.
