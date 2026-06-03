"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// src/services/auth.service.ts
const db_ts_1 = require("../config/db.js");
const redis_ts_1 = require("../config/redis.js");
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokens_ts_1 = require("../utils/tokens.js");
class AuthService {
    static async registerUser(email, passwordPlain, name) {
        // 1. Check if user exists
        const existingUser = await db_ts_1.prisma.user.findUnique({ where: { email } });
        if (existingUser)
            throw new Error('User already exists');
        // 2. Hash password and create user + credentials account
        const passwordHash = await bcrypt_1.default.hash(passwordPlain, 10);
        const user = await db_ts_1.prisma.user.create({
            data: {
                email,
                name,
                accounts: {
                    create: {
                        provider: 'credentials',
                        providerAccountId: email,
                        passwordHash,
                    }
                }
            }
        });
        return this.createSession(user.id);
    }
    static async loginUser(email, passwordPlain) {
        // 1. Find user and their credentials account
        const user = await db_ts_1.prisma.user.findUnique({
            where: { email },
            include: { accounts: { where: { provider: 'credentials' } } }
        });
        if (!user || user.accounts.length === 0)
            throw new Error('Invalid credentials');
        // 2. Verify password
        const account = user.accounts[0];
        const isValid = await bcrypt_1.default.compare(passwordPlain, account.passwordHash);
        if (!isValid)
            throw new Error('Invalid credentials');
        return this.createSession(user.id);
    }
    static async createSession(userId) {
        const { accessToken, refreshToken } = (0, tokens_ts_1.generateTokens)(userId);
        // Store refresh token in Redis. 
        // 'EX' sets expiration in seconds (7 days = 604800 seconds)
        await redis_ts_1.redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);
        return { userId, accessToken, refreshToken };
    }
}
exports.AuthService = AuthService;
