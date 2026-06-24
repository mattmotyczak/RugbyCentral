import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Creates a rate limiting middleware
 * @param windowMs Time window in milliseconds (default 10 seconds)
 * @param max Max requests allowed in the window (default 10 requests)
 * @param message Custom message returned on rate limit exceed
 */
export function createRateLimiter(
  windowMs = 10000,
  max = 10,
  message = "Too many requests. Please slow down and try again later."
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const ipStr = Array.isArray(ip) ? ip[0] : String(ip);
    const now = Date.now();

    if (!store[ipStr]) {
      store[ipStr] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    const client = store[ipStr];

    if (now > client.resetTime) {
      // Reset window
      client.count = 1;
      client.resetTime = now + windowMs;
      return next();
    }

    client.count++;

    if (client.count > max) {
      res.status(429).json({
        error: message,
        retryAfterMs: client.resetTime - now,
      });
      return;
    }

    next();
  };
}
