import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import ticketsRouter from "./routes/tickets.js";
import authRouter from "./routes/auth.js";
import './utils/escalator.js';

import { db } from "./db/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
