// src/services/auth.service.ts
import { prisma } from '../config/db.ts';
import { redis } from '../config/redis.ts';
import bcrypt from 'bcrypt';
import { generateTokens } from '../utils/tokens.ts';

export class AuthService {
  static async registerUser(email: string, passwordPlain: string, name: string) {
    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    // 2. Hash password and create user + credentials account
    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    
    const user = await prisma.user.create({
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

  static async loginUser(email: string, passwordPlain: string) {
    // 1. Find user and their credentials account
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { accounts: { where: { provider: 'credentials' } } }
    });

    if (!user || user.accounts.length === 0) throw new Error('Invalid credentials');

    // 2. Verify password
    const account = user.accounts[0];
    const isValid = await bcrypt.compare(passwordPlain, account.passwordHash!);
    if (!isValid) throw new Error('Invalid credentials');

    return this.createSession(user.id);
  }

  private static async createSession(userId: string) {
    const { accessToken, refreshToken } = generateTokens(userId);

    // Store refresh token in Redis. 
    // 'EX' sets expiration in seconds (7 days = 604800 seconds)
    await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    return { userId, accessToken, refreshToken };
  }
}