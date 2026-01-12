import express from "express";
import { v4 as uuid } from "uuid";
import { classifyIntent } from "../orchestrator/orchestrator.js";
import { RefundAgent, TechnicalAgent, GeneralAgent } from "../agents/agent.js";
import { db } from "../db/db.js";
import { sendTicketEmail, sendAgentReplyEmail } from "../utils/email.js";
import { ticketCreationLimiter, adminActionLimiter } from "../middleware/rateLimit.js";
const router = express.Router();

// GET all tickets with messages (with pagination and search)
router.get("/", (req, res) => {
  const { email, page = 1, limit = 10, search = "", status = "" } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // Build SQL query with filters
  let query = "SELECT * FROM tickets WHERE 1=1";
  let countQuery = "SELECT COUNT(*) as total FROM tickets WHERE 1=1";
  const params = [];
  const countParams = [];

  // Filter by email (for users)
  if (email) {
    query += " AND email = ?";
    countQuery += " AND email = ?";
    params.push(email.toLowerCase());
    countParams.push(email.toLowerCase());
  }

  // Filter by status
  if (status) {
    query += " AND status = ?";
    countQuery += " AND status = ?";
    params.push(status);
    countParams.push(status);
  }

  // Search by email or ticket ID
  if (search) {
    query += " AND (email LIKE ? OR id LIKE ?)";
    countQuery += " AND (email LIKE ? OR id LIKE ?)";
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
    countParams.push(searchPattern, searchPattern);
  }

  // Add ordering and pagination
  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(limitNum, offset);

  // Get total count
  const { total } = db.prepare(countQuery).get(...countParams);

  // Get paginated tickets
  const tickets = db.prepare(query).all(...params);

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

  res.json({
    tickets: ticketsWithMessages,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// POST new ticket
router.post("/", ticketCreationLimiter, async (req, res) => {
  const { email, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: "Email & message required" });
  }

  // Create new ticket
  const ticketId = uuid();
  let classification;
  try {
    classification = await classifyIntent(message);
  } catch (err) {
    console.error("Classification failed:", err);
    classification = { intent: "general", confidence: 0, reasoning: "Classification error" };
  }

  db.prepare(
    "INSERT INTO tickets (id, email, confidence, intent, status) VALUES (?, ?, ?, ?, ?)"
  ).run(ticketId, email, classification.confidence, classification.intent, "open");

  db.prepare(
    "INSERT INTO messages (id, ticket_id, sender, content, status) VALUES (?, ?, ?, ?, ?)"
  ).run(uuid(), ticketId, "guest", message, "sent");

  try {
    // Process message with agent
    await processNewGuestMessage(ticketId, message, classification.intent, email, classification.confidence);

    // Send ticket email to guest
    await sendTicketEmail(email, ticketId);
  } catch (err) {
    console.error("Error processing new ticket:", err);
  }

  res.json({ ticketId, classification });
});


// Admin approves/rejects/edit/reassign pending message
router.post("/:ticketId/admin-action", adminActionLimiter, async (req, res) => {
  const { ticketId } = req.params;
  const { messageId, action, editedText, reassignTo } = req.body;

  if (!["approve", "edit", "reject", "reassign"].includes(action)) {
    return res.status(400).json({ error: "Invalid admin action" });
  }

  try {
    const msg = db
      .prepare("SELECT * FROM messages WHERE id = ? AND ticket_id = ?")
      .get(messageId, ticketId);

    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }

    const ticket = db
      .prepare("SELECT * FROM tickets WHERE id = ?")
      .get(ticketId);

    let finalText = msg.content;
    let newStatus = msg.status;

    // ✅ APPROVE / EDIT
    if (action === "approve" || action === "edit") {
      finalText = editedText?.trim() || msg.content;
      newStatus = "approved";

      // Update message
      db.prepare(
        "UPDATE messages SET content = ?, status = ? WHERE id = ?"
      ).run(finalText, newStatus, messageId);

      // Update ticket
      db.prepare(
        "UPDATE tickets SET status = ? WHERE id = ?"
      ).run("answered", ticketId);

      // ✅ EMAIL USER
      await sendAgentReplyEmail(ticket.email, ticketId, {
        response: finalText,
        reasoning: "Approved by admin",
      });
    }

    // ❌ REJECT (internal only)
  else if (action === "reject") {
  finalText = editedText?.trim() || "Admin will respond shortly";

  // 1️⃣ Mark agent message rejected
  db.prepare(
    "UPDATE messages SET status = ? WHERE id = ?"
  ).run("rejected", messageId);

  // 2️⃣ Insert admin message (VISIBLE TO USER)
  db.prepare(
    "INSERT INTO messages (id, ticket_id, sender, content, status) VALUES (?, ?, ?, ?, ?)"
  ).run(uuid(), ticketId, "admin", finalText, "sent");

  // 3️⃣ Update ticket
  db.prepare(
    "UPDATE tickets SET status = ? WHERE id = ?"
  ).run("answered", ticketId);

  // 4️⃣ Email user
  await sendAgentReplyEmail(ticket.email, ticketId, {
    response: finalText,
    reasoning: "Rejected AI response, admin reply",
  });
}


    // 🔁 REASSIGN
    else if (action === "reassign") {
      const agentResponse = await callAgent(
        reassignTo || ticket.intent,
        msg.content
      );

      saveAgentMessage(ticketId, agentResponse, "pending");

      db.prepare(
        "UPDATE messages SET status = ? WHERE id = ?"
      ).run("reassigned", messageId);

      db.prepare(
        "UPDATE tickets SET status = ? WHERE id = ?"
      ).run("pending", ticketId);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Admin action error:", err);
    res.status(500).json({ error: "Failed to perform admin action" });
  }
});

// POST guest reply to an existing ticket
router.post("/:ticketId/messages", ticketCreationLimiter, async (req, res) => {
  const { ticketId } = req.params;
  const { sender, text } = req.body;

  if (!sender || !text) return res.status(400).json({ error: "Sender & text required" });

  try {
    // 1️⃣ Save the guest message
    const messageId = uuid();
    db.prepare(
      "INSERT INTO messages (id, ticket_id, sender, content, status) VALUES (?, ?, ?, ?, ?)"
    ).run(messageId, ticketId, sender, text, "sent");

    // 2️⃣ Fetch ticket info for email & context
    const ticket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // 3️⃣ Classify intent of the new message
    const classification = await classifyIntent(text);

    // 4️⃣ Process the message through AI
    await processNewGuestMessage(ticketId, text, classification.intent, ticket.email, classification.confidence);

    // 5️⃣ Respond OK
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Error processing guest reply:", err);
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
  const now = new Date().toISOString();
  db.prepare(
    "INSERT INTO messages (id, ticket_id, sender, content, reasoning, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(uuid(), ticketId, "agent", agentResponse.response, agentResponse.reasoning, status, now);

}


export default router;

//confidence thresholds and deciding whether the AI response is sent automatically or flagged for review is:
export async function processNewGuestMessage(ticketId, messageContent, intent, email, confidence) {
  let status;
  if (confidence >= 0.8) status = "sent";
  else if (confidence >= 0.5) status = "pending";
  else status = "low-confidence";

  // Call agent only if confidence >= 0.5
  let agentResponse = null;
  if (confidence >= 0.5) {
    agentResponse = await callAgent(intent, messageContent);
    saveAgentMessage(ticketId, agentResponse, status);
    
    if (status === "sent") {
      await sendAgentReplyEmail(email, ticketId, agentResponse);
    }
  } else {
    saveAgentMessage(ticketId, { response: "Needs admin handling", reasoning: "Low confidence" }, status);
  }
}