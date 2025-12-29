# API Documentation - Marketplace Sparepart Motor Bengkel

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, this API does not require authentication (development mode).

---

## Product Management

### Get All Products
**GET** `/api/products`

Get paginated list of products with optional filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in product name, code, or description
- `kategori` (optional): Filter by category
- `merkMotor` (optional): Filter by motorcycle brand

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "kodeProduk": "SP001",
      "nama": "Spark Plug Honda",
      "kategori": "Engine",
      "merkMotor": "Honda",
      "stok": 10,
      "harga": 25000,
      "deskripsi": "Spark plug original Honda",
      "createdAt": "2024-12-29T12:00:00.000Z",
      "updatedAt": "2024-12-29T12:00:00.000Z",
      "images": [
        {
          "id": 1,
          "imageUrl": "/uploads/products/abc123.jpg",
          "altText": "Spark Plug Honda",
          "isPrimary": true,
          "createdAt": "2024-12-29T12:00:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Get Product by ID
**GET** `/api/products/:id`

**Response:**
```json
{
  "id": 1,
  "kodeProduk": "SP001",
  "nama": "Spark Plug Honda",
  "kategori": "Engine",
  "merkMotor": "Honda",
  "stok": 10,
  "harga": 25000,
  "deskripsi": "Spark plug original Honda",
  "createdAt": "2024-12-29T12:00:00.000Z",
  "updatedAt": "2024-12-29T12:00:00.000Z",
  "images": []
}
```

### Create Product
**POST** `/api/products`

**Request Body:**
```json
{
  "kodeProduk": "SP001",
  "nama": "Spark Plug Honda",
  "kategori": "Engine",
  "merkMotor": "Honda",
  "stok": 10,
  "harga": 25000,
  "deskripsi": "Spark plug original Honda"
}
```

**Response:**
```json
{
  "message": "Produk berhasil ditambahkan",
  "data": {
    "id": 1,
    "kodeProduk": "SP001",
    "nama": "Spark Plug Honda",
    "kategori": "Engine",
    "merkMotor": "Honda",
    "stok": 10,
    "harga": 25000,
    "deskripsi": "Spark plug original Honda",
    "createdAt": "2024-12-29T12:00:00.000Z",
    "updatedAt": "2024-12-29T12:00:00.000Z"
  }
}
```

### Update Product
**PUT** `/api/products/:id`

**Request Body:** (All fields optional)
```json
{
  "kodeProduk": "SP001-NEW",
  "nama": "Spark Plug Honda Updated",
  "kategori": "Engine",
  "merkMotor": "Honda",
  "stok": 15,
  "harga": 30000,
  "deskripsi": "Updated description"
}
```

### Delete Product
**DELETE** `/api/products/:id`

**Response:**
```json
{
  "message": "Produk berhasil dihapus"
}
```

---

## Image Management

### Upload Product Image
**POST** `/api/images/upload/:productId`

Upload image for a specific product using base64 encoding.

**Request Body:**
```json
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "fileName": "product-image.jpg",
  "altText": "Optional alt text"
}
```

**Response:**
```json
{
  "message": "Gambar berhasil diupload",
  "data": {
    "id": 1,
    "productId": 1,
    "imageUrl": "/uploads/products/abc123.jpg",
    "altText": "Spark Plug Honda",
    "isPrimary": true,
    "createdAt": "2024-12-29T12:00:00.000Z"
  }
}
```

### Get Product Images
**GET** `/api/images/product/:productId`

Get all images for a specific product.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "imageUrl": "/uploads/products/abc123.jpg",
      "altText": "Spark Plug Honda",
      "isPrimary": true,
      "createdAt": "2024-12-29T12:00:00.000Z"
    },
    {
      "id": 2,
      "imageUrl": "/uploads/products/def456.jpg",
      "altText": "Spark Plug Honda Side View",
      "isPrimary": false,
      "createdAt": "2024-12-29T12:05:00.000Z"
    }
  ]
}
```

### Set Primary Image
**PUT** `/api/images/:id/primary`

Set an image as the primary image for its product.

**Response:**
```json
{
  "message": "Gambar utama berhasil diupdate",
  "data": {
    "id": 1,
    "productId": 1,
    "imageUrl": "/uploads/products/abc123.jpg",
    "altText": "Spark Plug Honda",
    "isPrimary": true,
    "createdAt": "2024-12-29T12:00:00.000Z"
  }
}
```

### Delete Image
**DELETE** `/api/images/:id`

Delete an image from database.

**Response:**
```json
{
  "message": "Gambar berhasil dihapus"
}
```

---

## Order Management

### Get All Orders
**GET** `/api/orders`

Get paginated list of orders with optional filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in customer name, phone, or order number
- `status` (optional): Filter by order status

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "orderNumber": "ORD-1234567890-ABC",
      "customerName": "Budi Santoso",
      "customerPhone": "081234567890",
      "customerAddress": "Jl. Sudirman No. 123, Jakarta",
      "totalAmount": 75000,
      "status": "PENDING",
      "notes": "Tolong packing rapi",
      "createdAt": "2024-12-29T12:00:00.000Z",
      "updatedAt": "2024-12-29T12:00:00.000Z",
      "items": [
        {
          "id": 1,
          "orderId": 1,
          "productId": 1,
          "quantity": 3,
          "price": 25000,
          "subtotal": 75000,
          "product": {
            "id": 1,
            "kodeProduk": "SP001",
            "nama": "Spark Plug Honda",
            "kategori": "Engine",
            "merkMotor": "Honda",
            "stok": 7,
            "harga": 25000
          }
        }
      ],
      "payments": [
        {
          "id": 1,
          "orderId": 1,
          "paymentMethod": "MANUAL_TRANSFER",
          "amount": 75000,
          "status": "PENDING",
          "paymentDate": null,
          "reference": null,
          "createdAt": "2024-12-29T12:00:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### Get Order by ID
**GET** `/api/orders/:id`

**Response:** Same as single order object above

### Create Order
**POST** `/api/orders`

Create a new order with automatic stock management.

**Request Body:**
```json
{
  "customerName": "Budi Santoso",
  "customerPhone": "081234567890",
  "customerAddress": "Jl. Sudirman No. 123, Jakarta",
  "items": [
    {
      "productId": 1,
      "quantity": 3
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "notes": "Tolong packing rapi"
}
```

**Response:**
```json
{
  "message": "Order berhasil dibuat",
  "data": {
    "id": 1,
    "orderNumber": "ORD-1234567890-ABC",
    "customerName": "Budi Santoso",
    "customerPhone": "081234567890",
    "customerAddress": "Jl. Sudirman No. 123, Jakarta",
    "totalAmount": 75000,
    "status": "PENDING",
    "notes": "Tolong packing rapi",
    "createdAt": "2024-12-29T12:00:00.000Z",
    "updatedAt": "2024-12-29T12:00:00.000Z",
    "items": [...],
    "payments": [...]
  }
}
```

### Update Order
**PUT** `/api/orders/:id`

Update order details (cannot update delivered or cancelled orders).

**Request Body:** (All fields optional)
```json
{
  "customerName": "Budi Santoso Updated",
  "customerPhone": "081234567891",
  "customerAddress": "Jl. Thamrin No. 456, Jakarta",
  "status": "CONFIRMED",
  "notes": "Updated notes"
}
```

### Add Payment
**POST** `/api/orders/:id/payment`

Add a payment record to an order.

**Request Body:**
```json
{
  "paymentMethod": "BANK_TRANSFER",
  "amount": 75000,
  "reference": "TRX123456789"
}
```

**Response:**
```json
{
  "message": "Pembayaran berhasil ditambahkan",
  "data": {
    "id": 2,
    "orderId": 1,
    "paymentMethod": "BANK_TRANSFER",
    "amount": 75000,
    "status": "PENDING",
    "paymentDate": null,
    "reference": "TRX123456789",
    "createdAt": "2024-12-29T12:05:00.000Z"
  },
  "remainingAmount": 0
}
```

### Update Payment Status
**PUT** `/api/orders/:id/payment/:paymentId`

Update payment status (automatically updates order status if fully paid).

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

**Response:**
```json
{
  "message": "Status pembayaran berhasil diupdate",
  "data": {
    "id": 1,
    "orderId": 1,
    "paymentMethod": "MANUAL_TRANSFER",
    "amount": 75000,
    "status": "COMPLETED",
    "paymentDate": "2024-12-29T12:10:00.000Z",
    "reference": null,
    "createdAt": "2024-12-29T12:00:00.000Z"
  }
}
```

---

## 📊 Order Status

### Order Status Values
- `PENDING`: Order baru dibuat, menunggu konfirmasi
- `CONFIRMED`: Order dikonfirmasi, siap diproses
- `PROCESSING`: Sedang diproses/dikemas
- `SHIPPED`: Sudah dikirim
- `DELIVERED`: Sudah diterima customer
- `CANCELLED`: Order dibatalkan

### Payment Status Values
- `PENDING`: Menunggu pembayaran
- `COMPLETED`: Pembayaran berhasil
- `FAILED`: Pembayaran gagal
- `REFUNDED`: Pembayaran direfund

---

## 🚨 Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "error": "Validation Error",
  "message": "Data yang dikirim tidak valid",
  "details": "Specific validation error message"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Endpoint tidak ditemukan"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "Terjadi kesalahan pada server"
}
```

---

## 📝 Notes

1. **Image Upload**: Images are uploaded using base64 encoding. Maximum file size is 5MB. Supported formats: JPEG, PNG, WebP.
2. **Stock Management**: When creating an order, stock is automatically deducted. If payment fails or order is cancelled, stock should be manually restored.
3. **Order Numbers**: Automatically generated in format `ORD-{timestamp}-{random-string}`.
4. **Payment Integration**: Currently supports manual payment recording. Payment gateway integration can be added later.
5. **File Storage**: Images are stored locally in `/uploads/products/` directory.

---

## Development Setup

```bash
# Install dependencies
bun install

# Run database migrations
bunx prisma migrate dev

# Generate Prisma Client
bunx prisma generate

# Start development server
bun run dev

# Open Prisma Studio (database GUI)
bunx prisma studio
```

Server will run at: http://localhost:3000
Prisma Studio will run at: http://localhost:51212