"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = require("ioredis");
// Connect to the Redis instance, defaulting to localhost for local development
exports.redis = new ioredis_1.Redis(process.env.REDIS_URL || 'redis://localhost:6379');
// Event listeners for monitoring connection health
exports.redis.on('connect', () => {
    console.log('🟢 Redis connected successfully');
});
exports.redis.on('error', (err) => {
    console.error('🔴 Redis connection error:', err);
});
