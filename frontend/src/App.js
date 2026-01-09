import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editText, setEditText] = useState({});
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null); // 'submit', 'reply', 'admin', 'fetch'
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const submitTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingAction('submit');
    try {
      const res = await axios.post("http://localhost:4000/tickets", {
        email,
        message,
      });
      if (res.data.message === "Merged with existing ticket") {
        alert(`Your message was merged with ticket ID: ${res.data.ticketId}`);
      } else {
        alert("Ticket submitted! ID: " + res.data.ticketId);
      }
      setEmail("");
      setMessage("");
      await fetchTickets();
    } catch (err) {
      console.error(err);
      alert("Failed to submit ticket");
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const submitGuestReply = async (ticketId, text) => {
    setLoading(true);
    setLoadingAction('reply');
    try {
      await axios.post(`http://localhost:4000/tickets/${ticketId}/messages`, {
        sender: "guest",
        text,
      });
      await fetchTickets();
    } catch (err) {
      console.error(err);
      alert("Failed to send reply");
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    setLoadingAction('fetch');
    try {
      const res = await axios.get("http://localhost:4000/tickets");
      // Reverse the array so latest tickets come first
      setTickets(res.data.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const handleAdminAction = async (ticketId, messageId, action, reassignTo = "TechnicalAgent") => {
    setLoading(true);
    setLoadingAction('admin');
    try {
      await axios.post(`http://localhost:4000/tickets/${ticketId}/admin-action`, {
        messageId,
        action,
        editedText: editText[messageId],
        reassignTo,
      });
      await fetchTickets();
      setEditText((prev) => ({ ...prev, [messageId]: "", [`reassign-${messageId}`]: "" }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const getConfidenceClass = (confidence) => {
    if (confidence >= 0.8) return "confidence-high";
    if (confidence >= 0.5) return "confidence-medium";
    return "confidence-low";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending": return "status-pending";
      case "sent":
      case "approved": return "status-sent";
      case "low-confidence":
      case "escalated": return "status-escalated";
      case "failed": return "status-failed";
      default: return "";
    }
  };

  const getLoadingMessage = () => {
    switch (loadingAction) {
      case 'submit': return 'Submitting ticket...';
      case 'reply': return 'Sending reply...';
      case 'admin': return 'Processing action...';
      case 'fetch': return 'Loading tickets...';
      default: return 'Loading...';
    }
  };

  return (
    <div className="app-container">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="loading-text">{getLoadingMessage()}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="app-logo-text">Support Hub</span>
        </div>

        <div className="header-actions">
          <div className="mode-toggle">
            <span className="mode-toggle-label">Guest</span>
            <div
              className={`toggle-switch ${isAdmin ? "active" : ""}`}
              onClick={() => setIsAdmin((prev) => !prev)}
            />
            <span className="mode-toggle-label">Admin</span>
          </div>
          <span className={`mode-indicator ${isAdmin ? "admin" : "guest"}`}>
            {isAdmin ? "Admin Mode" : "Guest Mode"}
          </span>

          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={() => setDarkMode((prev) => !prev)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Guest Ticket Form */}
        {!isAdmin && (
          <form className="ticket-form" onSubmit={submitTicket}>
            <h2 className="ticket-form-title">Submit a Support Request</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group message">
                <label className="form-label">How can we help?</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Describe your issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: "0 0 auto", alignSelf: "flex-end" }}>
                <button type="submit" className="btn btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Submit
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">
            {isAdmin ? "Ticket Management" : "Your Conversations"}
          </h2>
          <button className="btn btn-secondary" onClick={fetchTickets}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Tickets */}
        <div className="tickets-container">
          {tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="empty-state-text">No tickets yet. Submit a request to get started!</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                {/* Ticket Header */}
                <div className="ticket-header">
                  <div className="ticket-info">
                    <span className="ticket-id">Ticket #{ticket.id}</span>
                    <span className="ticket-email">{ticket.email}</span>
                  </div>
                  <div className="ticket-meta">
                    <div className="ticket-intent">
                      <span className="intent-label">Intent:</span>
                      <span className="intent-value">{ticket.intent || "Unknown"}</span>
                    </div>
                    {ticket.confidence !== undefined && (
                      <span className={`confidence-badge ${getConfidenceClass(ticket.confidence)}`}>
                        {Math.round(ticket.confidence * 100)}% confident
                      </span>
                    )}
                  </div>
                </div>

                {/* Ticket Body */}
                <div className="ticket-body">
                  <h4 className="conversation-title">Conversation</h4>
                  <div className="conversation-container">
                    {ticket.messages
                      .filter((msg) =>
                        isAdmin ||
                        msg.sender === "guest" ||
                        msg.status === "sent" ||
                        msg.status === "approved"
                      )
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={`message-wrapper ${msg.sender}`}
                        >
                          <div
                            className={`message-bubble ${msg.sender} ${
                              msg.status === "low-confidence" || msg.status === "escalated"
                                ? "low-confidence"
                                : msg.status === "failed"
                                ? "failed"
                                : ""
                            }`}
                          >
                            {/* Alert Badge */}
                            {(msg.status === "low-confidence" || msg.status === "escalated") && (
                              <span className="alert-badge">!</span>
                            )}

                            <div className={`message-sender ${msg.sender}`}>
                              {msg.sender === "guest" ? "Customer" : "Support Agent"}
                            </div>
                            <div className="message-content">{msg.content}</div>

                            {/* Reasoning */}
                            {msg.sender === "agent" && msg.reasoning && (
                              <div className="message-reasoning">
                                {msg.reasoning}
                              </div>
                            )}

                            {/* Status Badge (Admin only) */}
                            {isAdmin && (
                              <div className="message-status">
                                <span className={`status-badge ${getStatusClass(msg.status)}`}>
                                  {msg.status}
                                </span>
                              </div>
                            )}

                            {/* Admin Controls */}
                            {isAdmin && (msg.status === "pending" || msg.status === "low-confidence") && msg.sender === "agent" && (
                              <div className="admin-controls">
                                <textarea
                                  className="admin-textarea"
                                  placeholder="Edit message before sending..."
                                  value={editText[msg.id] !== undefined ? editText[msg.id] : msg.content}
                                  onChange={(e) =>
                                    setEditText((prev) => ({ ...prev, [msg.id]: e.target.value }))
                                  }
                                />
                                <div className="admin-actions">
                                  {msg.status === "pending" && (
                                    <>
                                      <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleAdminAction(ticket.id, msg.id, "approve")}
                                      >
                                        Approve
                                      </button>
                                      <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleAdminAction(ticket.id, msg.id, "edit")}
                                      >
                                        Edit & Send
                                      </button>
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleAdminAction(ticket.id, msg.id, "reject")}
                                      >
                                        Reject
                                      </button>
                                      <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => {
                                          const agentType = prompt("Enter agent to reassign to (e.g., TechnicalAgent, RefundAgent):");
                                          if (agentType) handleAdminAction(ticket.id, msg.id, "reassign", agentType);
                                        }}
                                      >
                                        Reassign
                                      </button>
                                    </>
                                  )}
                                  {msg.status === "low-confidence" && (
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => handleAdminAction(ticket.id, msg.id, "approve")}
                                    >
                                      Approve & Send
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Failed Message Warning */}
                            {isAdmin && msg.status === "failed" && (
                              <div className="failed-warning">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                  <line x1="12" y1="9" x2="12" y2="13" />
                                  <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                Agent failed - manual response required
                              </div>
                            )}

                            {/* Escalated Message Panel */}
                            {isAdmin && msg.status === "escalated" && (
                              <div className="escalated-panel">
                                <div className="escalated-title">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                  </svg>
                                  Escalated - Needs Admin Response
                                </div>
                                <textarea
                                  className="admin-textarea"
                                  placeholder="Write your response..."
                                  value={editText[msg.id] || ""}
                                  onChange={(e) =>
                                    setEditText((prev) => ({ ...prev, [msg.id]: e.target.value }))
                                  }
                                />
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleAdminAction(ticket.id, msg.id, "approve")}
                                >
                                  Send Response
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                    {/* Guest Reply Input */}
                    {!isAdmin && (
                      <div className="reply-container">
                        <div className="reply-input-wrapper">
                          <input
                            type="text"
                            className="reply-input"
                            placeholder="Type your reply..."
                            value={replyText[ticket.id] || ""}
                            onChange={(e) =>
                              setReplyText((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && replyText[ticket.id]?.trim()) {
                                submitGuestReply(ticket.id, replyText[ticket.id].trim());
                                setReplyText((prev) => ({ ...prev, [ticket.id]: "" }));
                              }
                            }}
                          />
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              if (replyText[ticket.id]?.trim()) {
                                submitGuestReply(ticket.id, replyText[ticket.id].trim());
                                setReplyText((prev) => ({ ...prev, [ticket.id]: "" }));
                              }
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
