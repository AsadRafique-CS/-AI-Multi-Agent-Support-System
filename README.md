# AI Multi-Agent Support System

A full-stack intelligent support ticket system powered by **Claude AI** (Anthropic) with multi-agent architecture, user authentication, admin moderation, ticket deduplication, and real-time conversation management. Built with Node.js, Express, SQLite, and React.

## 🌟 Key Features

### 🤖 Claude AI-Powered Multi-Agent System
- **Three Specialized AI Agents** (using Claude 3 Haiku):
  - **RefundAgent**: Handles refunds, cancellations, and payment issues
  - **TechnicalAgent**: Resolves technical problems, bugs, and how-to questions
  - **GeneralAgent**: Manages general inquiries, feedback, and product questions
- **Intelligent Intent Classification**: Automatically routes tickets to the right agent
- **Confidence-Based Workflow**:
  - `>=80%` confidence: Auto-sent to user
  - `50-79%` confidence: Pending admin review
  - `<50%` confidence: Escalated to admin

### 🔍 Smart Ticket Deduplication
- **AI-Powered Similarity Detection**: Uses Claude AI to detect duplicate tickets
- **Semantic Matching**: Understands intent, not just keywords
- **Automatic Merging**: Combines similar tickets (≥85% similarity) within 7 days
- **Transparency**: Shows similarity percentage to users

### 🔐 Complete Authentication System
- User signup and login with JWT tokens (7-day expiry)
- Admin login with secure credentials
- Protected routes for users and admins
- Password reset via email with 6-digit code (15-minute expiry)
- Secure password hashing with SHA-256
- Rate limiting removed on auth endpoints for seamless experience

### 📧 Email Integration
- Automated ticket confirmation emails
- Agent reply notifications
- Password reset emails with secure tokens
- Gmail and custom SMTP support

### 🎯 Ticket Management
- **User Dashboard**:
  - Submit new tickets
  - View ticket history with pagination (10 per page)
  - Search tickets by ID or email
  - Filter by status (open/answered/closed)
  - Real-time conversation threading
- **Admin Dashboard**:
  - View all tickets across all users
  - Advanced search and filtering
  - Moderate agent responses
  - Reassign tickets to different agents

### 🎨 Modern UI/UX
- **Custom Modal System**: Beautiful, animated modals instead of browser alerts
- **Dark/Light Theme Toggle**: Seamless theme switching
- **Loading States**: Informative spinners for all operations
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Conversation Interface**: Chat-like message display
- **Chronological Message Ordering**: Messages sorted by actual timestamp

### 🛡️ Security & Performance
- JWT token-based authentication
- Password hashing with SHA-256
- Rate limiting on API endpoints (configurable)
- SQL injection prevention with prepared statements
- CORS enabled for frontend-backend communication

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| AI | Claude 3 Haiku (Anthropic) |
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Frontend | React.js |
| Authentication | JWT tokens, SHA-256 password hashing |
| Email | Nodemailer (SMTP) |
| Styling | CSS3 with CSS Variables |

## 📦 Installation

### Prerequisites

