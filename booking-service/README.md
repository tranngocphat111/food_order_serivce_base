# Booking Service - Kiến trúc hướng sự kiện (Người 4)

Service này triển khai phần **Booking Service (CORE)** theo hướng tách trách nhiệm rõ ràng:

- Booking Service chỉ **publish** event `BOOKING_CREATED`
- Booking Service **không consume** event thanh toán/thông báo

Phạm vi trong repository này:

- Tạo booking API (`POST /bookings`)
- Lấy danh sách booking API (`GET /bookings`)
- Publish event `BOOKING_CREATED` sau khi tạo booking thành công

Ngoài phạm vi repository này:

- User Service
- Movie Service
- Payment processing logic
- Notification logic
- Consume các event `PAYMENT_COMPLETED`, `BOOKING_FAILED`

---

## 1. Luồng tổng quan

Luồng end-to-end theo kiến trúc đã tách:

1. Frontend/Gateway gọi Booking Service `POST /bookings`
2. Booking Service kiểm tra showtime + seats
3. Booking Service tạo dữ liệu trong `bookings` (`PENDING`) và `booking_seats`
4. Booking Service giảm `showtimes.available_seats`
5. Booking Service publish `BOOKING_CREATED` lên RabbitMQ exchange
6. Payment/Notification Service (service khác) consume `BOOKING_CREATED` và xử lý nghiệp vụ tiếp theo

Nguyên tắc kiến trúc:

- Booking Service không gọi HTTP trực tiếp sang service khác
- Booking Service không giữ queue/routing key của event không thuộc phạm vi nó

---

## 2. Công nghệ sử dụng

- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring AMQP (RabbitMQ)
- MariaDB/MySQL

---

## 3. Thiết lập cơ sở dữ liệu

Sử dụng file SQL đã chuẩn bị để tạo schema/data cho `movie_ticket_db`.

Các bảng Booking Service dùng trực tiếp:

- `bookings`
- `booking_seats`
- `showtimes`
- `seats`

---

## 4. Cấu hình

File cấu hình: `src/main/resources/application.properties`

### 4.1 Ứng dụng

- `spring.application.name=booking-service`
- `server.port=8083`

### 4.2 Database

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`

### 4.3 RabbitMQ

Biến môi trường (không bắt buộc):

- `RABBITMQ_HOST`
- `RABBITMQ_PORT`
- `RABBITMQ_USERNAME`
- `RABBITMQ_PASSWORD`

Booking Service chỉ giữ 2 key event:

- `app.rabbitmq.exchange=movie.booking.events`
- `app.rabbitmq.booking-created-routing-key=BOOKING_CREATED`

---

## 5. API contract

## 5.1 Tạo booking

`POST /bookings`

Request body:

```json
{
    "userId": 2,
    "showtimeId": 1,
    "seatIds": [7, 8],
    "notes": "Near center"
}
```

Hành vi xử lý:

- Kiểm tra showtime tồn tại và đang `ACTIVE`
- Kiểm tra seat tồn tại, active và thuộc đúng hall của showtime
- Từ chối seat bị trùng trong request
- Từ chối seat đã được đặt ở cùng showtime
- Tạo booking trạng thái `PENDING`
- Lưu chi tiết ghế vào `booking_seats`
- Giảm `showtimes.available_seats`
- Publish event `BOOKING_CREATED`

## 5.2 Lấy danh sách booking

`GET /bookings`

Query params:

- `userId` (optional)
- `status` (optional: `PENDING|CONFIRMED|FAILED|CANCELLED`)

---

## 6. Event publish bởi Booking Service

Event: `BOOKING_CREATED`

Ví dụ payload:

```json
{
    "eventType": "BOOKING_CREATED",
    "bookingId": 11,
    "bookingCode": "BK-20260418-58213",
    "userId": 2,
    "showtimeId": 1,
    "totalSeats": 2,
    "totalAmount": 170000,
    "seats": ["A7", "A8"],
    "createdAt": "2026-04-18T10:21:15"
}
```

---

## 7. Chạy local

## 7.1 Khởi động phụ thuộc

1. Khởi động MariaDB/MySQL
2. Import SQL tạo `movie_ticket_db`
3. Khởi động RabbitMQ

Ví dụ Docker RabbitMQ:

```bash
docker run -d --name rabbitmq \
    -p 5672:5672 -p 15672:15672 \
    rabbitmq:3-management
```

## 7.2 Chạy service

Windows:

```bash
mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

---

## 8. Kịch bản demo phù hợp kiến trúc mới

1. Tạo booking qua `POST /bookings`
2. Xác nhận DB có booking trạng thái `PENDING`
3. Xác nhận RabbitMQ nhận event `BOOKING_CREATED`
4. Chuyển sang service Payment/Notification để demo phần consume và xử lý tiếp

---

## 9. Cấu trúc project (file chính)

- `src/main/java/iuh/fit/edu/bookingservice/controller/BookingController.java`
- `src/main/java/iuh/fit/edu/bookingservice/service/BookingService.java`
- `src/main/java/iuh/fit/edu/bookingservice/service/BookingEventPublisher.java`
- `src/main/java/iuh/fit/edu/bookingservice/config/MessagingProperties.java`
- `src/main/java/iuh/fit/edu/bookingservice/config/RabbitMqConfig.java`
- `src/main/resources/application.properties`
