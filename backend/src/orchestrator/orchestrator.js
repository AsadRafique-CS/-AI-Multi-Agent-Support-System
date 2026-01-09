import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export async function classifyIntent(message) {
//   try {
//     const response = await client.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content: `You are an AI Orchestrator. 
// Classify user support messages into one of these intents:
// - refund
// - technical
// - general
// Return ONLY JSON: {"intent": "...", "confidence": 0-1, "reasoning": "..."}`
//         },
//         { role: "user", content: message }
//       ],
//       temperature: 0
//     });

//     const text = response.choices[0].message.content;
//     return JSON.parse(text);

//   } catch (err) {
//     console.error("Orchestrator error:", err);
//     return { intent: "general", confidence: 0, reasoning: "Error in classification" };
//   }
// }
// Mock Orchestrator for development

// Mock orchestrator - classifies message into refund, technical, or general
export async function classifyIntent(message) {
  message = message.toLowerCase();

  let intent = "general";
  let confidence = 0.6; // high confidence for mock
  let reasoning = "Simple keyword-based classification";

  if (message.includes("refund") || message.includes("cancel") || message.includes("money back")) {
    intent = "refund";
    confidence = 0.9;
  } else if (message.includes("error") || message.includes("bug") || message.includes("crash")) {
    intent = "technical";
    confidence = 0.7;
  } else if (message.includes("confused") || message.includes("not sure")) {
    confidence = 0.4;
  }

  return { intent, confidence, reasoning };
}

