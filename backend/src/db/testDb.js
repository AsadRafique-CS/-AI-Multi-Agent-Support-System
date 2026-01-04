import { db } from "./db.js";
import { v4 as uuid } from "uuid";

const ticketId = uuid();
db.prepare("INSERT INTO tickets (id, email, confidence, intent) VALUES (?, ?, ?, ?)")
  .run(ticketId, "test@example.com", 0.9, "refund");

const row = db.prepare("SELECT * FROM tickets").all();
console.log(row);
