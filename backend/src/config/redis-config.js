const Redis = require('ioredis');

let redis;

if (process.env.REDIS_URL) {
    // Upstash / remote Redis via full URL
    redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        tls: { rejectUnauthorized: false }, 
    });
} else {
    // Local Redis
    redis = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        maxRetriesPerRequest: null,
    });
}

redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis error:', err));

module.exports = redis;