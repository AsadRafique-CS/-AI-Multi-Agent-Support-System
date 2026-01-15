import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Modal from "./components/Modal";
import FilePreview from "./components/FilePreview";

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
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {/* Loading Overlay */}
        <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm" style={{ background: 'var(--loading-bg)' }}>
          <div className="flex flex-col items-center gap-5">
            <div className="w-11 h-11 border-[3px] border-t-accent-primary rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: '#f97316' }}></div>
            <p className="text-[0.9375rem] font-medium" style={{ color: 'var(--text-secondary)' }}>{getLoadingMessage()}</p>
          </div>
        </div>

        <header className="sticky top-0 z-[100] border-b px-8 py-4 flex justify-between items-center backdrop-blur-xl" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] bg-gradient-primary rounded-lg-custom flex items-center justify-center text-white shadow-glow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="text-[1.375rem] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Support Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border no-underline" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} onMouseEnter={(e) => { e.target.style.background = 'var(--bg-hover)'; e.target.style.borderColor = 'var(--border-light)'; }} onMouseLeave={(e) => { e.target.style.background = 'var(--bg-tertiary)'; e.target.style.borderColor = 'var(--border-color)'; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
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
        <main className="max-w-[1000px] mx-auto p-8">
          <div className="text-center py-16 px-8" style={{ color: 'var(--text-secondary)' }}>
            <div className="mb-4 opacity-40">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto animate-pulse">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>Loading ticket...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <header className="sticky top-0 z-[100] border-b px-8 py-4 flex justify-between items-center backdrop-blur-xl" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] bg-gradient-primary rounded-lg-custom flex items-center justify-center text-white shadow-glow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="text-[1.375rem] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Support Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border no-underline" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} onMouseEnter={(e) => { e.target.style.background = 'var(--bg-hover)'; e.target.style.borderColor = 'var(--border-light)'; }} onMouseLeave={(e) => { e.target.style.background = 'var(--bg-tertiary)'; e.target.style.borderColor = 'var(--border-color)'; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
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
        <main className="max-w-[1000px] mx-auto p-8">
          <div className="text-center py-16 px-8" style={{ color: 'var(--text-secondary)' }}>
            <div className="mb-4 opacity-40">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>Ticket not found</p>
            <Link to="/" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border-none bg-gradient-primary text-white hover:-translate-y-px hover:shadow-glow mt-4 no-underline">
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
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
        <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm" style={{ background: 'var(--loading-bg)' }}>
          <div className="flex flex-col items-center gap-5">
            <div className="w-11 h-11 border-[3px] border-t-accent-primary rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: '#f97316' }}></div>
            <p className="text-[0.9375rem] font-medium" style={{ color: 'var(--text-secondary)' }}>{getLoadingMessage()}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-[100] border-b px-8 py-4 flex justify-between items-center backdrop-blur-xl" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] bg-gradient-primary rounded-lg-custom flex items-center justify-center text-white shadow-glow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-[1.375rem] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Support Hub</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border no-underline" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} onMouseEnter={(e) => { e.target.style.background = 'var(--bg-hover)'; e.target.style.borderColor = 'var(--border-light)'; }} onMouseLeave={(e) => { e.target.style.background = 'var(--bg-tertiary)'; e.target.style.borderColor = 'var(--border-color)'; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <button className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} onMouseEnter={(e) => { e.target.style.background = 'var(--bg-hover)'; e.target.style.borderColor = 'var(--border-light)'; }} onMouseLeave={(e) => { e.target.style.background = 'var(--bg-tertiary)'; e.target.style.borderColor = 'var(--border-color)'; }} onClick={fetchTicket}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
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
      <main className="max-w-[1000px] mx-auto p-8">
        <div className={`rounded-xl-custom border overflow-hidden transition-all duration-200 shadow-sm-dark hover:shadow-md-dark ${ticket.status === 'closed' ? 'opacity-85' : ''}`} style={{ background: 'var(--bg-card)', borderColor: ticket.status === 'closed' ? '#ef4444' : 'var(--border-color)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = ticket.status === 'closed' ? '#ef4444' : 'var(--border-light)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = ticket.status === 'closed' ? '#ef4444' : 'var(--border-color)'}>
          {/* Closed Banner */}
          {ticket.status === 'closed' && (
            <div className="bg-gradient-closed text-white py-3 px-5 flex items-center gap-2 font-semibold text-sm tracking-wide">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 9h6v6H9z" />
              </svg>
              TICKET CLOSED
              {ticket.closed_at && (
                <span className="ml-4 text-[0.85rem] opacity-80">
                  Closed on {new Date(ticket.closed_at).toLocaleDateString()}
                </span>
              )}
              {ticket.closed_by && (
                <span className="ml-2 text-[0.85rem] opacity-80">
                  by {ticket.closed_by === 'admin' ? 'Admin' : 'You'}
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
            <div className="flex items-center gap-2.5">
              {ticket.status === 'closed' && (
                <span className="py-1 px-3 rounded-sm-custom text-xs font-semibold uppercase tracking-wide bg-accent-danger/10 text-accent-danger border border-accent-danger/30">CLOSED</span>
              )}
              {ticket.intent && (
                <div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-sm-custom text-xs" style={{ background: 'var(--bg-tertiary)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Intent:</span>
                  <span className="text-accent-info font-semibold">{ticket.intent}</span>
                </div>
              )}
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
              {ticket.messages
                .filter(
                  (msg) =>
                    msg.sender === "guest" ||
                    msg.status === "sent" ||
                    msg.status === "approved"
                )
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${msg.sender === 'guest' ? 'self-start' : 'self-end'}`}
                  >
                    <div className={`py-3.5 px-4 rounded-xl-custom relative border ${
                      msg.sender === 'guest'
                        ? 'rounded-bl-sm'
                        : 'rounded-br-sm'
                    }`} style={{
                      background: msg.sender === 'guest' ? 'var(--bg-tertiary)' : 'rgba(249, 115, 22, 0.1)',
                      borderColor: msg.sender === 'guest' ? 'var(--border-color)' : 'rgba(249, 115, 22, 0.3)'
                    }}>
                      <div className={`text-[0.6875rem] font-semibold uppercase tracking-widest mb-1.5 ${
                        msg.sender === 'guest' ? 'text-accent-info' : 'text-accent-primary'
                      }`}>
                        {msg.sender === "guest" ? "You" : "Support Agent"}
                      </div>
                      <div className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--text-primary)' }}>{msg.content}</div>

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <FilePreview attachments={msg.attachments} />
                      )}

                      {msg.sender === "agent" && msg.reasoning && (
                        <div className="text-[0.8125rem] italic mt-2 pt-2 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                          {msg.reasoning}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {/* Reply Input or Closed Message */}
              {ticket.status === 'closed' ? (
                <div className="border rounded-lg-custom p-6 text-center" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-danger mb-3 mx-auto">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="m-0 leading-relaxed">This ticket is closed. You cannot add more replies.</p>
                  {ticket.close_reason && (
                    <p className="text-[0.9rem] mt-2 m-0">
                      <strong>Reason:</strong> {ticket.close_reason}
                    </p>
                  )}
                  <p className="text-[0.85rem] mt-2 m-0 opacity-70">
                    Create a new ticket for new issues.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        className="flex-1 py-3 px-4 rounded-xl-custom text-[0.9375rem] transition-all duration-200 border focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]"
                        style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        placeholder="Type your reply..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && reply.trim()) {
                            sendReply();
                          }
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#f97316'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                      />
                      <button
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border-none bg-gradient-primary text-white hover:-translate-y-px hover:shadow-glow"
                        onClick={sendReply}
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
                  <div className="mt-4 flex justify-end">
                    <button
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-[0.9rem] font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                      onMouseEnter={(e) => { e.target.style.background = 'var(--bg-hover)'; e.target.style.borderColor = 'var(--border-light)'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'var(--bg-tertiary)'; e.target.style.borderColor = 'var(--border-color)'; }}
                      onClick={closeTicket}
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
