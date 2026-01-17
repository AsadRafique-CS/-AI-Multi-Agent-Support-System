import Anthropic from "@anthropic-ai/sdk";
import {
  retrieveRefundContext,
  retrieveTechnicalContext,
  retrieveGeneralContext,
} from "../rag/retriever.js";

// Base configuration for all agents
const MODEL = "claude-3-haiku-20240307"; // Fast and cost-effective for support
const MAX_TOKENS = 500;

// RAG configuration
const USE_RAG = true; // Set to false to disable RAG

// Lazy initialize Anthropic client (so dotenv loads first)
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
 * Helper to augment system prompt with RAG context
 */
function augmentPromptWithContext(basePrompt, ragContext) {
  if (!ragContext || !ragContext.context) {
    return basePrompt;
  }

  return `${basePrompt}

${ragContext.context}

Use the above knowledge base context to provide accurate, grounded responses. If the context doesn't contain relevant information, rely on your guidelines.`;
}

// ==================== REFUND AGENT ====================
const REFUND_SYSTEM_PROMPT = `You are a specialized Refund Support Agent for Support Hub. Your role is to handle refund requests, order cancellations, and payment-related issues.

GUIDELINES:
1. Be empathetic and understanding - customers requesting refunds may be frustrated
2. Always ask for order ID or transaction details if not provided
3. Explain the refund process clearly (typically 5-7 business days)
4. If the request is outside refund policy, politely explain why and offer alternatives
5. Never promise refunds you cannot guarantee - say "I'll process your request" not "You will get a refund"
6. Keep responses concise and professional (2-4 sentences max)

REFUND POLICY:
- Full refunds available within 30 days of purchase
- Partial refunds (50%) available within 30-60 days
- No refunds after 60 days, but store credit may be offered
- Digital products: refunds only if product is defective

Always end with a clear next step or question.`;

export async function RefundAgent(message) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("⚠️ ANTHROPIC_API_KEY not set, using fallback response");
      return fallbackRefundResponse(message);
    }

    console.log("🤖 RefundAgent: Calling Claude API...");

    // RAG: Retrieve relevant context from knowledge base
    let systemPrompt = REFUND_SYSTEM_PROMPT;
    let ragUsed = false;
    let retrievedDocs = [];

    if (USE_RAG) {
      try {
        console.log("📚 RefundAgent: Retrieving RAG context...");
        const ragResult = await retrieveRefundContext(message);
        if (ragResult.success && ragResult.context) {
          systemPrompt = augmentPromptWithContext(REFUND_SYSTEM_PROMPT, ragResult);
          ragUsed = true;
          retrievedDocs = ragResult.documents || [];
          console.log(`✅ RefundAgent: RAG context added (${retrievedDocs.length} docs)`);
        }
      } catch (ragError) {
        console.warn("⚠️ RefundAgent: RAG failed, continuing without context:", ragError.message);
      }
    }

    const response = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    console.log("✅ RefundAgent: Claude API responded successfully");

    return {
      response: response.content[0].text,
      reasoning: ragUsed
        ? `RefundAgent processed refund/payment inquiry via Claude AI with RAG (${retrievedDocs.length} docs)`
        : "RefundAgent processed refund/payment inquiry via Claude AI",
      confidence: ragUsed ? 0.95 : 0.9,
      ragUsed,
      retrievedDocs: retrievedDocs.map((d) => d.metadata?.title || d.id),
    };
  } catch (err) {
    console.error("❌ RefundAgent error:", err.message);
    console.error("Error type:", err.error?.type || "unknown");
    return fallbackRefundResponse(message);
  }
}

function fallbackRefundResponse(message) {
  return {
    response:
      "I've received your refund request. Could you please provide your order ID so I can look into this for you? Our refund process typically takes 5-7 business days once approved.",
    reasoning: "RefundAgent fallback - API unavailable",
    confidence: 0.7,
  };
}

// ==================== TECHNICAL AGENT ====================
const TECHNICAL_SYSTEM_PROMPT = `You are a specialized Technical Support Agent for Support Hub. Your role is to help users resolve technical issues, bugs, and provide how-to guidance.

GUIDELINES:
1. Ask clarifying questions to understand the exact issue
2. Request error messages, screenshots description, or steps to reproduce
3. Provide step-by-step solutions when possible
4. If you cannot solve the issue, acknowledge it and escalate gracefully
5. Use simple language - avoid technical jargon unless the user is technical
6. Keep responses concise (2-4 sentences) but actionable

COMMON ISSUES TO CHECK:
- Browser/app version and compatibility
- Cache and cookies clearing
- Internet connectivity
- Account permissions
- Recent changes or updates

Always provide ONE clear action step for the user to try.`;

