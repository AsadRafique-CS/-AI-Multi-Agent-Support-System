import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

import ticketsRouter from "./routes/tickets.js";
import authRouter from "./routes/auth.js";
import './utils/escalator.js';

import { db } from "./db/db.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { initializeKnowledgeBase } from "./rag/knowledgeBase.js";

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
const uploadsPath = path.join(process.cwd(), "backend", "uploads");
app.use("/uploads", express.static(uploadsPath));

// Apply general rate limiting to all API routes
app.use("/api/", apiLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Use auth router
app.use("/auth", authRouter);

// Use tickets router
app.use("/tickets", ticketsRouter);

const PORT = 4000;

// Initialize RAG knowledge base, then start server
async function startServer() {
  try {
    console.log("🚀 Starting server...");

    // Initialize RAG knowledge base
    console.log("📚 Initializing RAG knowledge base...");
    await initializeKnowledgeBase();
    console.log("✅ RAG knowledge base ready");

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Backend running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    console.log("⚠️ Starting server without RAG...");

    // Start server anyway without RAG
    app.listen(PORT, () => {
      console.log(`✅ Backend running on port ${PORT} (RAG disabled)`);
    });
  }
}

startServer();
