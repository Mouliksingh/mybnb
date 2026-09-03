// utils/cache.js
let Redis;
let redis = null;

try {
  Redis = require("ioredis");
  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  redis = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  redis.on("connect", () => console.log("Redis connected successfully"));
  redis.on("error", () => {}); // Fallback silently if Redis server isn't running
} catch (e) {
  console.warn("ioredis not found or failed to initialize, running with direct MongoDB queries.");
}

async function getOrSetCache(key, cb, ttl = 300) {
  try {
    if (redis && redis.status === "ready") {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    }
  } catch (err) {}

  const fresh = await cb();

  try {
    if (redis && redis.status === "ready" && fresh) {
      await redis.setex(key, ttl, JSON.stringify(fresh));
    }
  } catch (err) {}

  return fresh;
}

async function clearCache(pattern) {
  try {
    if (redis && redis.status === "ready") {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    }
  } catch (err) {}
}

module.exports = { redis, getOrSetCache, clearCache };