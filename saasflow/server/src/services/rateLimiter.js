/**
 * SaaSFlow - Dual Rate Limiter Service
 * Implements:
 * 1. Fixed-Window Counter (PRD Graded Default)
 * 2. Token-Bucket Limiter (Extra Feature 5 / Stretch Sandbox)
 * Supports explicit 'now' parameter for deterministic testing.
 */

// In-memory states
const fixedWindows = new Map(); // key: `${tenantId}:${windowIndex}` -> count
const tokenBuckets = new Map(); // key: tenantId -> { tokens, lastRefillTime }

export const rateLimiter = {
  /**
   * Fixed-Window Counter Limiter
   * Default limits: Free: 5/min, Starter: 20/min, Pro: 60/min
   * Resets every 60-second calendar boundary.
   */
  checkFixedWindow(tenantId, limitPerMin, now = Date.now()) {
    const windowSizeMs = 60000;
    const windowIndex = Math.floor(now / windowSizeMs);
    const windowKey = `${tenantId}:${windowIndex}`;
    const windowStart = windowIndex * windowSizeMs;
    const windowEnd = windowStart + windowSizeMs;
    const resetSeconds = Math.max(1, Math.ceil((windowEnd - now) / 1000));

    const currentCount = fixedWindows.get(windowKey) || 0;

    if (currentCount >= limitPerMin) {
      return {
        allowed: false,
        algorithm: 'fixed-window',
        limit: limitPerMin,
        remaining: 0,
        retryAfter: resetSeconds,
        resetSeconds,
        windowIndex,
        currentCount
      };
    }

    // Increment and allow
    const newCount = currentCount + 1;
    fixedWindows.set(windowKey, newCount);

    return {
      allowed: true,
      algorithm: 'fixed-window',
      limit: limitPerMin,
      remaining: Math.max(0, limitPerMin - newCount),
      retryAfter: 0,
      resetSeconds,
      windowIndex,
      currentCount: newCount
    };
  },

  /**
   * Token Bucket Limiter
   * Smoothly replenishes tokens at (limit / 60) per second up to max capacity.
   */
  checkTokenBucket(tenantId, capacity, now = Date.now()) {
    const refillRatePerSec = capacity / 60; // e.g. 5/60 = 0.0833 tokens/sec
    let bucket = tokenBuckets.get(tenantId);

    if (!bucket) {
      bucket = {
        tokens: capacity,
        lastRefillTime: now
      };
    } else {
      const elapsedMs = Math.max(0, now - bucket.lastRefillTime);
      const refillAmount = (elapsedMs / 1000) * refillRatePerSec;
      bucket.tokens = Math.min(capacity, bucket.tokens + refillAmount);
      bucket.lastRefillTime = now;
    }

    if (bucket.tokens < 1) {
      const missingTokens = 1 - bucket.tokens;
      const retryAfterSeconds = Math.max(1, Math.ceil(missingTokens / refillRatePerSec));
      tokenBuckets.set(tenantId, bucket);
      return {
        allowed: false,
        algorithm: 'token-bucket',
        limit: capacity,
        remaining: 0,
        retryAfter: retryAfterSeconds,
        resetSeconds: retryAfterSeconds,
        currentTokens: Number(bucket.tokens.toFixed(2))
      };
    }

    // Consume 1 token
    bucket.tokens -= 1;
    tokenBuckets.set(tenantId, bucket);

    return {
      allowed: true,
      algorithm: 'token-bucket',
      limit: capacity,
      remaining: Math.floor(bucket.tokens),
      retryAfter: 0,
      resetSeconds: 0,
      currentTokens: Number(bucket.tokens.toFixed(2))
    };
  },

  /**
   * Universal check method routing to chosen algorithm
   */
  check(tenantId, limitPerMin, now = Date.now(), algorithm = 'fixed-window') {
    if (algorithm === 'token-bucket') {
      return this.checkTokenBucket(tenantId, limitPerMin, now);
    }
    return this.checkFixedWindow(tenantId, limitPerMin, now);
  },

  /**
   * Clears all limiter state
   */
  reset() {
    fixedWindows.clear();
    tokenBuckets.clear();
  }
};

