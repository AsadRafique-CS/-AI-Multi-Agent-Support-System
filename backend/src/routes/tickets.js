import express from "express";
import { v4 as uuid } from "uuid";
import { classifyIntent } from "../orchestrator/orchestrator.js";
import { RefundAgent, TechnicalAgent, GeneralAgent } from "../agents/agent.js";
import { db } from "../db/db.js";
import { sendTicketEmail, sendAgentReplyEmail } from "../utils/email.js";
const router = express.Router();

// GET all tickets with messages
router.get("/", (req, res) => {
  const tickets = db.prepare("SELECT * FROM tickets").all();

  const ticketsWithMessages = tickets.map((ticket) => {
    const messages = db
      .prepare("SELECT * FROM messages WHERE ticket_id = ? ORDER BY created_at ASC")
      .all(ticket.id);

    return {
      ...ticket,
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        reasoning: m.reasoning || "",
        status: m.status || "sent",
      })),
    };
  });

  res.json(ticketsWithMessages);
});

// POST new ticket
router.post("/", async (req, res) => {
  const { email, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: "Email & message required" });
  }

  const ticketId = uuid();

  // 1️⃣ Duplicate detection FIRST
  const similarTicket = db
    .prepare("SELECT * FROM tickets WHERE email = ? AND status != 'closed'")
    .get(email);

  if (similarTicket) {
    db.prepare(
      "INSERT INTO messages (id, ticket_id, sender, content, status) VALUES (?, ?, ?, ?, ?)"
    ).run(uuid(), similarTicket.id, "guest", message, "sent");

    try {
      await sendTicketEmail(email, similarTicket.id);
    } catch (err) {
      console.error("Email failed:", err.message);
    }

    return res.json({
      ticketId: similarTicket.id,
      message: "Merged with existing ticket",
    });
  }

  // 2️⃣ Classify intent
  let classification;
  try {
    classification = await classifyIntent(message);
  } catch (err) {
    console.error("Classification failed:", err);
    classification = { intent: "general", confidence: 0, reasoning: "Classification error" };
  }
// TEMP: Force medium confidence for testing admin approve/edit/reject
// classification.confidence = 0.6; // forces 'pending' status
  // 3️⃣ Save ticket
  db.prepare(
    "INSERT INTO tickets (id, email, confidence, intent, status) VALUES (?, ?, ?, ?, ?)"
  ).run(ticketId, email, classification.confidence, classification.intent, "open");

  db.prepare(
    "INSERT INTO messages (id, ticket_id, sender, content, status) VALUES (?, ?, ?, ?, ?)"
  ).run(uuid(), ticketId, "guest", message, "sent");

  // 4️⃣ Agent routing
  if (classification.confidence >= 0.8) {
    const agentResponse = await callAgent(classification.intent, message);
    saveAgentMessage(ticketId, agentResponse, "sent");

    try {
      await sendAgentReplyEmail(email, ticketId, agentResponse);
    } catch (err) {
      console.error("Agent email failed:", err.message);
    }
  } else if (classification.confidence >= 0.5) {
    const agentResponse = await callAgent(classification.intent, message);
    saveAgentMessage(ticketId, agentResponse, "pending");
  } else {
    saveAgentMessage(
      ticketId,
      { response: "Needs admin handling", reasoning: "Low confidence" },
      "low-confidence"
    );
  }

  // 5️⃣ Ticket link email (non-blocking)
  try {
    await sendTicketEmail(email, ticketId);
  } catch (err) {
    console.error("Ticket email failed:", err.message);
  }

  res.json({ ticketId, classification });
});


// Admin approves/rejects/edit/reassign pending message
router.post("/:ticketId/admin-action", async (req, res) => {
  const { ticketId } = req.params;
  const { messageId, action, editedText, reassignTo } = req.body;

  try {
    const msg = db
      .prepare("SELECT * FROM messages WHERE id = ? AND ticket_id = ?")
      .get(messageId, ticketId);

    if (!msg) return res.status(404).json({ error: "Message not found" });

    let finalText = msg.content;
    let newStatus = msg.status;

    if (action === "approve") {
      finalText = editedText || msg.content;
      newStatus = "approved";
    } else if (action === "edit") {
      finalText = editedText || msg.content;
      newStatus = "approved";
    } else if (action === "reject") {
      finalText = editedText || "Manual response from admin";
      newStatus = "rejected";
    } else if (action === "reassign") {
      // Reassign to a different agent
      const agentResponse = await callAgent(reassignTo || msg.intent, finalText);
      saveAgentMessage(ticketId, agentResponse, "sent");
      newStatus = "reassigned";
    }

    // Update original message status/content if approved, edited, or rejected
    db.prepare(
      "UPDATE messages SET content = ?, status = ? WHERE id = ?"
    ).run(finalText, newStatus, messageId);

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to perform admin action" });
  }
});

// POST guest reply
router.post("/:ticketId/messages", async (req, res) => {
  const { ticketId } = req.params;
  const { sender, text } = req.body;
  
  if (!sender || !text) return res.status(400).json({ error: "Sender & text required" });

  try {
    db.prepare(
      "INSERT INTO messages (id, ticket_id, sender, content, status) VALUES (?, ?, ?, ?, ?)"
    ).run(uuid(), ticketId, sender, text, "sent");

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save message" });
  }
});


// Helper to call agent
async function callAgent(intent, message) {
  try {
    let response;
    if (intent === "refund") response = await RefundAgent(message);
    else if (intent === "technical") response = await TechnicalAgent(message);
    else response = await GeneralAgent(message);

    // Check for invalid output
    if (!response || !response.response) {
      throw new Error("Invalid agent response");
    }

    return response;
  } catch (err) {
    console.error("Agent failure:", err);

    // Escalate to admin
    return {
      response: "Agent failed. Admin intervention required.",
      reasoning: err.message,
      confidence: 0,
    };
  }
}


// Helper to save agent message
function saveAgentMessage(ticketId, agentResponse, status = "sent") {
  db.prepare(
    "INSERT INTO messages (id, ticket_id, sender, content, reasoning, status) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(uuid(), ticketId, "agent", agentResponse.response, agentResponse.reasoning, status);
}


export default router;
