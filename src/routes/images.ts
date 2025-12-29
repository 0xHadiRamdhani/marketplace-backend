import { Elysia, t } from 'elysia';
import { prisma } from '../lib/db';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';

export const imagesRoute = new Elysia({ prefix: '/api/images' })
    // Upload gambar produk (sederhana - base64)
    .post(
        '/upload/:productId',
        async ({ params, body, set }) => {
            try {
                const productId = Number(params.productId);

                // Validasi produk ada
                const product = await prisma.product.findUnique({
                    where: { id: productId }
                });

                if (!product) {
                    set.status = 404;
                    return { message: 'Produk tidak ditemukan' };
                }

                // Validasi input
                const { imageData, fileName, altText } = body;
                if (!imageData || !fileName) {
                    set.status = 400;
                    return { message: 'imageData dan fileName diperlukan' };
                }

                // Validasi tipe file dari extension
                const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
                const fileExtension = fileName.split('.').pop()?.toLowerCase();
                if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
                    set.status = 400;
                    return { message: 'Tipe file tidak didukung. Gunakan JPEG, PNG, atau WebP' };
                }

                // Decode base64
                const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');

                // Validasi ukuran file (max 5MB)
                if (buffer.length > 5 * 1024 * 1024) {
                    set.status = 400;
                    return { message: 'Ukuran file terlalu besar. Maksimal 5MB' };
                }

                // Buat direktori uploads jika belum ada
                const uploadDir = join(process.cwd(), 'uploads', 'products');
                await mkdir(uploadDir, { recursive: true });

                // Generate nama file unik
                const newFileName = `${randomUUID()}.${fileExtension}`;
                const filePath = join(uploadDir, newFileName);

                // Simpan file
                await writeFile(filePath, buffer);

                // Cek apakah ini gambar utama pertama
                const existingImages = await prisma.productImage.findMany({
                    where: { productId }
                });

                // Simpan ke database
                const image = await prisma.productImage.create({
                    data: {
                        productId,
                        imageUrl: `/uploads/products/${newFileName}`,
                        altText: altText || product.nama,
                        isPrimary: existingImages.length === 0 // Jadikan primary jika ini gambar pertama
                    }
                });

                return {
                    message: 'Gambar berhasil diupload',
                    data: image
                };

            } catch (error) {
                console.error('Error uploading image:', error);
                set.status = 500;
                return { message: 'Gagal mengupload gambar' };
            }
        },
        {
            params: t.Object({
                productId: t.String()
            }),
            body: t.Object({
                imageData: t.String(),
                fileName: t.String(),
                altText: t.Optional(t.String())
            })
        }
    )

    // Get semua gambar untuk produk tertentu
    .get(
        '/product/:productId',
        async ({ params, set }) => {
            try {
                const productId = Number(params.productId);

                const images = await prisma.productImage.findMany({
                    where: { productId },
                    orderBy: [
                        { isPrimary: 'desc' },
                        { createdAt: 'asc' }
                    ]
                });

                return {
                    data: images
                };

            } catch (error) {
                console.error('Error fetching images:', error);
                set.status = 500;
                return { message: 'Gagal mengambil daftar gambar' };
            }
        },
        {
            params: t.Object({
                productId: t.String()
            })
        }
    )

    // Set gambar utama
    .put(
        '/:id/primary',
        async ({ params, set }) => {
            try {
                const imageId = Number(params.id);

                // Ambil data gambar
                const image = await prisma.productImage.findUnique({
                    where: { id: imageId }
                });

                if (!image) {
                    set.status = 404;
                    return { message: 'Gambar tidak ditemukan' };
                }

                // Reset semua gambar produk ini jadi non-primary
                await prisma.productImage.updateMany({
                    where: { productId: image.productId },
                    data: { isPrimary: false }
                });

                // Set gambar ini jadi primary
                const updatedImage = await prisma.productImage.update({
                    where: { id: imageId },
                    data: { isPrimary: true }
                });

                return {
                    message: 'Gambar utama berhasil diupdate',
                    data: updatedImage
                };

            } catch (error) {
                console.error('Error setting primary image:', error);
                set.status = 500;
                return { message: 'Gagal mengupdate gambar utama' };
            }
        },
        {
            params: t.Object({
                id: t.String()
            })
        }
    )

    // Delete gambar
    .delete(
        '/:id',
        async ({ params, set }) => {
            try {
                const imageId = Number(params.id);

                // Ambil data gambar
                const image = await prisma.productImage.findUnique({
                    where: { id: imageId }
                });

                if (!image) {
                    set.status = 404;
                    return { message: 'Gambar tidak ditemukan' };
                }

                // Hapus dari database
                await prisma.productImage.delete({
                    where: { id: imageId }
                });

                // TODO: Hapus file fisik juga (optional)

                return {
                    message: 'Gambar berhasil dihapus'
                };

            } catch (error) {
                console.error('Error deleting image:', error);
                set.status = 500;
                return { message: 'Gagal menghapus gambar' };
            }
        },
        {
            params: t.Object({
                id: t.String()
            })
        }
    );