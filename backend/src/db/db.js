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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

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

console.log("Database initialized at", dbPath);