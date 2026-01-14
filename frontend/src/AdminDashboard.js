import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [editText, setEditText] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, page: 1, limit: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    fetchTickets();
  }, [currentPage, searchQuery, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    setLoadingAction("fetch");
    try {
      const params = new URLSearchParams({
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

  const closeTicket = async (ticketId) => {
    const closeReason = prompt("Enter reason for closing this ticket:");

    if (!closeReason || !closeReason.trim()) {
      alert("Close reason is required");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to close this ticket?\n\nReason: ${closeReason}\n\nOnce closed, the ticket cannot be reopened.`);
    if (!confirmed) return;

    setLoading(true);
    setLoadingAction('close');

    try {
      await axios.post(`http://localhost:4000/tickets/${ticketId}/close`, {
        closedBy: "admin",
        closeReason: closeReason.trim()
      });

      alert("Ticket closed successfully. User has been notified via email.");
      await fetchTickets();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "Failed to close ticket. Please try again.";
      alert(errorMessage);
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

  const getLoadingMessage = () => {
    switch (loadingAction) {
      case "admin": return "Processing action...";
      case "fetch": return "Loading tickets...";
      case "close": return "Closing ticket...";
      default: return "Loading...";
    }
  };

  const adminEmail = localStorage.getItem("adminEmail") || "Admin";

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm" style={{ background: 'var(--loading-bg)' }}>
          <div className="flex flex-col items-center gap-5">
            <div className="w-11 h-11 border-[3px] border-t-accent-primary rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-primary, #f97316)' }}></div>
            <p className="text-[0.9375rem] font-medium" style={{ color: 'var(--text-secondary)' }}>{getLoadingMessage()}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-[100] border-b px-8 py-4 flex justify-between items-center backdrop-blur-xl" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] bg-gradient-admin rounded-lg-custom flex items-center justify-center text-white shadow-glow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="text-[1.375rem] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Admin Panel</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 py-2 px-4 rounded-lg-custom text-sm" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{adminEmail}</span>
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} onMouseEnter={(e) => { e.target.style.background = 'var(--bg-hover)'; e.target.style.borderColor = 'var(--border-light)'; }} onMouseLeave={(e) => { e.target.style.background = 'var(--bg-tertiary)'; e.target.style.borderColor = 'var(--border-color)'; }} onClick={fetchTickets}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border-none bg-accent-danger text-white hover:bg-[#dc2626]" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
          {/* Theme Toggle */}
          <button
            className="w-10 h-10 rounded-lg-custom border flex items-center justify-center cursor-pointer transition-all duration-200"
            style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.target.style.background = 'var(--bg-hover)'; e.target.style.color = '#f97316'; e.target.style.borderColor = 'var(--border-light)'; }}
            onMouseLeave={(e) => { e.target.style.background = 'var(--bg-tertiary)'; e.target.style.color = 'var(--text-secondary)'; e.target.style.borderColor = 'var(--border-color)'; }}
            onClick={() => setDarkMode((prev) => !prev)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto p-8">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Ticket Management
          </h2>
          <div className="flex gap-3 flex-wrap">
            <div className="flex flex-col items-center py-2.5 px-4 rounded-lg-custom border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <span className="text-xl font-bold text-accent-primary">{tickets.length}</span>
              <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Total Tickets</span>
            </div>
            <div className="flex flex-col items-center py-2.5 px-4 rounded-lg-custom border bg-accent-warning/10" style={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}>
              <span className="text-xl font-bold text-accent-warning">
                {tickets.filter(t => t.messages.some(m => m.status === "pending" || m.status === "low-confidence")).length}
              </span>
              <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Pending Review</span>
            </div>
            <div className="flex flex-col items-center py-2.5 px-4 rounded-lg-custom border bg-accent-danger/10" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <span className="text-xl font-bold text-accent-danger">
                {tickets.filter(t => t.status === "closed").length}
              </span>
              <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Closed</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-5 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] m-0">
            <input
              type="text"
              className="w-full py-3 px-4 rounded-lg-custom text-[0.9375rem] transition-all duration-200 border focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)] mb-0"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              placeholder="Search by email or ticket ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              onFocus={(e) => e.target.style.borderColor = '#f97316'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
          <div className="flex-[0_0_auto] min-w-[150px] m-0">
            <select
              className="w-full py-3 px-4 rounded-lg-custom text-[0.9375rem] transition-all duration-200 border focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)] mb-0"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              onFocus={(e) => e.target.style.borderColor = '#f97316'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
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
        <div className="flex flex-col gap-5">
          {tickets.length === 0 ? (
            <div className="text-center py-16 px-8" style={{ color: 'var(--text-secondary)' }}>
              <div className="mb-4 opacity-40">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-base" style={{ color: 'var(--text-muted)' }}>No tickets yet.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className={`rounded-xl-custom border overflow-hidden transition-all duration-200 shadow-sm-dark hover:shadow-md-dark ${ticket.status === 'closed' ? 'opacity-85' : ''}`} style={{ background: 'var(--bg-card)', borderColor: ticket.status === 'closed' ? '#ef4444' : 'var(--border-color)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = ticket.status === 'closed' ? '#ef4444' : 'var(--border-light)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = ticket.status === 'closed' ? '#ef4444' : 'var(--border-color)'}>
                {/* Closed Banner */}
                {ticket.status === 'closed' && (
                  <div className="bg-gradient-closed text-white py-3 px-5 flex items-center gap-2 font-semibold text-sm tracking-wide">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    TICKET CLOSED
                    {ticket.closed_at && (
                      <span className="ml-auto text-[0.8rem] opacity-90">
                        Closed on {new Date(ticket.closed_at).toLocaleDateString()} at {new Date(ticket.closed_at).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Ticket Header */}
                <div className="py-4 px-5 border-b flex justify-between items-center flex-wrap gap-3" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent-primary">Ticket #{ticket.id}</span>
                    <span className="text-[0.9375rem] font-medium" style={{ color: 'var(--text-primary)' }}>{ticket.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {ticket.status === 'closed' && (
                      <span className="py-1 px-3 rounded-sm-custom text-xs font-semibold uppercase tracking-wide bg-accent-danger/10 text-accent-danger border border-accent-danger/30">CLOSED</span>
                    )}
                    <div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-sm-custom text-xs" style={{ background: 'var(--bg-tertiary)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Intent:</span>
                      <span className="text-accent-info font-semibold">{ticket.intent || "Unknown"}</span>
                    </div>
                    {ticket.confidence !== undefined && (
                      <span className={`py-1 px-2 rounded-sm-custom text-[0.6875rem] font-semibold uppercase tracking-wider ${
                        ticket.confidence >= 0.8 ? 'bg-accent-success/15 text-accent-success' :
                        ticket.confidence >= 0.5 ? 'bg-accent-warning/15 text-accent-warning' :
                        'bg-accent-danger/15 text-accent-danger'
                      }`}>
                        {Math.round(ticket.confidence * 100)}% confident
                      </span>
                    )}
                  </div>
                </div>

                {/* Ticket Body */}
                <div className="p-5">
                  <h4 className="text-[0.6875rem] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Conversation</h4>
                  <div className="flex flex-col gap-3.5">
                    {ticket.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'guest' ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`py-3.5 px-4 rounded-xl-custom relative max-w-[85%] border ${
                            msg.sender === 'guest'
                              ? 'rounded-tl-sm'
                              : 'rounded-tr-sm'
                          } ${
                            msg.status === "low-confidence" || msg.status === "escalated"
                              ? 'border-accent-warning bg-accent-warning/10'
                              : msg.status === "failed"
                              ? 'border-accent-danger bg-accent-danger/10'
                              : ''
                          }`}
                          style={{
                            background: (msg.status === "low-confidence" || msg.status === "escalated") ? 'rgba(251, 191, 36, 0.1)' :
                                       msg.status === "failed" ? 'rgba(239, 68, 68, 0.1)' :
                                       msg.sender === 'guest' ? 'var(--bg-tertiary)' : 'rgba(147, 51, 234, 0.1)',
                            borderColor: (msg.status === "low-confidence" || msg.status === "escalated") ? 'rgba(251, 191, 36, 0.3)' :
                                        msg.status === "failed" ? 'rgba(239, 68, 68, 0.3)' :
                                        msg.sender === 'guest' ? 'var(--border-color)' : 'rgba(147, 51, 234, 0.3)'
                          }}
                        >
                          {/* Alert Badge */}
                          {(msg.status === "low-confidence" || msg.status === "escalated") && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent-warning text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">!</span>
                          )}

                          <div className={`text-[0.6875rem] font-semibold uppercase tracking-widest mb-1.5 ${
                            msg.sender === 'guest' ? 'text-accent-info' : 'text-accent-purple'
                          }`}>
                            {msg.sender === "guest" ? "Customer" : "Support Agent"}
                          </div>
                          <div className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--text-primary)' }}>{msg.content}</div>

                          {/* Reasoning */}
                          {msg.sender === "agent" && msg.reasoning && (
                            <div className="text-[0.8125rem] italic mt-2 pt-2 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                              {msg.reasoning}
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="mt-2 flex justify-end">
                            <span className={`py-0.5 px-2 rounded-sm-custom text-[0.625rem] font-semibold uppercase tracking-wide ${
                              msg.status === 'sent' || msg.status === 'approved' ? 'bg-accent-success/15 text-accent-success' :
                              msg.status === 'pending' ? 'bg-accent-warning/15 text-accent-warning' :
                              msg.status === 'low-confidence' || msg.status === 'escalated' ? 'bg-accent-warning/15 text-accent-warning' :
                              msg.status === 'failed' ? 'bg-accent-danger/15 text-accent-danger' :
                              'bg-gray-500/15 text-gray-500'
                            }`}>
                              {msg.status}
                            </span>
                          </div>

                          {/* Admin Controls */}
                          {(msg.status === "pending" || msg.status === "low-confidence") && msg.sender === "agent" && ticket.status !== 'closed' && (
                            <div className="mt-3 pt-3 border-t flex flex-col gap-2.5" style={{ borderColor: 'var(--border-color)' }}>
                              <textarea
                                className="w-full py-2.5 px-3.5 rounded-lg-custom text-[0.9375rem] transition-all duration-200 border focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)] resize-y min-h-[80px]"
                                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                placeholder="Edit message before sending..."
                                value={editText[msg.id] !== undefined ? editText[msg.id] : msg.content}
                                onChange={(e) =>
                                  setEditText((prev) => ({ ...prev, [msg.id]: e.target.value }))
                                }
                                onFocus={(e) => e.target.style.borderColor = '#f97316'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                              />
                              <div className="flex gap-2 flex-wrap">
                                {msg.status === "pending" && (
                                  <>
                                    <button
                                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border-none bg-accent-success text-white hover:bg-[#16a34a]"
                                      onClick={() => handleAdminAction(ticket.id, msg.id, "approve")}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border-none bg-gradient-primary text-white hover:-translate-y-px hover:shadow-glow"
                                      onClick={() => handleAdminAction(ticket.id, msg.id, "edit")}
                                    >
                                      Edit & Send
                                    </button>
                                    <button
                                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border-none bg-accent-danger text-white hover:bg-[#dc2626]"
                                      onClick={() => handleAdminAction(ticket.id, msg.id, "reject")}
                                    >
                                      Reject
                                    </button>
                                    <button
                                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border-none bg-accent-warning text-white hover:bg-[#f59e0b]"
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
                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border-none bg-accent-success text-white hover:bg-[#16a34a]"
                                    onClick={() => handleAdminAction(ticket.id, msg.id, "approve")}
                                  >
                                    Approve & Send
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Show message if ticket is closed and message is pending */}
                          {(msg.status === "pending" || msg.status === "low-confidence") && msg.sender === "agent" && ticket.status === 'closed' && (
                            <div className="mt-3 p-3 rounded-lg-custom text-[0.875rem] border" style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              borderColor: "rgba(239, 68, 68, 0.3)",
                              color: "var(--text-secondary)"
                            }}>
                              ⚠️ This message was auto-rejected when the ticket was closed.
                            </div>
                          )}

                          {/* Failed Message Warning */}
                          {msg.status === "failed" && (
                            <div className="mt-3 p-3 rounded-lg-custom flex items-center gap-2 text-[0.875rem] border bg-accent-danger/10" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--text-secondary)' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-danger flex-shrink-0">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                              </svg>
                              Agent failed - manual response required
                            </div>
                          )}

                          {/* Escalated Message Panel */}
                          {msg.status === "escalated" && ticket.status !== 'closed' && (
                            <div className="mt-3 pt-3 border-t flex flex-col gap-2.5" style={{ borderColor: 'var(--border-color)' }}>
                              <div className="flex items-center gap-2 text-accent-warning font-semibold text-sm">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                  <line x1="12" y1="9" x2="12" y2="13" />
                                  <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                Escalated - Needs Admin Response
                              </div>
                              <textarea
                                className="w-full py-2.5 px-3.5 rounded-lg-custom text-[0.9375rem] transition-all duration-200 border focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)] resize-y min-h-[80px]"
                                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                placeholder="Write your response..."
                                value={editText[msg.id] || ""}
                                onChange={(e) =>
                                  setEditText((prev) => ({ ...prev, [msg.id]: e.target.value }))
                                }
                                onFocus={(e) => e.target.style.borderColor = '#f97316'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                              />
                              <button
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border-none bg-gradient-primary text-white hover:-translate-y-px hover:shadow-glow self-start"
                                onClick={() => handleAdminAction(ticket.id, msg.id, "approve")}
                              >
                                Send Response
                              </button>
                            </div>
                          )}

                          {/* Show message if escalated but ticket is closed */}
                          {msg.status === "escalated" && ticket.status === 'closed' && (
                            <div className="mt-3 p-3 rounded-lg-custom text-[0.875rem] border" style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              borderColor: "rgba(239, 68, 68, 0.3)",
                              color: "var(--text-secondary)"
                            }}>
                              ⚠️ This escalated message cannot be responded to because the ticket is closed.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Close Metadata and Actions */}
                {ticket.status === 'closed' ? (
                  <div className="py-4 px-5 border-t flex flex-col gap-2" style={{
                    background: "var(--bg-secondary)",
                    borderColor: "var(--border-color)"
                  }}>
                    <div className="flex items-center gap-2 text-[0.875rem]" style={{ color: "var(--text-secondary)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <strong>Closed by:</strong> {ticket.closed_by === 'admin' ? 'Admin' : 'User'}
                    </div>
                    {ticket.close_reason && (
                      <div className="flex items-center gap-2 text-[0.875rem]" style={{ color: "var(--text-secondary)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <strong>Reason:</strong> {ticket.close_reason}
                      </div>
                    )}
                    <div className="mt-2 p-3 rounded-lg-custom text-[0.875rem]" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
                      ℹ️ This ticket is closed and cannot be reopened. Admin actions are disabled.
                    </div>
                  </div>
                ) : (
                  <div className="py-4 px-5 border-t flex justify-end" style={{ borderColor: "var(--border-color)" }}>
                    <button
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border-none bg-accent-danger text-white hover:bg-[#dc2626] disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => closeTicket(ticket.id)}
                      disabled={loading}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      Close Ticket
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2.5 mt-8 py-5">
            <button
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              onMouseEnter={(e) => !e.target.disabled && (e.target.style.background = 'var(--bg-hover)', e.target.style.borderColor = 'var(--border-light)')}
              onMouseLeave={(e) => !e.target.disabled && (e.target.style.background = 'var(--bg-tertiary)', e.target.style.borderColor = 'var(--border-color)')}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Previous
            </button>

            <div className="flex gap-2 items-center">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <span className="text-[13px] ml-2" style={{ color: 'var(--text-muted)' }}>
                ({pagination.total} total)
              </span>
            </div>

            <button
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              onMouseEnter={(e) => !e.target.disabled && (e.target.style.background = 'var(--bg-hover)', e.target.style.borderColor = 'var(--border-light)')}
              onMouseLeave={(e) => !e.target.disabled && (e.target.style.background = 'var(--bg-tertiary)', e.target.style.borderColor = 'var(--border-color)')}
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage >= pagination.totalPages}
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