export async function TechnicalAgent(message) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("⚠️ ANTHROPIC_API_KEY not set, using fallback response");
      return fallbackTechnicalResponse(message);
    }

    console.log("🤖 TechnicalAgent: Calling Claude API...");

    // RAG: Retrieve relevant context from knowledge base
    let systemPrompt = TECHNICAL_SYSTEM_PROMPT;
    let ragUsed = false;
    let retrievedDocs = [];

    if (USE_RAG) {
      try {
        console.log("📚 TechnicalAgent: Retrieving RAG context...");
        const ragResult = await retrieveTechnicalContext(message);
        if (ragResult.success && ragResult.context) {
          systemPrompt = augmentPromptWithContext(TECHNICAL_SYSTEM_PROMPT, ragResult);
          ragUsed = true;
          retrievedDocs = ragResult.documents || [];
          console.log(`✅ TechnicalAgent: RAG context added (${retrievedDocs.length} docs)`);
        }
      } catch (ragError) {
        console.warn("⚠️ TechnicalAgent: RAG failed, continuing without context:", ragError.message);
      }
    }

    const response = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    console.log("✅ TechnicalAgent: Claude API responded successfully");

    return {
      response: response.content[0].text,
      reasoning: ragUsed
        ? `TechnicalAgent processed technical inquiry via Claude AI with RAG (${retrievedDocs.length} docs)`
        : "TechnicalAgent processed technical inquiry via Claude AI",
      confidence: ragUsed ? 0.95 : 0.9,
      ragUsed,
      retrievedDocs: retrievedDocs.map((d) => d.metadata?.title || d.id),
    };
  } catch (err) {
    console.error("❌ TechnicalAgent error:", err.message);
    console.error("Error type:", err.error?.type || "unknown");
    return fallbackTechnicalResponse(message);
  }
}

function fallbackTechnicalResponse(message) {
  return {
    response:
      "I'm sorry you're experiencing technical difficulties. Could you please describe the exact error message you're seeing, or the steps that lead to the issue? This will help me troubleshoot more effectively.",
    reasoning: "TechnicalAgent fallback - API unavailable",
    confidence: 0.7,
  };
}

// ==================== GENERAL AGENT ====================
const GENERAL_SYSTEM_PROMPT = `You are a friendly General Support Agent for Support Hub. Your role is to handle general inquiries, feedback, product questions, and anything that doesn't fit refund or technical categories.

GUIDELINES:
1. Be warm, friendly, and helpful
2. Answer general questions about services, features, and policies
3. If the question seems like it should go to refund or technical support, gently redirect
4. Collect feedback gracefully and thank users for it
5. For complex questions, provide a helpful overview and offer to connect with a specialist
6. Keep responses concise and conversational (2-3 sentences)

TOPICS YOU HANDLE:
- Product information and features
- Account questions (not technical issues)
- Business hours and contact info
- General feedback and suggestions
- Anything unclear or miscellaneous

Be helpful and guide users to the right resources.`;

export async function GeneralAgent(message) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("⚠️ ANTHROPIC_API_KEY not set, using fallback response");
      return fallbackGeneralResponse(message);
    }

    console.log("🤖 GeneralAgent: Calling Claude API...");

    // RAG: Retrieve relevant context from knowledge base
    let systemPrompt = GENERAL_SYSTEM_PROMPT;
    let ragUsed = false;
    let retrievedDocs = [];

    if (USE_RAG) {
      try {
        console.log("📚 GeneralAgent: Retrieving RAG context...");
        const ragResult = await retrieveGeneralContext(message);
        if (ragResult.success && ragResult.context) {
          systemPrompt = augmentPromptWithContext(GENERAL_SYSTEM_PROMPT, ragResult);
          ragUsed = true;
          retrievedDocs = ragResult.documents || [];
          console.log(`✅ GeneralAgent: RAG context added (${retrievedDocs.length} docs)`);
        }
      } catch (ragError) {
        console.warn("⚠️ GeneralAgent: RAG failed, continuing without context:", ragError.message);
      }
    }

    const response = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    console.log("✅ GeneralAgent: Claude API responded successfully");

    return {
      response: response.content[0].text,
      reasoning: ragUsed
        ? `GeneralAgent processed general inquiry via Claude AI with RAG (${retrievedDocs.length} docs)`
        : "GeneralAgent processed general inquiry via Claude AI",
      confidence: ragUsed ? 0.9 : 0.85,
      ragUsed,
      retrievedDocs: retrievedDocs.map((d) => d.metadata?.title || d.id),
    };
  } catch (err) {
    console.error("❌ GeneralAgent error:", err.message);
    console.error("Error type:", err.error?.type || "unknown");
    return fallbackGeneralResponse(message);
  }
}

function fallbackGeneralResponse(message) {
  return {
    response:
      "Thank you for reaching out! I'd be happy to help. Could you provide a bit more detail about what you need assistance with?",
    reasoning: "GeneralAgent fallback - API unavailable",
    confidence: 0.7,
  };
}
