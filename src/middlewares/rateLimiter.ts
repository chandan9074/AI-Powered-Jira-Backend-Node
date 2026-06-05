// src/middlewares/rateLimiter.ts
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis';
import { Request } from 'express';

// Strict rate limiter specifically for the OTP endpoint
export const otpLimiter = rateLimit({
  // Use our existing Redis connection to store the hit counts
  store: new RedisStore({
    // @ts-expect-error - rate-limit-redis has slightly mismatched types for ioredis, but the implementation is perfectly compatible
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 3, // Limit each email/IP to 3 requests per 15 minutes
  
  message: { 
    error: 'Too many OTP requests. Please check your inbox or wait 15 minutes before trying again.' 
  },
  
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Architect move: Throttle by the email address being targeted, fallback to IP
  keyGenerator: (req: Request) => {
    if (req.body && req.body.email) {
      return `ratelimit:otp:${req.body.email.toLowerCase()}`;
    }
    // Fallback to IP address if email is missing (e.g., malformed request)
    return `ratelimit:ip:${ipKeyGenerator(req.ip ?? '')}`;
  },
});