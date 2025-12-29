import { Elysia } from "elysia";
import { staticPlugin } from '@elysiajs/static';
import { productsRoute } from "./routes/products";
import { imagesRoute } from "./routes/images";
import { ordersRoute } from "./routes/orders";

const app = new Elysia()
  // Serve static files from uploads directory - disabled for now
  // .use(staticPlugin({
  //     prefix: '/uploads',
  //     assets: './uploads'
  // }))
  // CORS untuk development
  .onRequest(({ request, set }) => {
    set.headers['Access-Control-Allow-Origin'] = '*';
    set.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    set.headers['Access-Control-Allow-Headers'] = 'Content-Type';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }
  })

  // Global error handler
  .onError(({ code, error, set }) => {
    console.error('Error:', error);

    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        error: 'Validation Error',
        message: 'Data yang dikirim tidak valid',
        details: error.message,
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        error: 'Not Found',
        message: 'Endpoint tidak ditemukan',
      };
    }

    set.status = 500;
    return {
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan pada server',
    };
  })

  // Root endpoint
  .get("/", () => ({
    message: "Backend Sparepart Motor Bengkel API",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      productImages: "/api/images",
      orders: "/api/orders",
      health: "/health",
    },
    documentation: "See API_DOCUMENTATION.md for complete API reference",
  }))

  // Health check endpoint
  .get("/health", () => ({
    status: "OK",
    timestamp: new Date().toISOString(),
  }))

  // Register product routes
  .use(productsRoute)
  .use(imagesRoute)
  .use(ordersRoute)

  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
console.log(`📦 API Documentation: http://localhost:3000`);
