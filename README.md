# Marketplace Sparepart Motor Bengkel API

Backend API untuk sistem marketplace sparepart motor bengkel, dibangun dengan Elysia.js dan Bun runtime.

## Fitur Utama

### Manajemen Produk
- CRUD produk sparepart motor
- Kategori dan merk motor
- Pencarian dan filtering produk
- Pagination untuk daftar produk

### Manajemen Gambar
- Upload multiple gambar per produk
- Set gambar utama (primary)
- Validasi tipe dan ukuran file
- Penyimpanan lokal dengan nama file unik

### Sistem Order
- Pemesanan produk dengan otomatisasi stock
- Manajemen status order (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- Multiple items per order
- Kalkulasi otomatis total harga

### Sistem Pembayaran
- Multiple payment records per order
- Status pembayaran (PENDING, COMPLETED, FAILED, REFUNDED)
- Otomatis update status order saat pembayaran lunas
- Support berbagai metode pembayaran

## Teknologi yang Digunakan
- Runtime: Bun
- Framework: Elysia.js
- Database: SQLite dengan Prisma ORM
- Language: TypeScript
- Storage: Local file storage untuk gambar

## Getting Started

### Prerequisites
- Bun runtime terinstall
- Node.js (untuk Prisma CLI)

### Installation
```bash
# Clone repository
git clone https://github.com/0xHadiRamdhani/marketplace-backend
cd marketplace-backend

# Install dependencies
bun install

# Setup database
bunx prisma migrate dev
bunx prisma generate

# Jalankan development server
bun run dev
```

### Development Commands
```bash
# Start development server
bun run dev

# Open database GUI
bunx prisma studio

# Generate Prisma Client
bunx prisma generate

# Run database migrations
bunx prisma migrate dev
```

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Root Endpoint
```
GET /
```

### Product Endpoints
```
GET    /api/products          # List products with pagination
GET    /api/products/:id      # Get product details
POST   /api/products          # Create new product
PUT    /api/products/:id      # Update product
DELETE /api/products/:id      # Delete product
```

### Image Endpoints
```
POST   /api/images/upload/:productId     # Upload product image (base64)
GET    /api/images/product/:productId    # Get product images
PUT    /api/images/:id/primary           # Set as primary image
DELETE /api/images/:id                   # Delete image
```

### Order Endpoints
```
GET    /api/orders            # List orders with pagination
GET    /api/orders/:id         # Get order details
POST   /api/orders             # Create new order
PUT    /api/orders/:id         # Update order
POST   /api/orders/:id/payment # Add payment
PUT    /api/orders/:id/payment/:paymentId # Update payment status
```

## Dokumentasi Lengkap
Lihat file [API_DOCUMENTATION.md](API_DOCUMENTATION.md) untuk dokumentasi API yang lengkap dengan contoh request/response.

## Struktur Database
Lihat file [database-design.md](database-design.md) untuk desain database dan relasi antar tabel.

## Development Server
- API Server: http://localhost:3000
- Prisma Studio: http://localhost:51212

## Catatan Penting
1. **Stock Management**: Stock otomatis berkurang saat order dibuat
2. **Validasi**: Semua input divalidasi dengan proper error handling
3. **File Upload**: Maksimal 5MB, format JPG/PNG/WebP
4. **Order Status**: Otomatis berubah saat pembayaran lunas
5. **Error Handling**: Response error konsisten di semua endpoint

## Next Steps (Future Development)
- [ ] Integration dengan payment gateway (Stripe, Midtrans, dll)
- [ ] Authentication & authorization system
- [ ] Email notifications untuk order status
- [ ] Dashboard admin untuk manajemen
- [ ] Export laporan penjualan
- [ ] Integration dengan shipping/logistics API