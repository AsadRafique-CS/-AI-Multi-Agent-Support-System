import jwt from "jsonwebtoken";
import { db } from "../db/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

/**
 * Middleware to verify JWT token from Authorization header
 * Attaches user/admin information to req.user
 */
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
};

/**
 * Middleware to verify user is an admin
 */
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

/**
 * Middleware to verify user owns the resource
 * Checks if req.user.email matches the email query parameter or body
 */
export const requireOwnership = (req, res, next) => {
  const { email } = req.query || req.body;

  // Admin can access all resources
  if (req.user?.role === "admin") {
    return next();
  }

  // User must match the email
  if (req.user?.email !== email) {
    return res.status(403).json({ error: "Access denied" });
  }

  next();
};
