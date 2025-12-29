import { Elysia, t } from 'elysia';
import { prisma } from '../lib/db';
import type { CreateOrderInput, UpdateOrderInput, CreatePaymentInput, OrderWithDetails } from '../types/types';
import type { Order, Payment } from '@prisma/client';

export const ordersRoute = new Elysia({ prefix: '/api/orders' })
    // GET /api/orders - Daftar semua order dengan pagination & filter
    .get(
        '/',
        async ({ query }) => {
            const page = Number(query.page) || 1;
            const limit = Number(query.limit) || 10;
            const skip = (page - 1) * limit;

            // Build filter conditions
            const where: any = {};

            if (query.status) {
                where.status = query.status;
            }

            if (query.search) {
                where.OR = [
                    { customerName: { contains: query.search, mode: 'insensitive' } },
                    { customerPhone: { contains: query.search, mode: 'insensitive' } },
                    { orderNumber: { contains: query.search, mode: 'insensitive' } },
                ];
            }

            // Get total count for pagination
            const total = await prisma.order.count({ where });

            // Get orders with pagination and relations
            const orders = await prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    },
                    payments: true
                }
            });

            return {
                data: orders,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        },
        {
            query: t.Object({
                page: t.Optional(t.String()),
                limit: t.Optional(t.String()),
                search: t.Optional(t.String()),
                status: t.Optional(t.String()),
            }),
        }
    )

    // GET /api/orders/:id - Detail order berdasarkan ID
    .get(
        '/:id',
        async ({ params, set }) => {
            const order = await prisma.order.findUnique({
                where: { id: Number(params.id) },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    },
                    payments: true
                }
            });

            if (!order) {
                set.status = 404;
                return { message: 'Order tidak ditemukan' };
            }

            return order;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
        }
    )

    // POST /api/orders - Buat order baru
    .post(
        '/',
        async ({ body, set }) => {
            try {
                const { customerName, customerPhone, customerAddress, items, notes } = body;

                // Validasi items tidak kosong
                if (!items || items.length === 0) {
                    set.status = 400;
                    return { message: 'Minimal harus ada 1 item' };
                }

                // Generate nomor order unik
                const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

                // Hitung total dan validasi stock
                let totalAmount = 0;
                const orderItems: Array<{
                    productId: number;
                    quantity: number;
                    price: number;
                    subtotal: number;
                }> = [];

                for (const item of items) {
                    const product = await prisma.product.findUnique({
                        where: { id: item.productId }
                    });

                    if (!product) {
                        set.status = 400;
                        return { message: `Produk dengan ID ${item.productId} tidak ditemukan` };
                    }

                    if (product.stok < item.quantity) {
                        set.status = 400;
                        return { message: `Stock tidak cukup untuk produk ${product.nama}` };
                    }

                    const subtotal = product.harga * item.quantity;
                    totalAmount += subtotal;

                    orderItems.push({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: product.harga,
                        subtotal
                    });
                }

                // Buat order dengan transaction
                const order = await prisma.$transaction(async (tx) => {
                    // Buat order
                    const newOrder = await tx.order.create({
                        data: {
                            orderNumber,
                            customerName,
                            customerPhone,
                            customerAddress,
                            totalAmount,
                            status: 'PENDING',
                            notes
                        }
                    });

                    // Buat order items
                    for (const item of orderItems) {
                        await tx.orderItem.create({
                            data: {
                                orderId: newOrder.id,
                                ...item
                            }
                        });

                        // Kurangi stock produk
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stok: { decrement: item.quantity } }
                        });
                    }

                    // Buat payment record
                    await tx.payment.create({
                        data: {
                            orderId: newOrder.id,
                            paymentMethod: 'MANUAL_TRANSFER',
                            amount: totalAmount,
                            status: 'PENDING'
                        }
                    });

                    return newOrder;
                });

                // Return order dengan relasi
                const orderWithDetails = await prisma.order.findUnique({
                    where: { id: order.id },
                    include: {
                        items: {
                            include: {
                                product: true
                            }
                        },
                        payments: true
                    }
                });

                return {
                    message: 'Order berhasil dibuat',
                    data: orderWithDetails
                };

            } catch (error) {
                console.error('Error creating order:', error);
                set.status = 500;
                return { message: 'Gagal membuat order' };
            }
        },
        {
            body: t.Object({
                customerName: t.String({ minLength: 1 }),
                customerPhone: t.String({ minLength: 1 }),
                customerAddress: t.String({ minLength: 1 }),
                items: t.Array(t.Object({
                    productId: t.Number({ minimum: 1 }),
                    quantity: t.Number({ minimum: 1 })
                })),
                notes: t.Optional(t.String())
            }),
        }
    )

    // PUT /api/orders/:id - Update order
    .put(
        '/:id',
        async ({ params, body, set }) => {
            try {
                const orderId = Number(params.id);

                // Cek order ada
                const existingOrder = await prisma.order.findUnique({
                    where: { id: orderId }
                });

                if (!existingOrder) {
                    set.status = 404;
                    return { message: 'Order tidak ditemukan' };
                }

                // Tidak bisa update order yang sudah delivered atau cancelled
                if (['DELIVERED', 'CANCELLED'].includes(existingOrder.status)) {
                    set.status = 400;
                    return { message: 'Order tidak bisa diupdate karena sudah selesai atau dibatalkan' };
                }

                const updatedOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: body as UpdateOrderInput,
                    include: {
                        items: {
                            include: {
                                product: true
                            }
                        },
                        payments: true
                    }
                });

                return {
                    message: 'Order berhasil diupdate',
                    data: updatedOrder
                };

            } catch (error) {
                console.error('Error updating order:', error);
                set.status = 500;
                return { message: 'Gagal mengupdate order' };
            }
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                customerName: t.Optional(t.String({ minLength: 1 })),
                customerPhone: t.Optional(t.String({ minLength: 1 })),
                customerAddress: t.Optional(t.String({ minLength: 1 })),
                status: t.Optional(t.Enum({
                    PENDING: 'PENDING',
                    CONFIRMED: 'CONFIRMED',
                    PROCESSING: 'PROCESSING',
                    SHIPPED: 'SHIPPED',
                    DELIVERED: 'DELIVERED',
                    CANCELLED: 'CANCELLED'
                })),
                notes: t.Optional(t.String())
            }),
        }
    )

    // POST /api/orders/:id/payment - Tambah pembayaran
    .post(
        '/:id/payment',
        async ({ params, body, set }) => {
            try {
                const orderId = Number(params.id);

                // Cek order ada
                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                    include: { payments: true }
                });

                if (!order) {
                    set.status = 404;
                    return { message: 'Order tidak ditemukan' };
                }

                // Hitung total yang sudah dibayar
                const totalPaid = order.payments
                    .filter((p: Payment) => p.status === 'COMPLETED')
                    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

                const remainingAmount = order.totalAmount - totalPaid;

                if (remainingAmount <= 0) {
                    set.status = 400;
                    return { message: 'Order sudah lunas' };
                }

                // Buat payment baru
                const payment = await prisma.payment.create({
                    data: {
                        orderId,
                        paymentMethod: body.paymentMethod,
                        amount: body.amount,
                        reference: body.reference,
                        status: 'PENDING'
                    }
                });

                return {
                    message: 'Pembayaran berhasil ditambahkan',
                    data: payment,
                    remainingAmount
                };

            } catch (error) {
                console.error('Error creating payment:', error);
                set.status = 500;
                return { message: 'Gagal menambahkan pembayaran' };
            }
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                paymentMethod: t.String({ minLength: 1 }),
                amount: t.Number({ minimum: 0 }),
                reference: t.Optional(t.String())
            }),
        }
    )

    // PUT /api/orders/:id/payment/:paymentId - Update status pembayaran
    .put(
        '/:id/payment/:paymentId',
        async ({ params, body, set }) => {
            try {
                const paymentId = Number(params.paymentId);

                const payment = await prisma.payment.findUnique({
                    where: { id: paymentId }
                });

                if (!payment) {
                    set.status = 404;
                    return { message: 'Pembayaran tidak ditemukan' };
                }

                // Update payment
                const updatedPayment = await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: body.status,
                        paymentDate: body.status === 'COMPLETED' ? new Date() : null
                    }
                });

                // Jika payment completed, cek apakah order sudah lunas
                if (body.status === 'COMPLETED') {
                    const order = await prisma.order.findUnique({
                        where: { id: payment.orderId },
                        include: { payments: true }
                    });

                    if (order) {
                        const totalPaid = order.payments
                            .filter((p: Payment) => p.status === 'COMPLETED')
                            .reduce((sum: number, p: Payment) => sum + p.amount, 0);

                        // Jika sudah lunas, update order status
                        if (totalPaid >= order.totalAmount) {
                            await prisma.order.update({
                                where: { id: order.id },
                                data: { status: 'CONFIRMED' }
                            });
                        }
                    }
                }

                return {
                    message: 'Status pembayaran berhasil diupdate',
                    data: updatedPayment
                };

            } catch (error) {
                console.error('Error updating payment:', error);
                set.status = 500;
                return { message: 'Gagal mengupdate status pembayaran' };
            }
        },
        {
            params: t.Object({
                id: t.String(),
                paymentId: t.String(),
            }),
            body: t.Object({
                status: t.Enum({
                    PENDING: 'PENDING',
                    COMPLETED: 'COMPLETED',
                    FAILED: 'FAILED',
                    REFUNDED: 'REFUNDED'
                })
            }),
        }
    );