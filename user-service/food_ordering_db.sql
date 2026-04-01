-- ============================================================
--  MINI FOOD ORDERING SYSTEM — Single Database Script
--  Compatible with: MySQL 8.x / MariaDB (HeidiSQL)
--  Database duy nhất: food_ordering_db
-- ============================================================

DROP DATABASE IF EXISTS food_ordering_db;
CREATE DATABASE food_ordering_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE food_ordering_db;

-- BẢNG 1: users (User Service — port 8081)
CREATE TABLE users (
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(20)  NULL,
    role        ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- BẢNG 2: categories (Food Service — port 8082)
CREATE TABLE categories (
    id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(200) NULL,
    sort_order  INT          NOT NULL DEFAULT 0
);

-- BẢNG 3: foods (Food Service — port 8082)
CREATE TABLE foods (
    id           BIGINT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100)  NOT NULL,
    description  VARCHAR(500)  NULL,
    price        DECIMAL(10,0) NOT NULL,
    category_id  INT           NOT NULL,
    image_url    VARCHAR(300)  NULL,
    is_available TINYINT(1)    NOT NULL DEFAULT 1,
    stock_qty    INT           NOT NULL DEFAULT 100,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- BẢNG 4: orders (Order Service — port 8083)
CREATE TABLE orders (
    id               BIGINT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_code       VARCHAR(20)   NOT NULL UNIQUE,
    user_id          BIGINT        NOT NULL,
    user_name        VARCHAR(100)  NULL,
    total_amount     DECIMAL(12,0) NOT NULL DEFAULT 0,
    status           ENUM('PENDING','CONFIRMED','PREPARING','READY','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    note             VARCHAR(300)  NULL,
    delivery_address VARCHAR(200)  NULL,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- BẢNG 5: order_items (Order Service — port 8083)
CREATE TABLE order_items (
    id          BIGINT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id    BIGINT        NOT NULL,
    food_id     BIGINT        NOT NULL,
    food_name   VARCHAR(100)  NOT NULL,
    quantity    INT           NOT NULL DEFAULT 1,
    unit_price  DECIMAL(10,0) NOT NULL,
    subtotal    DECIMAL(12,0) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id)  REFERENCES foods(id)
);

-- BẢNG 6: payments (Payment Service — port 8084)
CREATE TABLE payments (
    id              BIGINT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    payment_code    VARCHAR(30)   NOT NULL UNIQUE,
    order_id        BIGINT        NOT NULL,
    order_code      VARCHAR(20)   NOT NULL,
    user_id         BIGINT        NOT NULL,
    amount          DECIMAL(12,0) NOT NULL,
    payment_method  ENUM('COD','BANKING','MOMO','ZALOPAY') NOT NULL DEFAULT 'COD',
    status          ENUM('PENDING','PROCESSING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    transaction_ref VARCHAR(100)  NULL,
    note            VARCHAR(300)  NULL,
    paid_at         DATETIME      NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id)  REFERENCES users(id)
);

-- BẢNG 7: notifications (Payment Service — port 8084)
CREATE TABLE notifications (
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    order_id    BIGINT       NULL,
    payment_id  BIGINT       NULL,
    type        ENUM('ORDER_PLACED','ORDER_CONFIRMED','ORDER_READY','ORDER_DELIVERED','PAYMENT_SUCCESS','PAYMENT_FAILED') NOT NULL,
    message     VARCHAR(500) NOT NULL,
    is_read     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id),
    FOREIGN KEY (order_id)   REFERENCES orders(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- ============================================================
-- DỮ LIỆU MẪU
-- ============================================================
-- Password: "password" (BCrypt hash)

INSERT INTO users (username, email, password, full_name, phone, role) VALUES
('admin',      'admin@company.vn',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Quan Tri Vien', '0901000001', 'ADMIN'),
('nguyenvana', 'vana@company.vn',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Nguyen Van A',  '0901000002', 'USER'),
('tranthib',   'thib@company.vn',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Tran Thi B',    '0901000003', 'USER'),
('levanc',     'vanc@company.vn',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Le Van C',      '0901000004', 'USER'),
('phamthid',   'thid@company.vn',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Pham Thi D',    '0901000005', 'USER'),
('hoangtrane', 'trane@company.vn',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Hoang Tran E',  '0901000006', 'USER'),
('vuminh',     'minhnv@company.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Vu Minh Nhat',  '0901000007', 'USER'),
('dothihoa',   'hoadtt@company.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Do Thi Hoa',    '0901000008', 'USER');

INSERT INTO categories (name, description, sort_order) VALUES
('Com',         'Cac mon com trua',           1),
('Bun - Pho',   'Bun bo, pho bo, bun mam...',  2),
('Banh mi',     'Banh mi cac loai nhan',       3),
('Do uong',     'Nuoc ngot, tra, ca phe',      4),
('Trang mieng', 'Che, banh ngot, trai cay',    5);

INSERT INTO foods (name, description, price, category_id, is_available, stock_qty) VALUES
('Com suon bi cha',       'Com trang + suon nuong + bi + cha + do chua',        45000, 1, 1, 50),
('Com ga xoi mo',         'Com trang + ga xoi mo gion + rau song',              40000, 1, 1, 40),
('Com tam bi',            'Com tam + bi heo + mo hanh + nuoc mam',              35000, 1, 1, 60),
('Com rang dua bo',       'Com rang thom voi dua muoi va thit bo',              38000, 1, 1, 30),
('Com chien Duong Chau',  'Com chien trung + tom + thit nguoi + rau cu',        42000, 1, 1, 35),
('Pho bo tai chin',       'Pho bo nuoc trong + thit tai chin + hanh ngo',       45000, 2, 1, 40),
('Bun bo Hue',            'Bun bo cay nong dac trung Hue',                      40000, 2, 1, 35),
('Bun mam',               'Bun mam mien Tay + hai san + rau song',              48000, 2, 1, 25),
('Bun thit nuong',        'Bun + thit heo nuong + cha gio + do chua',           42000, 2, 1, 30),
('Hu tieu Nam Vang',      'Hu tieu + xuong ham + tom + thit bam',               45000, 2, 1, 20),
('Banh mi thit nguoi',    'Banh mi + pate + thit nguoi + dua leo + hanh ngo',  20000, 3, 1, 80),
('Banh mi xiu mai',       'Banh mi + xiu mai ca chua nong hoi',                 22000, 3, 1, 60),
('Banh mi heo quay',      'Banh mi + heo quay da gion + rau song',              28000, 3, 1, 40),
('Banh mi trung op la',   'Banh mi + 2 trung op la + pate + sot dac biet',     18000, 3, 1, 50),
('Tra dao cam sa',         'Tra dao + cam + sa tuoi da mat',                     25000, 4, 1, 100),
('Ca phe sua da',          'Ca phe phin truyen thong + sua dac + da',           20000, 4, 1, 100),
('Nuoc cam vat',           'Cam tuoi vat nguyen chat khong duong',               22000, 4, 1, 70),
('Sinh to bo',             'Bo chin + sua dac + da xay',                         30000, 4, 1, 50),
('Che khuc bach',          'Che khuc bach + vai + long nhan + hat luu',          28000, 5, 1, 40),
('Banh flan caramel',      'Banh flan min + caramel thom ngon',                  15000, 5, 1, 60);

INSERT INTO orders (order_code, user_id, user_name, total_amount, status, note, delivery_address) VALUES
('ORD-20240325-001', 2, 'Nguyen Van A', 115000, 'DELIVERED', 'It cay',         'Tang 3 - Phong Marketing'),
('ORD-20240325-002', 3, 'Tran Thi B',    80000, 'PREPARING', NULL,             'Tang 2 - Phong Ke toan'),
('ORD-20240325-003', 4, 'Le Van C',       70000, 'PENDING',   'Khong hanh',    'Tang 1 - Phong IT'),
('ORD-20240324-001', 2, 'Nguyen Van A',  40000, 'CANCELLED', 'Huy do het mon','Tang 3 - Phong Marketing'),
('ORD-20240325-004', 5, 'Pham Thi D',   120000, 'READY',     NULL,             'Tang 4 - Ban Giam Doc');

INSERT INTO order_items (order_id, food_id, food_name, quantity, unit_price, subtotal) VALUES
(1, 1,  'Com suon bi cha', 2, 45000,  90000),
(1, 15, 'Tra dao cam sa',  1, 25000,  25000);

INSERT INTO order_items (order_id, food_id, food_name, quantity, unit_price, subtotal) VALUES
(2, 6,  'Pho bo tai chin',   1, 45000, 45000),
(2, 16, 'Ca phe sua da',     1, 20000, 20000),
(2, 20, 'Banh flan caramel', 1, 15000, 15000);

INSERT INTO order_items (order_id, food_id, food_name, quantity, unit_price, subtotal) VALUES
(3, 11, 'Banh mi thit nguoi', 2, 20000, 40000),
(3, 18, 'Sinh to bo',         1, 30000, 30000);

INSERT INTO order_items (order_id, food_id, food_name, quantity, unit_price, subtotal) VALUES
(4, 2,  'Com ga xoi mo', 1, 40000, 40000);

INSERT INTO order_items (order_id, food_id, food_name, quantity, unit_price, subtotal) VALUES
(5, 8,  'Bun mam',       1, 48000, 48000),
(5, 17, 'Nuoc cam vat',  2, 22000, 44000),
(5, 19, 'Che khuc bach', 1, 28000, 28000);

INSERT INTO payments (payment_code, order_id, order_code, user_id, amount, payment_method, status, transaction_ref, paid_at) VALUES
('PAY-20240325-001', 1, 'ORD-20240325-001', 2, 115000, 'COD',     'SUCCESS', 'COD-001',          '2024-03-25 12:30:00'),
('PAY-20240325-004', 5, 'ORD-20240325-004', 5, 120000, 'BANKING', 'SUCCESS', 'MB-2024032512345', '2024-03-25 11:45:00');

INSERT INTO payments (payment_code, order_id, order_code, user_id, amount, payment_method, status) VALUES
('PAY-20240325-002', 2, 'ORD-20240325-002', 3, 80000, 'BANKING', 'PENDING'),
('PAY-20240325-003', 3, 'ORD-20240325-003', 4, 70000, 'COD',     'PENDING');

INSERT INTO payments (payment_code, order_id, order_code, user_id, amount, payment_method, status, note) VALUES
('PAY-20240324-001', 4, 'ORD-20240324-001', 2, 40000, 'COD', 'FAILED', 'Don hang da bi huy');

INSERT INTO notifications (user_id, order_id, payment_id, type, message, is_read) VALUES
(2, 1, 1, 'ORDER_PLACED',    'Don hang #ORD-20240325-001 da duoc dat thanh cong!',           1),
(2, 1, 1, 'ORDER_DELIVERED', 'Don hang #ORD-20240325-001 da duoc giao. Cam on ban!',         1),
(2, 1, 1, 'PAYMENT_SUCCESS', 'Thanh toan 115,000d cho don #ORD-20240325-001 thanh cong.',    1),
(3, 2, 2, 'ORDER_PLACED',    'Don hang #ORD-20240325-002 da duoc dat thanh cong!',           0),
(3, 2, 2, 'ORDER_CONFIRMED', 'Don hang #ORD-20240325-002 da duoc xac nhan, dang chuan bi.', 0),
(4, 3, 3, 'ORDER_PLACED',    'Don hang #ORD-20240325-003 da duoc dat thanh cong!',           0),
(2, 4, 4, 'ORDER_PLACED',    'Don hang #ORD-20240324-001 da duoc dat thanh cong!',           1),
(5, 5, 5, 'ORDER_PLACED',    'Don hang #ORD-20240325-004 da duoc dat thanh cong!',           1),
(5, 5, 5, 'ORDER_READY',     'Don hang #ORD-20240325-004 san sang, dang giao den ban!',      1),
(5, 5, 5, 'PAYMENT_SUCCESS', 'Thanh toan 120,000d cho don #ORD-20240325-004 thanh cong.',    1);
