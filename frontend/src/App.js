import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import Modal from "./components/Modal";

function App() {
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null); // 'submit', 'reply', 'fetch'
  const [darkMode, setDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, page: 1, limit: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const submitTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingAction('submit');
    try {
      const userEmail = localStorage.getItem("userEmail");
      const res = await axios.post("http://localhost:4000/tickets", {
        email: userEmail,
        message,
      });

      if (res.data.merged) {
        // Ticket was merged with existing ticket
        setModal({
          isOpen: true,
          title: "Ticket Merged",
          message: (
            <div>
              <p>{res.data.message}</p>
              <p style={{ marginTop: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
                Similarity: {res.data.similarity}%
              </p>
              <p style={{ marginTop: "0.5rem" }}>
                Your message has been added to the existing conversation.
              </p>
            </div>
          ),
          type: "info",
        });
      } else {
        // New ticket created
        setModal({
          isOpen: true,
          title: "Success!",
          message: `Ticket submitted successfully!\n\nTicket ID: ${res.data.ticketId.substring(0, 8)}`,
          type: "success",
        });
      }

      setMessage("");
      await fetchTickets();
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        title: "Error",
        message: "Failed to submit ticket. Please try again.",
        type: "error",
      });
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
      setModal({
        isOpen: true,
        title: "Reply Sent",
        message: "Your reply has been sent successfully.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        title: "Error",
        message: "Failed to send reply. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    setLoadingAction('fetch');
    try {
      const userEmail = localStorage.getItem("userEmail");
      const params = new URLSearchParams({
        email: userEmail,
        page: currentPage,
        limit: 10,
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);

      const res = await axios.get(`http://localhost:4000/tickets?${params.toString()}`);
      setTickets(res.data.tickets || []);
      setPagination(res.data.pagination || { total: 0, totalPages: 0, page: 1, limit: 10 });
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

  const getLoadingMessage = () => {
    switch (loadingAction) {
      case 'submit': return 'Submitting ticket...';
      case 'reply': return 'Sending reply...';
      case 'fetch': return 'Loading tickets...';
      default: return 'Loading...';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const closeTicket = async (ticketId) => {
    // Show modal to get close reason
    const reasons = [
      { value: "Issue resolved", label: "Issue resolved" },
      { value: "No longer needed", label: "No longer needed" },
      { value: "Found solution elsewhere", label: "Found solution elsewhere" },
      { value: "Duplicate ticket", label: "Duplicate ticket" },
      { value: "Other", label: "Other" }
    ];

    // Create custom modal content
    const modalContent = (
      <div>
        <p>Are you sure you want to close this ticket? Once closed, you cannot reopen it or add more replies.</p>
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>Please select a reason:</p>
      </div>
    );

    // For now, show confirmation and use a default reason
    // We'll implement a better modal with dropdown selection next
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

      await fetchTickets();
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

  const userEmail = localStorage.getItem("userEmail") || "User";

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
          <div className="admin-user-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{userEmail}</span>
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
        {/* Ticket Form */}
        <form className="ticket-form" onSubmit={submitTicket}>
          <h2 className="ticket-form-title">Submit a Support Request</h2>
          <div className="form-row">
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

        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">Your Conversations</h2>
        </div>

        {/* Search and Filter */}
        <div className="search-filter-container" style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div className="form-group" style={{ flex: "1", minWidth: "200px", margin: 0 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by email or ticket ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className="form-group" style={{ flex: "0 0 auto", minWidth: "150px", margin: 0 }}>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ marginBottom: 0 }}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="answered">Answered</option>
              <option value="closed">Closed</option>
            </select>
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
              <p className="empty-state-text">No tickets yet. Submit a request to get started!</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className={`ticket-card ${ticket.status === 'closed' ? 'ticket-closed' : ''}`}>
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
                        msg.sender === "guest" ||
                        msg.status === "sent" ||
                        msg.status === "approved"
                      )
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={`message-wrapper ${msg.sender}`}
                        >
                          <div className={`message-bubble ${msg.sender}`}>
                            <div className={`message-sender ${msg.sender}`}>
                              {msg.sender === "guest" ? "You" : "Support Agent"}
                            </div>
                            <div className="message-content">{msg.content}</div>

                            {/* Reasoning (hidden for guest view) */}
                            {msg.sender === "agent" && msg.reasoning && (
                              <div className="message-reasoning">
                                {msg.reasoning}
                              </div>
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
                        {/* Close Ticket Button */}
                        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => closeTicket(ticket.id)}
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
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "30px", padding: "20px 0" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Previous
            </button>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "8px" }}>
                ({pagination.total} total)
              </span>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage >= pagination.totalPages}
              style={{ opacity: currentPage >= pagination.totalPages ? 0.5 : 1 }}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
