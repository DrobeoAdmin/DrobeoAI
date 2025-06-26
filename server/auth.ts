import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

const saltRounds = 10;

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Explicit session name
    cookie: {
      httpOnly: false, // Allow JavaScript access in development for debugging
      secure: false, // HTTP only in development
      maxAge: sessionTtl,
      sameSite: 'none', // Required for cross-origin in development
      domain: undefined, // Don't set domain in development
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
    isAuthenticated?: boolean;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log("Authentication check:", {
    isAuthenticated: req.session.isAuthenticated,
    userId: req.session.userId,
    sessionId: req.sessionID,
    cookies: req.headers.cookie,
    authHeader: req.headers.authorization
  });

  // Check session authentication first
  if (req.session.isAuthenticated && req.session.userId) {
    return next();
  }

  // Fallback: Check for authorization header (for development)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, 'base64').toString();
      const [userId, timestamp] = decoded.split(':');
      
      if (userId && timestamp) {
        // Add userId to request for middleware use
        (req as any).userId = parseInt(userId);
        return next();
      }
    } catch (error) {
      console.error("Token decode error:", error);
    }
  }

  return res.status(401).json({ message: "Authentication required" });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Just continue - auth is optional
  next();
}