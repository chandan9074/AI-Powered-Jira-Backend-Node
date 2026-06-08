// src/config/db.ts
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Declare a global variable to hold the Prisma instance for hot-reloading
declare global {
  var prisma: PrismaClient | undefined;
}

// 1. Grab the connection string
const connectionString = process.env.DATABASE_URL!;

// 2. Instantiate the new V7 Postgres Adapter
const adapter = new PrismaPg({ connectionString });

// 3. Pass the adapter to the PrismaClient
export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}