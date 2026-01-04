import express from "express";
import db from "../db.js";
import { sendAgentReplyEmail } from "../utils/email.js";

const router = express.Router();

router.post("/tickets/:id/action", async (req, res) => {
  const ticketId = req.params.id;
  const { action, finalText } = req.body;

  if (!["approve", "edit", "reject","Reassign"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  /* Save admin decision */
  db.prepare(`
    UPDATE agent_messages
    SET response = ?, status = ?
    WHERE ticket_id = ?
  `).run(finalText, action, ticketId);

  /* ✅ THIS IS THE MISSING FLOW */
  if (action === "approve" || action === "edit") {
    const ticket = db
      .prepare("SELECT email FROM tickets WHERE id = ?")
      .get(ticketId);

    await sendAgentReplyEmail(ticket.email, ticketId, {
      response: finalText,
      reasoning: "Approved by admin",
    });
  }

  res.json({ success: true });
});

export default router;
