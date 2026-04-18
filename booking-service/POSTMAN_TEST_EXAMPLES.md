# Postman Test Examples - Booking Service

Tài liệu này tổng hợp bộ request mẫu để test Booking Service theo dữ liệu seed trong movie.sql.

## 1) Chuẩn bị

- Đảm bảo Booking Service đang chạy tại port 8083
- Đảm bảo DB đã import movie.sql
- Tạo Postman Environment với biến:
    - baseUrl = http://localhost:8083
    - userId = 2
    - showtimeId = 1

## 2) Test tạo booking thành công

- Method: POST
- URL: {{baseUrl}}/bookings
- Headers:
    - Content-Type: application/json
- Body:

```json
{
    "userId": 2,
    "showtimeId": 1,
    "seatIds": [7, 8],
    "notes": "Test tu Postman"
}
```

Kỳ vọng:

- HTTP 201 Created
- status trong response là PENDING
- Có bookingCode, id, seatLabels

## 3) Test lỗi trùng ghế (Conflict)

Theo dữ liệu mẫu movie.sql, ghế 1 và 2 của showtime 1 đã được đặt.

- Method: POST
- URL: {{baseUrl}}/bookings
- Body:

```json
{
    "userId": 2,
    "showtimeId": 1,
    "seatIds": [1, 2],
    "notes": "Ghe da dat truoc do"
}
```

Kỳ vọng:

- HTTP 409 Conflict
- Message báo ghế đã được đặt

## 4) Test lỗi ghế sai hall (Bad Request)

Theo dữ liệu seed, seatId 111 thuộc hall khác với showtimeId 1.

- Method: POST
- URL: {{baseUrl}}/bookings
- Body:

```json
{
    "userId": 2,
    "showtimeId": 1,
    "seatIds": [111],
    "notes": "Seat khac hall"
}
```

Kỳ vọng:

- HTTP 400 Bad Request
- Message báo ghế không thuộc hall của suất chiếu

## 5) Test lấy tất cả booking

- Method: GET
- URL: {{baseUrl}}/bookings

Kỳ vọng:

- HTTP 200 OK
- Trả về mảng booking

## 6) Test lọc booking theo user

- Method: GET
- URL: {{baseUrl}}/bookings?userId=2

Kỳ vọng:

- HTTP 200 OK
- Danh sách booking của userId = 2

## 7) Test lọc booking theo status

- Method: GET
- URL: {{baseUrl}}/bookings?status=PENDING

Kỳ vọng:

- HTTP 200 OK
- Danh sách booking có status = PENDING

## 8) Lưu ý khi test nhiều lần

- Nếu trước đó bạn đã đặt ghế [7, 8], request ở mục 2 có thể chuyển thành 409.
- Khi đó đổi sang ghế khác còn trống trong cùng hall của showtime 1 để test thành công.
