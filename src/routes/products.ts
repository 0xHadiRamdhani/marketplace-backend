import { Elysia, t } from 'elysia';
import { prisma } from '../lib/db';
import type { CreateProductInput, UpdateProductInput, ProductQueryParams, ProductWithImages } from '../types/types';

export const productsRoute = new Elysia({ prefix: '/api/products' })
    // GET /api/products - Daftar semua produk dengan pagination & filter
    .get(
        '/',
        async ({ query }) => {
            const page = Number(query.page) || 1;
            const limit = Number(query.limit) || 10;
            const skip = (page - 1) * limit;

            // Build filter conditions
            const where: any = {};

            if (query.search) {
                where.OR = [
                    { nama: { contains: query.search, mode: 'insensitive' } },
                    { kodeProduk: { contains: query.search, mode: 'insensitive' } },
                    { deskripsi: { contains: query.search, mode: 'insensitive' } },
                ];
            }

            if (query.kategori) {
                where.kategori = { contains: query.kategori, mode: 'insensitive' };
            }

            if (query.merkMotor) {
                where.merkMotor = { contains: query.merkMotor, mode: 'insensitive' };
            }

            // Get total count for pagination
            const total = await prisma.product.count({ where });

            // Get products with pagination
            const products = await prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    images: {
                        orderBy: { isPrimary: 'desc' }
                    }
                }
            });

            return {
                data: products,
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
                kategori: t.Optional(t.String()),
                merkMotor: t.Optional(t.String()),
            }),
        }
    )

    // GET /api/products/:id - Detail produk berdasarkan ID
    .get(
        '/:id',
        async ({ params, set }) => {
            const product = await prisma.product.findUnique({
                where: { id: Number(params.id) },
                include: {
                    images: {
                        orderBy: { isPrimary: 'desc' }
                    }
                }
            });

            if (!product) {
                set.status = 404;
                return { message: 'Produk tidak ditemukan' };
            }

            return product;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
        }
    )

    // POST /api/products - Tambah produk baru
    .post(
        '/',
        async ({ body, set }) => {
            try {
                const product = await prisma.product.create({
                    data: body as CreateProductInput,
                });

                return {
                    message: 'Produk berhasil ditambahkan',
                    data: product,
                };
            } catch (err: any) {
                if (err.code === 'P2002') {
                    set.status = 400;
                    return { message: 'Kode produk sudah digunakan' };
                }
                set.status = 500;
                return { message: 'Gagal menambahkan produk' };
            }
        },
        {
            body: t.Object({
                kodeProduk: t.String({ minLength: 1 }),
                nama: t.String({ minLength: 1 }),
                kategori: t.String({ minLength: 1 }),
                merkMotor: t.String({ minLength: 1 }),
                stok: t.Number({ minimum: 0 }),
                harga: t.Number({ minimum: 0 }),
                deskripsi: t.Optional(t.String()),
            }),
        }
    )

    // PUT /api/products/:id - Update produk
    .put(
        '/:id',
        async ({ params, body, set }) => {
            try {
                const product = await prisma.product.update({
                    where: { id: Number(params.id) },
                    data: body as UpdateProductInput,
                });

                return {
                    message: 'Produk berhasil diupdate',
                    data: product,
                };
            } catch (err: any) {
                if (err.code === 'P2025') {
                    set.status = 404;
                    return { message: 'Produk tidak ditemukan' };
                }
                if (err.code === 'P2002') {
                    set.status = 400;
                    return { message: 'Kode produk sudah digunakan' };
                }
                set.status = 500;
                return { message: 'Gagal mengupdate produk' };
            }
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                kodeProduk: t.Optional(t.String({ minLength: 1 })),
                nama: t.Optional(t.String({ minLength: 1 })),
                kategori: t.Optional(t.String({ minLength: 1 })),
                merkMotor: t.Optional(t.String({ minLength: 1 })),
                stok: t.Optional(t.Number({ minimum: 0 })),
                harga: t.Optional(t.Number({ minimum: 0 })),
                deskripsi: t.Optional(t.String()),
            }),
        }
    )

    // DELETE /api/products/:id - Hapus produk
    .delete(
        '/:id',
        async ({ params, set }) => {
            try {
                await prisma.product.delete({
                    where: { id: Number(params.id) },
                });

                return {
                    message: 'Produk berhasil dihapus',
                };
            } catch (err: any) {
                if (err.code === 'P2025') {
                    set.status = 404;
                    return { message: 'Produk tidak ditemukan' };
                }
                set.status = 500;
                return { message: 'Gagal menghapus produk' };
            }
        },
        {
            params: t.Object({
                id: t.String(),
            }),
        }
    );
