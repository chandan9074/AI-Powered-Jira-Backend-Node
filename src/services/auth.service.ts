import { prisma } from '../config/db.ts';
import { redis } from '../config/redis.ts';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { generateTokens } from '../utils/tokens.ts';
import { EmailService } from './email.service.ts';
import jwt from 'jsonwebtoken';

export class AuthService {

  static async requestRegistrationOtp(email: string) {
    // Check if user already exists in DB to prevent sending OTPs to registered users
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    // Generate a secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store in Redis with a 10-minute expiration (600 seconds)
    // The key is prefixed with 'reg_otp:' to avoid namespace collisions
    await redis.set(`reg_otp:${email}`, otp, 'EX', 600);

    // Send the email (in a real app, you might want to run this asynchronously)
    await EmailService.sendOtpEmail(email, otp);
  }

  static async registerUser(email: string, passwordPlain: string, name: string, otp: string) {
    // Check Redis for the OTP
    const storedOtp = await redis.get(`reg_otp:${email}`);
    
    if (!storedOtp) throw new Error('OTP has expired or was never requested');
    if (storedOtp !== otp) throw new Error('Invalid OTP');

    // Make sure user doesn't exist (edge case: registered in another tab)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    // Hash password and create user
    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        accounts: {
          create: { provider: 'credentials', providerAccountId: email, passwordHash }
        }
      }
    });

    // Clean up: Delete the OTP from Redis so it cannot be reused
    await redis.del(`reg_otp:${email}`);

    // Create session and return tokens (from previous implementation)
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

  static async logoutUser(refreshToken: string) {
    try {
      const decoded = jwt.decode(refreshToken) as { userId: string } | null;

      if (decoded && decoded.userId) {
        // 2. Delete the session from Redis
        await redis.del(`refresh_token:${decoded.userId}`);
      }
    } catch (error) {
      console.error('Logout error: Failed to clear Redis session', error);
    }
  }

  private static async createSession(userId: string) {
    const { accessToken, refreshToken } = generateTokens(userId);

    // Store refresh token in Redis. 
    // 'EX' sets expiration in seconds (7 days = 604800 seconds)
    await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    return { userId, accessToken, refreshToken };
  }
}