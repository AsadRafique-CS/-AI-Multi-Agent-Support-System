Support Ticket System

A simple support ticket system with AI-powered agent responses, admin moderation, and guest ticket submission. Built with Node.js, Express, SQLite, and React.

Supports features like approve, edit, reject, and reassign agent messages, along with low-confidence escalation and email notifications.

⚠️ Note: OpenAI integration is commented out due to limited free-tier access. The system currently uses mock AI agents (RefundAgent, TechnicalAgent, GeneralAgent). You can enable real AI if you have a valid OpenAI API key.

Table of Contents

Features

Tech Stack

Getting Started

Backend Setup

Frontend Setup

API Endpoints

Admin Actions

Project Structure

Environment Variables

Future Improvements

Features

Guest ticket submission via email and message form

AI agent classification of messages (General, Technical, Refund)

Agent automatic replies

Confidence-based message status:

pending → medium confidence

low-confidence → requires admin review

escalated → failed agent messages

Admin actions:

Approve messages

Edit messages

Reject messages

Reassign messages to a different agent

Email notifications for guests and agent replies

React-based frontend for both guests and admin

SQLite database for ticket and message storage

Tech Stack

Backend: Node.js, Express.js

Database: SQLite

Frontend: React.js (functional components & hooks)

Email: Custom email utility (SMTP or any provider)

UUIDs: For unique ticket and message IDs

Getting Started
Prerequisites

Node.js v18+

npm or yarn

SQLite3

Backend Setup

Navigate to the backend folder:

cd backend


Install dependencies:

npm install
# or
yarn install


Create a .env file with the following variables:

# OpenAI API Key (optional if using real AI)
OPENAI_API_KEY=sk-<your-key>

# Redis (optional for caching)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Email credentials
EMAIL_USER=m.asad2098@gmail.com
EMAIL_PASS=A1s2d3@f


Start the backend:

npm run dev
# or
yarn dev


The backend runs on http://localhost:4000 by default.

Frontend Setup

Navigate to the frontend folder:

cd frontend


Install dependencies:

npm install
# or
yarn install


Start the React app:

npm start
# or
yarn start


Open http://localhost:3000 in your browser.
Toggle Admin Mode to see approve/edit/reject/reassign options.

API Endpoints
Tickets

GET /tickets – Get all tickets with messages

POST /tickets – Submit a new ticket

Request Body:

{
  "email": "guest@example.com",
  "message": "I need help with my order"
}


Response:

{
  "ticketId": "uuid",
  "classification": {
    "intent": "general",
    "confidence": 0.6
  }
}

Admin Actions

POST /tickets/:ticketId/admin-action – Approve, edit, reject, or reassign a message

Request Body:

{
  "messageId": "uuid",
  "action": "approve | edit | reject | reassign",
  "editedText": "Optional text",
  "reassignTo": "TechnicalAgent" // only for reassign
}

Guest Reply

POST /tickets/:ticketId/messages – Add guest reply

Request Body:

{
  "sender": "guest",
  "text": "I have more questions"
}

Admin Actions & Frontend Behavior

For agent messages with status pending or low-confidence:

Approve → Sends message to guest, marks as approved

Edit → Updates message content and marks as approved

Reject → Marks message as rejected

Reassign → Sends message to another agent and marks original message as reassigned

Frontend logic snippet:

if (msg.sender === "agent" && (msg.status === "pending" || msg.status === "low-confidence")) {
  actions = ["Approve", "Edit", "Reject", "Reassign"];
}

Project Structure
backend/
├─ agents/             # Mock AI agents
├─ orchestrator/       # Intent classification logic
├─ utils/              # Email utility
├─ db/                 # SQLite database setup
├─ routes/             # Express routes
├─ index.js            # Backend entry

frontend/
├─ src/
│  ├─ App.jsx          # Main React component
│  ├─ api/             # API requests
│  └─ components/      # Optional reusable components

Environment Variables

OPENAI_API_KEY → Your OpenAI API key (optional)

REDIS_HOST → Redis host (default 127.0.0.1)

REDIS_PORT → Redis port (default 6379)

EMAIL_USER → Email account to send notifications

EMAIL_PASS → Email password

Future Improvements

Integrate real AI agents for better intent classification

Authentication & role-based admin panel

Pagination for tickets

WebSocket for real-time updates

Attachments and file uploads

Author

Muhammad Asad Rafique – Full Stack Developer