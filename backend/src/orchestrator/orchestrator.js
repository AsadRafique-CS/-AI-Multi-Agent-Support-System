import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Intent classification using Claude
export async function classifyIntent(message) {
  try {
    // If no API key, use fallback keyword-based classification
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("⚠️ ANTHROPIC_API_KEY not set, using fallback classifier");
      return fallbackClassifier(message);
    }

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 150,
      system: `You are an AI Intent Classifier for a support ticket system.
Classify user messages into ONE of these intents:
- refund: For refund requests, order cancellations, payment issues, money back requests
- technical: For bugs, errors, crashes, technical issues, how-to questions
- general: For everything else (feedback, general questions, unclear messages)

Respond ONLY with valid JSON in this exact format:
{"intent": "refund|technical|general", "confidence": 0.0-1.0, "reasoning": "brief explanation"}

Be accurate with confidence scores:
- 0.8-1.0: Very clear intent
- 0.5-0.7: Somewhat clear
- 0.0-0.4: Unclear/ambiguous`,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const text = response.content[0].text;

    // Parse JSON response
    const result = JSON.parse(text);

    console.log(`📊 Intent: ${result.intent} (${Math.round(result.confidence * 100)}% confidence)`);

    return {
      intent: result.intent || "general",
      confidence: result.confidence || 0.5,
      reasoning: result.reasoning || "Claude classification",
    };
  } catch (err) {
    console.error("Orchestrator error:", err.message);
    return fallbackClassifier(message);
  }
}

// Fallback keyword-based classifier when API is unavailable
function fallbackClassifier(message) {
  message = message.toLowerCase();

  let intent = "general";
  let confidence = 0.6;
  let reasoning = "Fallback keyword-based classification";

  // Refund keywords
  if (
    message.includes("refund") ||
    message.includes("cancel") ||
    message.includes("money back") ||
    message.includes("return") ||
    message.includes("charge") ||
    message.includes("payment")
  ) {
    intent = "refund";
    confidence = 0.8;
    reasoning = "Detected refund/payment related keywords";
  }
  // Technical keywords
  else if (
    message.includes("error") ||
    message.includes("bug") ||
    message.includes("crash") ||
    message.includes("not working") ||
    message.includes("broken") ||
    message.includes("issue") ||
    message.includes("problem") ||
    message.includes("help") ||
    message.includes("how to") ||
    message.includes("can't")
  ) {
    intent = "technical";
    confidence = 0.7;
    reasoning = "Detected technical/issue related keywords";
  }
  // Low confidence for unclear messages
  else if (
    message.length < 10 ||
    message.includes("confused") ||
    message.includes("not sure")
  ) {
    confidence = 0.4;
    reasoning = "Message is unclear or too short";
  }

  console.log(`📊 Intent (fallback): ${intent} (${Math.round(confidence * 100)}% confidence)`);

  return { intent, confidence, reasoning };
}
