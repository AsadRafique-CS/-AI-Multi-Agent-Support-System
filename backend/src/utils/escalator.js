import cron from "node-cron";
import { db } from "../db/db.js";

// Check pending agent messages every minute
cron.schedule("* * * * *", () => {
  const pendingMessages = db
    .prepare("SELECT * FROM messages WHERE status = 'pending' AND sender = 'agent'")
    .all();

  const now = new Date();

  pendingMessages.forEach((msg) => {
    const createdAt = new Date(msg.created_at);
    const diffMinutes = (now - createdAt) / 1000 / 60;

    if (diffMinutes > 5) { // 5 min threshold
      db.prepare("UPDATE messages SET status = ? WHERE id = ?")
        .run("escalated", msg.id);
      console.log(`Message ${msg.id} escalated to admin due to delay`);
    }
  });
});
