import { Redis } from 'ioredis';

// Connect to the Redis instance, defaulting to localhost for local development
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Event listeners for monitoring connection health
redis.on('connect', () => {
  console.log('🟢 Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('🔴 Redis connection error:', err);
});