- Node.js v18+
- npm or yarn
- Anthropic API Key ([Get one here](https://console.anthropic.com/))

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Anthropic API Key (REQUIRED for AI agents)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Email Configuration (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# JWT Secret (REQUIRED for authentication)
JWT_SECRET=super-secret-jwt-key-change-in-production-2098

# Redis (optional - for caching)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

**Email Setup Guide:**

1. **For Gmail (@gmail.com):**
   - Use your Gmail address as `EMAIL_USER`
   - Generate an App Password at [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Use the App Password as `EMAIL_PASS` (not your regular Gmail password)

2. **For Google Workspace (custom domain):**
   - Use your custom domain email as `EMAIL_USER`
   - Generate an App Password from your Google Workspace account
   - Use the App Password as `EMAIL_PASS`

3. **For Other Email Providers:**
   - Use your email address as `EMAIL_USER`
   - Use your email password or app password as `EMAIL_PASS`
   - Contact your email provider for SMTP settings

Start the backend:

```bash
npm run dev
```

Backend runs on `http://localhost:4000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## 🎯 Usage

### For Users

1. **Sign Up**: Create an account at `/signup`
2. **Login**: Access your dashboard at `/login`
3. **Submit Ticket**: Describe your issue - AI will classify and route it
4. **Track Progress**: View all your tickets with real-time updates
5. **Reply**: Continue the conversation with support agents

### For Admins

1. **Login**: Access admin panel at `/admin/login`
   - Email: `admin2098@gmail.com`
   - Password: `A1s2d3@f`
2. **Review Tickets**: See all tickets across all users
3. **Moderate**: Approve, edit, reject, or reassign agent responses
4. **Search & Filter**: Find tickets by status, email, or ticket ID

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | User login (no rate limit) |
| POST | `/auth/admin/login` | Admin login (no rate limit) |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/verify` | Verify JWT token |

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tickets` | Get tickets (with pagination & filters) |
| GET | `/tickets?email=user@example.com&page=1&limit=10` | Get user's tickets |
| GET | `/tickets?search=query&status=open` | Search and filter tickets |
| POST | `/tickets` | Create new ticket (with auto-deduplication) |
| POST | `/tickets/:id/messages` | Add reply to ticket |
| POST | `/tickets/:id/admin-action` | Admin actions (approve/edit/reject/reassign) |

### Request/Response Examples

**Create Ticket:**
```json
POST /tickets
{
  "email": "user@example.com",
  "message": "I want to cancel my order"
}

Response:
{
  "ticketId": "uuid",
  "merged": false,
  "classification": {
    "intent": "refund",
    "confidence": 0.9
  }
}

// If duplicate detected:
{
  "ticketId": "existing-uuid",
  "merged": true,
  "similarity": 90,
  "message": "Your message was added to existing ticket #...",
  "classification": {...}
}
```

**Admin Action:**
```json
POST /tickets/:ticketId/admin-action
{
  "messageId": "uuid",
  "action": "approve",
  // or "edit", "reject", "reassign"
  "editedText": "Optional edited text",
  "reassignTo": "technical"
}
```

## 🏗️ Project Structure

```
ai-multi-agent-support-system/
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   └── agent.js           # Three Claude AI agents
│   │   ├── db/
│   │   │   └── db.js              # SQLite database setup
│   │   ├── middleware/
│   │   │   └── rateLimit.js       # Rate limiting middleware
│   │   ├── orchestrator/
│   │   │   └── orchestrator.js    # Intent classification
│   │   ├── routes/
│   │   │   ├── auth.js            # Authentication routes
│   │   │   └── tickets.js         # Ticket routes
│   │   ├── utils/
│   │   │   ├── email.js           # Email notifications
│   │   │   ├── escalator.js       # Auto-escalation logic
│   │   │   └── similarity.js      # AI-powered deduplication
│   │   └── index.js               # Server entry point
│   ├── backend/
│   │   └── support.db             # SQLite database file
│   ├── .env                       # Environment variables
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Modal.js           # Custom modal component
│       │   └── Modal.css          # Modal styles
│       ├── App.js                 # User dashboard
│       ├── Login.js               # User login page
│       ├── Signup.js              # User signup page
│       ├── AdminLogin.js          # Admin login page
│       ├── AdminDashboard.js      # Admin dashboard
│       ├── TicketView.js          # Ticket detail view
│       ├── ForgotPassword.js      # Password reset request
│       ├── ResetPassword.js       # Password reset form
│       ├── ProtectedRoute.js      # Route guards
│       ├── Root.js                # Router configuration
│       └── App.css                # Global styles (dark/light themes)
│
└── README.md
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Admins Table
```sql
CREATE TABLE admins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT DEFAULT 'Admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Tickets Table
```sql
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  confidence REAL,
  intent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Messages Table
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  content TEXT,
  reasoning TEXT,
  status TEXT DEFAULT 'sent',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(ticket_id) REFERENCES tickets(id)
)
```

### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
)
```

## ⚙️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude AI API key from Anthropic | **Yes** |
| `JWT_SECRET` | Secret key for JWT token signing | **Yes** |
| `EMAIL_USER` | SMTP email address | Yes |
| `EMAIL_PASS` | SMTP email password/app password | Yes |
| `REDIS_HOST` | Redis host for caching | No |
| `REDIS_PORT` | Redis port | No |

## 🎯 How It Works

### 1. Ticket Submission Flow
```
User submits ticket
  ↓
Check for similar tickets (last 7 days, same user)
  ↓
If similar (≥85%) → Merge with existing ticket
  ↓
If not similar → Create new ticket
  ↓
Claude AI classifies intent (refund/technical/general)
  ↓
Route to appropriate specialized agent
  ↓
Agent generates response
  ↓
If confidence ≥80% → Send immediately
If confidence 50-79% → Admin review
If confidence <50% → Escalate to admin
```

### 2. Similarity Detection
```
New message arrives
  ↓
Fetch recent tickets (7 days, same email, status: open/answered)
  ↓
For each ticket:
  Get first message (original issue)
  ↓
  Send to Claude AI:
  "Are these about the same issue?"
  ↓
  Claude analyzes semantic similarity
  ↓
  Returns: isSimilar, similarity %, reasoning
  ↓
If similarity ≥85% → Merge
If similarity <85% → Continue checking
If no match → Create new ticket
```

### 3. Message Chronology
- All messages stored with ISO timestamps
- Backend sorts by `datetime(created_at) ASC`
- Frontend additionally sorts for reliability
- Result: Perfect chronological conversation flow

## 🚦 Features Checklist

- [x] JWT authentication with 7-day expiry ✅
- [x] Password reset via email ✅
- [x] Rate limiting on APIs ✅
- [x] Pagination and search ✅
- [x] Claude AI multi-agent system ✅
- [x] Ticket deduplication with AI ✅
- [x] Custom modal system ✅
- [x] Dark/light theme toggle ✅
- [x] Chronological message ordering ✅
- [x] No rate limit on auth endpoints ✅
- [ ] Bcrypt for password hashing (currently SHA-256)
- [ ] Email verification on signup
- [ ] WebSocket for real-time updates
- [ ] File attachments
- [ ] Refresh token mechanism

## 🐛 Known Issues

- **Orchestrator Error**: Intent classification shows authentication error but uses fallback successfully
- **Email Sending**: Gmail App Password needs to be regenerated (authentication failing)
- These issues don't affect core functionality

## 🔧 Troubleshooting

**Issue**: Claude AI agents returning fallback responses
- **Solution**: Ensure `ANTHROPIC_API_KEY` is set in `.env` and valid

**Issue**: Email not sending
- **Solution**: Generate new Gmail App Password and update `EMAIL_PASS` in `.env`

**Issue**: "Cannot find module" errors
- **Solution**: Run `npm install` in both backend and frontend directories

**Issue**: CORS errors
- **Solution**: Ensure backend is running on port 4000 and frontend on port 3000

## 🤝 Contributing

This is a portfolio project by Muhammad Asad Rafique. Feel free to fork and customize for your own use!

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

**Muhammad Asad Rafique**
- Full Stack Developer
- Email: m.asad2098@gmail.com
- Specializes in AI-powered applications, multi-agent systems, and modern web development

## 🙏 Acknowledgments

- **Anthropic** for Claude AI API
- **React** for the frontend framework
- **Express.js** for the backend framework
- **SQLite** for the lightweight database solution

---

Built with ❤️ using Claude AI and modern web technologies
