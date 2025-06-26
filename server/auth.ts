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
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
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
  if (!req.session.isAuthenticated || !req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Just continue - auth is optional
  next();
}