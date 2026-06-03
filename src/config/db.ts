import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma instance.
// This prevents connection exhaustion during development hot-reloads.
declare global {
  var prisma: PrismaClient | undefined;
}

// Instantiate Prisma, enabling query logging only in development mode
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// In development, attach the instance to the global object so it survives hot reloads
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}