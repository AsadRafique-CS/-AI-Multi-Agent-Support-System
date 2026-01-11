# Support Ticket System

A full-stack support ticket system with AI-powered agent responses, user authentication, admin moderation, and ticket management. Built with Node.js, Express, SQLite, and React.

## Features

- **User Authentication**
  - User signup and login with email/password
  - Admin login with secure credentials
  - Protected routes for users and admins
  - JWT token-based authentication with 7-day expiry
  - Secure password hashing with SHA-256
  - Password reset via email with 6-digit code (15-minute expiry)

- **Ticket Management**
  - Users can submit and track their own tickets
  - Tickets are filtered by user email (users only see their own tickets)
  - Admins can view and manage all tickets
  - Real-time conversation threading

- **AI-Powered Agents**
  - Automatic intent classification (General, Technical, Refund)
  - Confidence-based message routing:
    - `>=80%` confidence: Auto-sent to user
    - `50-79%` confidence: Pending admin review
    - `<50%` confidence: Escalated to admin

- **Admin Actions**
  - Approve agent messages
  - Edit messages before sending
  - Reject and provide custom responses
  - Reassign to different agents

- **UI/UX**
  - Modern dark/light theme toggle
  - Loading states and spinners
  - Responsive design
  - Clean conversation interface

> **Note:** OpenAI integration is optional. The system uses mock AI agents by default. Enable real AI by providing a valid OpenAI API key.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Frontend | React.js |
| Authentication | JWT tokens, SHA-256 password hashing |
| Email | Nodemailer (SMTP) |

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
# OpenAI API Key (optional)
OPENAI_API_KEY=sk-your-key

# Email Configuration
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password-or-app-password

# SMTP Server (optional - for custom domains not using Google Workspace)
# SMTP_HOST=mail.yourdomain.com
# SMTP_PORT=587

# JWT Secret (required for authentication)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Email Setup Guide:**

1. **For Gmail (@gmail.com):**
   - Use your Gmail address as `EMAIL_USER`
   - Generate an App Password at [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Use the App Password as `EMAIL_PASS` (not your regular Gmail password)
   - Leave `SMTP_HOST` and `SMTP_PORT` empty

2. **For Google Workspace (custom domain using Gmail):**
   - Use your custom domain email as `EMAIL_USER` (e.g., `you@company.com`)
   - Generate an App Password from your Google Workspace account
   - Use the App Password as `EMAIL_PASS`
   - Leave `SMTP_HOST` and `SMTP_PORT` empty

3. **For Other Email Providers:**
   - Use your email address as `EMAIL_USER`
   - Use your email password as `EMAIL_PASS`
   - Set `SMTP_HOST` to your provider's SMTP server (e.g., `smtp.office365.com` for Outlook)
   - Set `SMTP_PORT` to your provider's SMTP port (usually `587` or `465`)
   - Contact your email provider for specific SMTP settings

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

## Authentication

### User Routes

| Route | Description |
|-------|-------------|
| `/signup` | Create new user account |
| `/login` | User login |
| `/forgot-password` | Request password reset code |
| `/reset-password` | Reset password with code |
| `/` | User dashboard (protected) |
| `/ticket/:id` | View ticket details (protected) |

### Admin Routes

| Route | Description |
|-------|-------------|
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard (protected) |

### Default Admin Credentials

```
Email: admin2098@gmail.com
Password: A1s2d3@f
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | User login |
| POST | `/auth/admin/login` | Admin login |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/verify` | Verify token |

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tickets` | Get all tickets (admin) |
| GET | `/tickets?email=user@example.com` | Get user's tickets |
| POST | `/tickets` | Create new ticket |
| POST | `/tickets/:id/messages` | Add reply to ticket |
| POST | `/tickets/:id/admin-action` | Admin actions |

### Request/Response Examples

**Create Ticket:**
```json
POST /tickets
{
  "email": "user@example.com",
  "message": "I need help with my refund"
}
```

**Admin Action:**
```json
POST /tickets/:ticketId/admin-action
{
  "messageId": "uuid",
  "action": "approve | edit | reject | reassign",
  "editedText": "Optional edited text",
  "reassignTo": "technical"
}
```

## Project Structure

```
ai-multi-agent-support-system/
├── backend/
│   ├── src/
│   │   ├── agents/           # AI agents (Refund, Technical, General)
│   │   ├── db/               # SQLite database setup
│   │   ├── orchestrator/     # Intent classification
│   │   ├── routes/
│   │   │   ├── auth.js       # Authentication routes
│   │   │   └── tickets.js    # Ticket routes
│   │   ├── utils/
│   │   │   ├── email.js      # Email notifications
│   │   │   └── escalator.js  # Auto-escalation logic
│   │   └── index.js          # Server entry point
│   └── support.db            # SQLite database file
│
├── frontend/
│   └── src/
│       ├── App.js            # User dashboard
│       ├── Login.js          # User login page
│       ├── Signup.js         # User signup page
│       ├── AdminLogin.js     # Admin login page
│       ├── AdminDashboard.js # Admin dashboard
│       ├── TicketView.js     # Ticket detail view
│       ├── ProtectedRoute.js # Route guards
│       ├── Root.js           # Router configuration
│       └── App.css           # Styles with dark/light themes
│
└── README.md
```

## Database Schema

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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET` | Secret key for JWT token signing | **Yes** |
| `EMAIL_USER` | SMTP email address | Yes |
| `EMAIL_PASS` | SMTP email password | Yes |
| `OPENAI_API_KEY` | OpenAI API key for real AI | No |
| `REDIS_HOST` | Redis host (for caching) | No |
| `REDIS_PORT` | Redis port | No |

## Future Improvements

- [x] JWT tokens instead of Base64-encoded tokens ✅
- [x] Password reset functionality ✅
- [ ] Bcrypt for password hashing (currently using SHA-256)
- [ ] User profile management
- [ ] Ticket pagination and search
- [ ] WebSocket for real-time updates
- [ ] File attachments
- [ ] Email verification on signup
- [ ] Refresh token mechanism
- [ ] Rate limiting on password reset attempts

## Author

Muhammad Asad Rafique - Full Stack Developer
