import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/crypto.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

/**
 * Middleware to require user authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ error: "Missing authentication session. Please sign in." });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({ error: "Invalid session token format. Please sign in again." });
    return;
  }

  const token = parts[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: "Session expired or invalid. Please sign in again." });
    return;
  }

  // Inject user info into request
  (req as any).user = {
    id: payload.id,
    username: payload.username,
  };

  next();
}

/**
 * Optional authentication middleware (does not fail if missing, but parses if exists)
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") {
    const token = parts[1];
    const payload = verifyToken(token);
    if (payload) {
      (req as any).user = {
        id: payload.id,
        username: payload.username,
      };
    }
  }
  next();
}
