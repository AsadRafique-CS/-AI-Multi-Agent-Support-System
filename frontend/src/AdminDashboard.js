import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [editText, setEditText] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setLoadingAction("fetch");
    try {
      const res = await axios.get("http://localhost:4000/tickets");
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
    setLoadingAction("admin");
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

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    navigate("/admin/login");
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
      case "admin": return "Processing action...";
      case "fetch": return "Loading tickets...";
      default: return "Loading...";
    }
  };

  const adminEmail = localStorage.getItem("adminEmail") || "Admin";

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
          <div className="app-logo-icon admin-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="app-logo-text">Admin Panel</span>
        </div>

        <div className="header-actions">
          <div className="admin-user-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{adminEmail}</span>
          </div>
          <button className="btn btn-secondary" onClick={fetchTickets}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
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
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Ticket Management
          </h2>
          <div className="admin-stats">
            <div className="stat-badge">
              <span className="stat-count">{tickets.length}</span>
              <span className="stat-label">Total Tickets</span>
            </div>
            <div className="stat-badge pending">
              <span className="stat-count">
                {tickets.filter(t => t.messages.some(m => m.status === "pending" || m.status === "low-confidence")).length}
              </span>
              <span className="stat-label">Pending Review</span>
            </div>
          </div>
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
              <p className="empty-state-text">No tickets yet.</p>
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
                    {ticket.messages.map((msg) => (
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

                          {/* Status Badge */}
                          <div className="message-status">
                            <span className={`status-badge ${getStatusClass(msg.status)}`}>
                              {msg.status}
                            </span>
                          </div>

                          {/* Admin Controls */}
                          {(msg.status === "pending" || msg.status === "low-confidence") && msg.sender === "agent" && (
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
                          {msg.status === "failed" && (
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
                          {msg.status === "escalated" && (
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
