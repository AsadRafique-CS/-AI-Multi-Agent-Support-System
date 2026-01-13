import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db/db.js";

// Lazy initialize Anthropic client
let anthropic = null;
function getAnthropic() {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

/**
 * Check if two ticket messages are semantically similar using Claude AI
 * @param {string} newMessage - The new ticket message
 * @param {string} existingMessage - An existing ticket message to compare against
 * @returns {Promise<{isSimilar: boolean, similarity: number, reasoning: string}>}
 */
export async function checkMessageSimilarity(newMessage, existingMessage) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("⚠️ ANTHROPIC_API_KEY not set, skipping similarity check");
      return { isSimilar: false, similarity: 0, reasoning: "API key not configured" };
    }

    const prompt = `You are a support ticket similarity analyzer. Compare these two support ticket messages and determine if they are about the same issue.

Message 1 (New):
"${newMessage}"

Message 2 (Existing):
"${existingMessage}"

Analyze if these messages are:
- Describing the same problem/issue
- Asking about the same topic
- Related to the same order/transaction (if mentioned)

Return ONLY a valid JSON object with this exact structure:
{
  "isSimilar": true or false,
  "similarity": 0-100 (percentage),
  "reasoning": "brief explanation"
}

Consider them similar (isSimilar: true) if:
- They're about the same specific issue or order
- Similarity >= 85%

Consider them different (isSimilar: false) if:
- They're about different issues even if same category
- Similarity < 85%`;

    console.log("🔍 Checking ticket similarity with Claude AI...");

    const response = await getAnthropic().messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = response.content[0].text.trim();
    console.log("📊 Similarity check response:", responseText);

    // Parse the JSON response
    const result = JSON.parse(responseText);

    return {
      isSimilar: result.isSimilar === true,
      similarity: result.similarity || 0,
      reasoning: result.reasoning || "No reasoning provided",
    };
  } catch (err) {
    console.error("❌ Similarity check error:", err.message);
    // Default to not similar on error (create new ticket)
    return { isSimilar: false, similarity: 0, reasoning: "Error during similarity check" };
  }
}

/**
 * Find existing similar tickets for a user
 * @param {string} email - User's email
 * @param {string} newMessage - New ticket message
 * @returns {Promise<{ticket: object|null, similarity: object|null}>}
 */
export async function findSimilarTicket(email, newMessage) {
  try {
    // Get recent open/answered tickets from the same user (last 7 days)
    const recentTickets = db
      .prepare(
        `SELECT * FROM tickets
         WHERE email = ?
         AND status IN ('open', 'answered')
         AND created_at >= datetime('now', '-7 days')
         ORDER BY created_at DESC`
      )
      .all(email.toLowerCase());

    if (recentTickets.length === 0) {
      console.log("📭 No recent tickets found for user");
      return { ticket: null, similarity: null };
    }

    console.log(`🔎 Found ${recentTickets.length} recent tickets, checking similarity...`);

    // Check each ticket for similarity
    for (const ticket of recentTickets) {
      // Get the first message of the ticket (the original issue)
      const firstMessage = db
        .prepare(
          `SELECT content FROM messages
           WHERE ticket_id = ? AND sender = 'guest'
           ORDER BY created_at ASC
           LIMIT 1`
        )
        .get(ticket.id);

      if (!firstMessage) continue;

      // Check similarity with Claude
      const similarityResult = await checkMessageSimilarity(newMessage, firstMessage.content);

      console.log(
        `🎯 Ticket ${ticket.id}: ${similarityResult.similarity}% similar - ${similarityResult.reasoning}`
      );

      if (similarityResult.isSimilar) {
        console.log(`✅ Found similar ticket: ${ticket.id}`);
        return { ticket, similarity: similarityResult };
      }
    }

    console.log("❌ No similar tickets found");
    return { ticket: null, similarity: null };
  } catch (err) {
    console.error("❌ Error finding similar ticket:", err.message);
    return { ticket: null, similarity: null };
  }
}
