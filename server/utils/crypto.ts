import crypto from "crypto";

// Use a fallback secret if JWT_SECRET is not provided in environment variables
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

/**
 * Generate a random salt for password hashing
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Hash a password with a given salt using SHA-256
 */
export function hashPassword(password: string, salt: string): string {
  return crypto
    .createHmac("sha256", salt)
    .update(password)
    .digest("hex");
}

/**
 * Sign a JSON payload to generate a cryptographic session token
 */
export function signToken(payload: Record<string, any>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const stringifiedPayload = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString("base64url");
  
  const signatureInput = `${header}.${stringifiedPayload}`;
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(signatureInput)
    .digest("base64url");
    
  return `${signatureInput}.${signature}`;
}

/**
 * Verify a cryptographic session token and return the payload
 */
export function verifyToken(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [header, payload, signature] = parts;
    const signatureInput = `${header}.${payload}`;
    
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(signatureInput)
      .digest("base64url");
      
    if (signature !== expectedSignature) {
      return null;
    }
    
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (decodedPayload.exp && decodedPayload.exp < Date.now()) {
      return null; // Token expired
    }
    
    return decodedPayload;
  } catch (err) {
    return null;
  }
}
