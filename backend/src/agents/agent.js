// Mock AI Agents 

export async function RefundAgent(message) {
  return {
    response:
      "I’ve received your refund request. Could you please confirm your order ID so I can proceed?",
    reasoning: "RefundAgent specializes in refund and cancellation requests",
  };
}

export async function TechnicalAgent(message) {
  return {
    response:
      "I’m sorry you’re experiencing issues. Could you tell me what error message you’re seeing or what step fails?",
    reasoning: "TechnicalAgent handles technical problems and errors",
  };
}

export async function GeneralAgent(message) {
  return {
    response:
      "I’d be happy to help 🙂 Could you please provide a bit more detail about what you’re confused about?",
    reasoning: "GeneralAgent handles unclear or general inquiries",
    confidence: 0.9, // <- important
  };
}
