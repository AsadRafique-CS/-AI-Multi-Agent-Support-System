import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:4000/auth/forgot-password", {
        email: email.toLowerCase(),
      });

      setSuccess(true);

      // In development, show the reset token
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to send reset email. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm" style={{ background: 'var(--loading-bg)' }}>
          <div className="flex flex-col items-center gap-5">
            <div className="w-11 h-11 border-[3px] border-t-accent-primary rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: '#f97316' }}></div>
            <p className="text-[0.9375rem] font-medium" style={{ color: 'var(--text-secondary)' }}>Sending reset code...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b px-8 py-4 flex justify-between items-center backdrop-blur-xl" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] bg-gradient-primary rounded-lg-custom flex items-center justify-center text-white shadow-glow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-[1.375rem] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Support Hub</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border no-underline" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} onMouseEnter={(e) => { e.target.style.background = 'var(--bg-hover)'; e.target.style.borderColor = 'var(--border-light)'; }} onMouseLeave={(e) => { e.target.style.background = 'var(--bg-tertiary)'; e.target.style.borderColor = 'var(--border-color)'; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Back to Login
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

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="w-full max-w-[420px]">
          <div className="border rounded-2xl p-10 shadow-lg-dark" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-xl-custom flex items-center justify-center text-white shadow-glow">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 0 0-9.95 9h11.64L9.74 7.05a1 1 0 0 1 1.41-1.41l5.66 5.65a1 1 0 0 1 0 1.42l-5.66 5.65a1 1 0 0 1-1.41 0 1 1 0 0 1 0-1.41L13.69 13H2.05A10 10 0 1 0 12 2z" />
                </svg>
              </div>
              <h1 className="text-[1.75rem] font-bold tracking-tight mb-2 m-0" style={{ color: 'var(--text-primary)' }}>Forgot Password?</h1>
              <p className="text-[0.9375rem] m-0" style={{ color: 'var(--text-secondary)' }}>Enter your email to receive a reset code</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 py-3.5 px-4 border rounded-lg-custom mb-4 text-sm font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.25)', color: 'var(--accent-danger, #ef4444)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 py-3.5 px-4 border rounded-lg-custom mb-4 text-sm" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.25)', color: 'var(--accent-success, #22c55e)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div className="flex-1">
                  <div className="font-semibold mb-2">Email Sent!</div>
                  <div className="text-[0.9em] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    We've sent a password reset code to your email address.
                    Please check your inbox and follow the instructions to reset your password.
                  </div>
                  {resetToken && (
                    <div className="mt-3 p-2.5 rounded-md text-xs" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--text-primary)' }}>
                      <strong>Development Mode:</strong> Reset code: <strong style={{ fontSize: '1.1em', letterSpacing: '2px' }}>{resetToken}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="mb-0">
                <label className="block text-[0.8125rem] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <div className="relative flex items-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 pointer-events-none transition-colors duration-200" style={{ color: 'var(--text-muted)' }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    className="w-full py-3 pr-4 pl-12 rounded-lg-custom text-[0.9375rem] transition-all duration-200 border focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)]"
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => { e.target.style.borderColor = '#f97316'; e.target.previousElementSibling.style.color = '#f97316'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.previousElementSibling.style.color = 'var(--text-muted)'; }}
                    required
                    disabled={success}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full justify-center py-3.5 px-6 text-base inline-flex items-center gap-2 font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border-none bg-gradient-primary text-white hover:-translate-y-px hover:shadow-glow mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || success}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Send Reset Code
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <p className="m-0 mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Remember your password?</p>
              <Link to="/login" className="text-accent-primary font-semibold no-underline transition-all duration-200 hover:text-accent-primary-hover hover:underline">Back to Login</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
