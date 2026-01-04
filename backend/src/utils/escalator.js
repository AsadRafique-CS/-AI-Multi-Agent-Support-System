import cron from "node-cron";
import { db } from "../db/db.js";
import { sendAgentReplyEmail } from "./email.js";

// Replace with your admin email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@test.com";

// Check pending agent messages every minute
cron.schedule("* * * * *", async () => {
  const pendingMessages = db
    .prepare("SELECT * FROM messages WHERE status = 'pending' AND sender = 'agent'")
    .all();

  const now = new Date();

  for (const msg of pendingMessages) {
    const createdAt = new Date(msg.created_at);
    const diffMinutes = (now - createdAt) / 1000 / 60;

    if (diffMinutes > 5) { // 5 min threshold
      db.prepare("UPDATE messages SET status = ? WHERE id = ?")
        .run("escalated", msg.id);
      console.log(`Message ${msg.id} escalated to admin due to delay`);

      // Notify admin
      try {
        await sendAgentReplyEmail(ADMIN_EMAIL, msg.ticket_id, {
          response: msg.content,
          reasoning: "Escalated due to delayed agent response",
        });
        console.log(`Admin notified about escalated message ${msg.id}`);
      } catch (err) {
        console.error(`Failed to notify admin for message ${msg.id}:`, err.message);
      }
    }
  }
});
