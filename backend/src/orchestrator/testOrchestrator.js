import { classifyIntent } from "./orchestrator.js";

async function test() {
  const messages = [
    "I want to cancel my order",
    "App keeps crashing on login",
    "What are your working hours?"
  ];

  for (const msg of messages) {
    const result = await classifyIntent(msg);
    console.log(msg, "=>", result);
  }
}

test();
