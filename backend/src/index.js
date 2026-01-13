import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import ticketsRouter from "./routes/tickets.js";
import authRouter from "./routes/auth.js";
import './utils/escalator.js';

import { db } from "./db/db.js";
import { apiLimiter } from "./middleware/rateLimit.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
