import { Router, Request, Response } from "express";
import { getDB, saveDB } from "../utils/db.js";
import { generateSalt, hashPassword, signToken } from "../utils/crypto.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Apply tight rate limiting on login/register: max 5 requests per 10 seconds
const authRateLimiter = createRateLimiter(10000, 5, "Too many authentication attempts. Please try again in 10 seconds.");

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", authRateLimiter, (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
     res.status(400).json({ error: "Username and password are required." });
     return;
  }

  const trimmedUsername = String(username).trim();
  if (trimmedUsername.length < 3) {
     res.status(400).json({ error: "Username must be at least 3 characters." });
     return;
  }

  if (String(password).length < 6) {
     res.status(400).json({ error: "Password must be at least 6 characters." });
     return;
  }

  const db = getDB();
  const existingUser = db.users.find(
    (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
  );

  if (existingUser) {
     res.status(400).json({ error: "Username is already taken." });
     return;
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const newUser = {
    id: userId,
    username: trimmedUsername,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDB(db);

  const token = signToken({ id: userId, username: trimmedUsername });

  res.status(201).json({
    message: "Registration successful!",
    token,
    user: {
      id: userId,
      username: trimmedUsername,
    },
  });
});

/**
 * POST /api/auth/login
 * Log in an existing user
 */
router.post("/login", authRateLimiter, (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
     res.status(400).json({ error: "Username and password are required." });
     return;
  }

  const db = getDB();
  const user = db.users.find(
    (u) => u.username.toLowerCase() === String(username).trim().toLowerCase()
  );

  if (!user) {
     res.status(401).json({ error: "Invalid username or password." });
     return;
  }

  const calculatedHash = hashPassword(password, user.salt);
  if (calculatedHash !== user.passwordHash) {
     res.status(401).json({ error: "Invalid username or password." });
     return;
  }

  const token = signToken({ id: user.id, username: user.username });

  res.json({
    message: "Login successful!",
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  });
});

/**
 * GET /api/auth/me
 * Validate current session token
 */
router.get("/me", requireAuth, (req: Request, res: Response) => {
  const authReq = req as any;
  res.json({
    user: authReq.user,
  });
});

export default router;
