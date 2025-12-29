import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

// Create LibSQL client
const libsql = createClient({
    url: 'file:./prisma/dev.db',
});

// Create Prisma adapter
const adapter = new PrismaLibSql(libsql);

// Singleton pattern untuk Prisma Client
// Mencegah multiple instance di development mode
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
