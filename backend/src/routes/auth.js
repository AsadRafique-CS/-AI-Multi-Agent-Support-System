import express from "express";
import { db } from "../db/db.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const router = express.Router();

// Simple password hashing using crypto (built-in Node.js)
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// Simple token generation
const generateToken = (userId, role) => {
  const payload = {
    userId,
    role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
};

// Verify token
export const verifyToken = (token) => {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    return payload;
  } catch {
    return null;
  }
};

// ==================== USER ROUTES ====================

// User Signup
router.post("/signup", (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if email already exists
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    // Create user
    const userId = uuidv4();
    const hashedPassword = hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, 'user')
    `).run(userId, name.trim(), email.toLowerCase(), hashedPassword);

    // Generate token
    const token = generateToken(userId, "user");

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase(),
        role: "user",
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// User Login
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user.id, "user");

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ==================== ADMIN ROUTES ====================

// Admin credentials
const ADMIN_EMAIL = "admin2098@gmail.com";
const ADMIN_PASSWORD = "A1s2d3@f";

// Admin Login
router.post("/admin/login", (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check hardcoded admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Check if admin exists in DB, if not create
      let admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(ADMIN_EMAIL);

      if (!admin) {
        const adminId = uuidv4();
        const hashedPassword = hashPassword(ADMIN_PASSWORD);
        db.prepare(`
          INSERT INTO admins (id, email, password, name)
          VALUES (?, ?, ?, 'Super Admin')
        `).run(adminId, ADMIN_EMAIL, hashedPassword);
        admin = { id: adminId, email: ADMIN_EMAIL, name: "Super Admin" };
      }

      // Generate admin token
      const token = generateToken(admin.id, "admin");

      return res.json({
        message: "Admin login successful",
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: "admin",
        },
      });
    }

    // Check against database for other admins
    const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email.toLowerCase());

    if (!admin) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    // Verify password
    const hashedPassword = hashPassword(password);
    if (admin.password !== hashedPassword) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    // Generate token
    const token = generateToken(admin.id, "admin");

    res.json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ==================== TOKEN VERIFICATION ====================

// Verify token endpoint
router.get("/verify", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false, error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ valid: false, error: "Invalid or expired token" });
    }

    // Get user/admin details
    if (payload.role === "admin") {
      const admin = db.prepare("SELECT id, email, name FROM admins WHERE id = ?").get(payload.userId);
      if (!admin) {
        return res.status(401).json({ valid: false, error: "Admin not found" });
      }
      return res.json({ valid: true, user: { ...admin, role: "admin" } });
    } else {
      const user = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(payload.userId);
      if (!user) {
        return res.status(401).json({ valid: false, error: "User not found" });
      }
      return res.json({ valid: true, user });
    }
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(500).json({ valid: false, error: "Verification failed" });
  }
});

export default router;
