import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./App.css";
import Modal from "./components/Modal";

export default function TicketView() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null); // 'fetch', 'reply'
  const [darkMode, setDarkMode] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setLoadingAction('fetch');
      const res = await axios.get(`http://localhost:4000/tickets`);
      const t = res.data.find((t) => t.id === ticketId);
      setTicket(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    try {
      setLoading(true);
      setLoadingAction('reply');
      await axios.post(`http://localhost:4000/tickets/${ticketId}/messages`, {
        sender: "guest",
        text: reply.trim(),
      });
      setReply("");
      await fetchTicket();
      setModal({
        isOpen: true,
        title: "Success!",
        message: "Your reply has been sent successfully.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "Failed to send reply. Please try again.";
      setModal({
        isOpen: true,
        title: "Error",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const closeTicket = async () => {
    const confirmed = window.confirm("Are you sure you want to close this ticket? Once closed, you cannot reopen it.\n\nReason: Issue resolved");
    if (!confirmed) return;

    const closeReason = "Issue resolved"; // Default for now
    const userEmail = localStorage.getItem("userEmail");

    setLoading(true);
    setLoadingAction('close');

    try {
      await axios.post(`http://localhost:4000/tickets/${ticketId}/close`, {
        closedBy: "user",
        closeReason,
        userEmail
      });

      setModal({
        isOpen: true,
        title: "Ticket Closed",
        message: "Your ticket has been closed successfully. You can still view the conversation history.",
        type: "success",
      });

      await fetchTicket();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "Failed to close ticket. Please try again.";
      setModal({
        isOpen: true,
        title: "Error",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const getLoadingMessage = () => {
    switch (loadingAction) {
      case 'reply': return 'Sending reply...';
      case 'fetch': return 'Loading ticket...';
      default: return 'Loading...';
    }
  };

  if (loading && !ticket) {
    return (
      <div className="app-container">
        {/* Loading Overlay */}
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="loading-text">{getLoadingMessage()}</p>
          </div>
        </div>

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
            <Link to="/" className="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
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
        <main className="main-content">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ animation: "pulse 1.5s infinite" }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <p className="empty-state-text">Loading ticket...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="app-container">
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
            <Link to="/" className="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
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
        <main className="main-content">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <p className="empty-state-text">Ticket not found</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

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
          <Link to="/" className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <button className="btn btn-secondary" onClick={fetchTicket}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
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
        <div className={`ticket-card ${ticket.status === 'closed' ? 'ticket-closed' : ''}`}>
          {/* Closed Banner */}
          {ticket.status === 'closed' && (
            <div className="ticket-closed-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 9h6v6H9z" />
              </svg>
              TICKET CLOSED
              {ticket.closed_at && (
                <span style={{ marginLeft: "1rem", fontSize: "0.85rem", opacity: 0.8 }}>
                  Closed on {new Date(ticket.closed_at).toLocaleDateString()}
                </span>
              )}
              {ticket.closed_by && (
                <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", opacity: 0.8 }}>
                  by {ticket.closed_by === 'admin' ? 'Admin' : 'You'}
                </span>
              )}
            </div>
          )}

          {/* Ticket Header */}
          <div className="ticket-header">
            <div className="ticket-info">
              <span className="ticket-id">Ticket #{ticket.id}</span>
              <span className="ticket-email">{ticket.email}</span>
            </div>
            <div className="ticket-meta">
              {ticket.status === 'closed' && (
                <span className="status-badge status-closed">CLOSED</span>
              )}
              {ticket.intent && (
                <div className="ticket-intent">
                  <span className="intent-label">Intent:</span>
                  <span className="intent-value">{ticket.intent}</span>
                </div>
              )}
              {ticket.confidence !== undefined && (
                <span
                  className={`confidence-badge ${
                    ticket.confidence >= 0.8
                      ? "confidence-high"
                      : ticket.confidence >= 0.5
                      ? "confidence-medium"
                      : "confidence-low"
                  }`}
                >
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
                .filter(
                  (msg) =>
                    msg.sender === "guest" ||
                    msg.status === "sent" ||
                    msg.status === "approved"
                )
                .map((msg) => (
                  <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                    <div className={`message-bubble ${msg.sender}`}>
                      <div className={`message-sender ${msg.sender}`}>
                        {msg.sender === "guest" ? "You" : "Support Agent"}
                      </div>
                      <div className="message-content">{msg.content}</div>
                      {msg.sender === "agent" && msg.reasoning && (
                        <div className="message-reasoning">{msg.reasoning}</div>
                      )}
                    </div>
                  </div>
                ))}

              {/* Reply Input or Closed Message */}
              {ticket.status === 'closed' ? (
                <div className="ticket-closed-message">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p>This ticket is closed. You cannot add more replies.</p>
                  {ticket.close_reason && (
                    <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                      <strong>Reason:</strong> {ticket.close_reason}
                    </p>
                  )}
                  <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", opacity: 0.7 }}>
                    Create a new ticket for new issues.
                  </p>
                </div>
              ) : (
                <>
                  <div className="reply-container">
                    <div className="reply-input-wrapper">
                      <input
                        type="text"
                        className="reply-input"
                        placeholder="Type your reply..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && reply.trim()) {
                            sendReply();
                          }
                        }}
                      />
                      <button className="btn btn-primary" onClick={sendReply}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Send
                      </button>
                    </div>
                  </div>
                  {/* Close Ticket Button */}
                  <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="btn btn-secondary"
                      onClick={closeTicket}
                      style={{ fontSize: "0.9rem" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                      </svg>
                      Close Ticket
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
