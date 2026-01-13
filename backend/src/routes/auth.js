import express from "express";
import { db } from "../db/db.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/email.js";
import { passwordResetLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const JWT_EXPIRY = "7d"; // 7 days

// Password hashing using crypto (built-in Node.js)
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// JWT token generation
const generateToken = (userId, role, email) => {
  return jwt.sign(
    {
      userId,
      role,
      email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null; // Invalid or expired token
  }
};

// ==================== USER ROUTES ====================

// User Signup
router.post("/signup", async (req, res) => {
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

    // Create user with email_verified = 0
    const userId = uuidv4();
    const hashedPassword = hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, email_verified)
      VALUES (?, ?, ?, ?, 'user', 0)
    `).run(userId, name.trim(), email.toLowerCase(), hashedPassword);

    // Generate verification code (6-digit)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenId = uuidv4();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification token in database
    db.prepare(`
      INSERT INTO email_verification_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenId, userId, verificationCode, expiresAt.toISOString());

    // Send verification email
    await sendVerificationEmail(email.toLowerCase(), verificationCode);

    res.status(201).json({
      message: "Account created successfully. Please check your email to verify your account.",
      email: email.toLowerCase(),
      // Include verification code in development for testing
      verificationCode: process.env.NODE_ENV === "development" ? verificationCode : undefined
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

    // Check if email is verified
    if (user.email_verified === 0) {
      return res.status(403).json({
        error: "Please verify your email before logging in. Check your inbox for the verification code.",
        emailNotVerified: true,
        email: user.email
      });
    }

    // Generate token
    const token = generateToken(user.id, "user", user.email);

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
      const token = generateToken(admin.id, "admin", admin.email);

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
    const token = generateToken(admin.id, "admin", admin.email);

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

// ==================== EMAIL VERIFICATION ====================

// Verify Email - Validate verification code
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validation
    if (!email || !code) {
      return res.status(400).json({ error: "Email and verification code are required" });
    }

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());

    if (!user) {
      return res.status(400).json({ error: "Invalid email or verification code" });
    }

    // Check if already verified
    if (user.email_verified === 1) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Find valid verification token
    const verificationTokenRecord = db.prepare(`
      SELECT * FROM email_verification_tokens
      WHERE user_id = ? AND token = ? AND used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `).get(user.id, code);

    if (!verificationTokenRecord) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    // Check if token is expired
    const expiresAt = new Date(verificationTokenRecord.expires_at);
    if (expiresAt < new Date()) {
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }

    // Update user email_verified status
    db.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(user.id);

    // Mark token as used
    db.prepare("UPDATE email_verification_tokens SET used = 1 WHERE id = ?").run(verificationTokenRecord.id);

    // Generate JWT token for automatic login
    const token = generateToken(user.id, "user", user.email);

    res.json({
      message: "Email verified successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).json({ error: "Failed to verify email" });
  }
});

// Resend Verification Code
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());

    if (!user) {
      return res.json({
        message: "If an account exists with this email, you will receive a verification code."
      });
    }

    // Check if already verified
    if (user.email_verified === 1) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenId = uuidv4();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification token in database
    db.prepare(`
      INSERT INTO email_verification_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenId, user.id, verificationCode, expiresAt.toISOString());

    // Send verification email
    await sendVerificationEmail(email.toLowerCase(), verificationCode);

    res.json({
      message: "Verification code sent successfully",
      // Include verification code in development for testing
      verificationCode: process.env.NODE_ENV === "development" ? verificationCode : undefined
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ error: "Failed to resend verification code" });
  }
});

// ==================== PASSWORD RESET ====================

// Forgot Password - Generate reset token and send email
router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());

    // For security, always return success even if user doesn't exist
    if (!user) {
      return res.json({
        message: "If an account exists with this email, you will receive a password reset link."
      });
    }

    // Generate reset token (6-digit code for simplicity)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenId = uuidv4();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in database
    db.prepare(`
      INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenId, user.id, resetToken, expiresAt.toISOString());

    // Send email with reset token
    await sendPasswordResetEmail(email, resetToken);

    res.json({
      message: "If an account exists with this email, you will receive a password reset link.",
      // Include token in development for testing
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Reset Password - Verify token and update password
router.post("/reset-password", passwordResetLimiter, (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    // Validation
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: "Email, token, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());

    if (!user) {
      return res.status(400).json({ error: "Invalid reset token or email" });
    }

    // Find valid token
    const resetTokenRecord = db.prepare(`
      SELECT * FROM password_reset_tokens
      WHERE user_id = ? AND token = ? AND used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `).get(user.id, token);

    if (!resetTokenRecord) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Check if token is expired
    const expiresAt = new Date(resetTokenRecord.expires_at);
    if (expiresAt < new Date()) {
      return res.status(400).json({ error: "Reset token has expired" });
    }

    // Update password
    const hashedPassword = hashPassword(newPassword);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, user.id);

    // Mark token as used
    db.prepare("UPDATE password_reset_tokens SET used = 1 WHERE id = ?").run(resetTokenRecord.id);

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
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
