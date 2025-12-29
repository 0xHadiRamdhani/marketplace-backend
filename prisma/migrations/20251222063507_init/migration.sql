-- CreateTable
CREATE TABLE "products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kode_produk" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "merk_motor" TEXT NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "harga" REAL NOT NULL,
    "deskripsi" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "products_kode_produk_key" ON "products"("kode_produk");
