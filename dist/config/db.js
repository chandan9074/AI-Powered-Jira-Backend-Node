"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Instantiate Prisma, enabling query logging only in development mode
exports.prisma = global.prisma ||
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
// In development, attach the instance to the global object so it survives hot reloads
if (process.env.NODE_ENV !== 'production') {
    global.prisma = exports.prisma;
}
