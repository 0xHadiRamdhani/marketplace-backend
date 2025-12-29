import { Product, ProductImage, Order, OrderItem, Payment } from '@prisma/client';

// Type untuk membuat produk baru (tanpa id, createdAt, updatedAt)
export type CreateProductInput = {
    kodeProduk: string;
    nama: string;
    kategori: string;
    merkMotor: string;
    stok: number;
    harga: number;
    deskripsi?: string;
};

// Type untuk update produk (semua field optional kecuali yang dibutuhkan)
export type UpdateProductInput = Partial<CreateProductInput>;

// Type untuk query parameters
export type ProductQueryParams = {
    page?: number;
    limit?: number;
    search?: string;
    kategori?: string;
    merkMotor?: string;
};

// Type untuk response pagination
export type PaginatedResponse<T> = {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

// Type untuk upload gambar
export type CreateProductImageInput = {
    productId: number;
    imageUrl: string;
    altText?: string;
    isPrimary?: boolean;
};

// Type untuk membuat order
export type CreateOrderInput = {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: {
        productId: number;
        quantity: number;
    }[];
    notes?: string;
};

// Type untuk update order
export type UpdateOrderInput = {
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    notes?: string;
};

// Type untuk payment
export type CreatePaymentInput = {
    orderId: number;
    paymentMethod: string;
    amount: number;
    reference?: string;
};

// Type untuk response dengan relasi
export type ProductWithImages = Product & {
    images: ProductImage[];
};

export type OrderWithDetails = Order & {
    items: (OrderItem & {
        product: Product;
    })[];
    payments: Payment[];
};

// Export types dari Prisma
export type { Product, ProductImage, Order, OrderItem, Payment };
