// db.js
import Database from "better-sqlite3";
import { join } from "path";
import fs from "fs";

const backendDir = join(process.cwd(), "backend");
if (!fs.existsSync(backendDir)) fs.mkdirSync(backendDir, { recursive: true });

const dbPath = join(backendDir, "support.db");
export const db = new Database(dbPath);

// Tickets table
db.prepare(`
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  confidence REAL,
  intent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

// Messages table - add status column if it doesn't exist
db.prepare(`
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  content TEXT,
  reasoning TEXT,
  status TEXT DEFAULT 'sent',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(ticket_id) REFERENCES tickets(id)
)
`).run();

// Add 'status' column to existing table if missing
try {
  db.prepare("ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'sent'").run();
} catch (err) {
  // ignore if column already exists
  if (!/duplicate column/i.test(err.message)) {
    console.error("Failed to add status column:", err);
  }
}

// Users table for authentication
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  email_verified INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

// Add email_verified column to existing users table if missing
try {
  db.prepare("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0").run();
} catch (err) {
  // ignore if column already exists
  if (!/duplicate column/i.test(err.message)) {
    console.error("Failed to add email_verified column:", err);
  }
}

// Admins table for admin authentication
db.prepare(`
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT DEFAULT 'Admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

// Password reset tokens table
db.prepare(`
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
)
`).run();

// Email verification tokens table
db.prepare(`
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
)
`).run();

// Add ticket closing columns if they don't exist
try {
  db.prepare("ALTER TABLE tickets ADD COLUMN closed_at DATETIME").run();
} catch (err) {
  if (!/duplicate column/i.test(err.message)) {
    console.error("Failed to add closed_at column:", err);
  }
}

try {
  db.prepare("ALTER TABLE tickets ADD COLUMN closed_by TEXT").run();
} catch (err) {
  if (!/duplicate column/i.test(err.message)) {
    console.error("Failed to add closed_by column:", err);
  }
}

try {
  db.prepare("ALTER TABLE tickets ADD COLUMN close_reason TEXT").run();
} catch (err) {
  if (!/duplicate column/i.test(err.message)) {
    console.error("Failed to add close_reason column:", err);
  }
}

// Attachments table
db.prepare(`
CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  message_id TEXT,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(ticket_id) REFERENCES tickets(id),
  FOREIGN KEY(message_id) REFERENCES messages(id)
)
`).run();

console.log("Database initialized at", dbPath);