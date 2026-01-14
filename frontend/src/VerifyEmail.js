import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Modal from "./components/Modal";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });
  const navigate = useNavigate();

  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    // Redirect if already logged in
    const token = localStorage.getItem("userToken");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setModal({
        isOpen: true,
        title: "Error",
        message: "Please enter the verification code",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:4000/auth/verify-email", {
        email: email.toLowerCase(),
        code: code.trim(),
      });

      // Save token and user info
      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("userEmail", response.data.user.email);
      localStorage.setItem("userName", response.data.user.name);

      setModal({
        isOpen: true,
        title: "Success!",
        message: "Email verified successfully! Redirecting to dashboard...",
        type: "success",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Verification failed. Please try again.";
      setModal({
        isOpen: true,
        title: "Error",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      setModal({
        isOpen: true,
        title: "Error",
        message: "Please enter your email address",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:4000/auth/resend-verification", {
        email: email.toLowerCase(),
      });

      setModal({
        isOpen: true,
        title: "Success!",
        message: "Verification code has been resent to your email",
        type: "success",
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to resend code. Please try again.";
      setModal({
        isOpen: true,
        title: "Error",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-[0.9375rem] font-medium" style={{ color: 'var(--text-secondary)' }}>Processing...</p>
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
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="text-[1.75rem] font-bold tracking-tight mb-2 m-0" style={{ color: 'var(--text-primary)' }}>Verify Your Email</h2>
              <p className="text-[0.9375rem] m-0 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                We've sent a 6-digit verification code to your email. Please enter it below to verify your account.
              </p>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-5">
              <div className="mb-0">
                <label htmlFor="email" className="block text-[0.8125rem] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full py-3 px-4 rounded-lg-custom text-[0.9375rem] transition-all duration-200 border focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)]"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#f97316'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="mb-0">
                <label htmlFor="code" className="block text-[0.8125rem] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  className="w-full py-3 px-4 rounded-lg-custom transition-all duration-200 border focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)]"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontSize: '1.2rem', letterSpacing: '0.5rem', textAlign: 'center' }}
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onFocus={(e) => e.target.style.borderColor = '#f97316'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  required
                  maxLength={6}
                  autoComplete="off"
                />
              </div>

              <button type="submit" className="w-full justify-center py-3.5 px-6 text-base inline-flex items-center gap-2 font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border-none bg-gradient-primary text-white hover:-translate-y-px hover:shadow-glow mt-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                Verify Email
              </button>

              <div className="relative text-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }}></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 text-[0.8125rem]" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>Didn't receive the code?</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full justify-center py-3.5 px-6 text-base inline-flex items-center gap-2 font-semibold rounded-lg-custom cursor-pointer transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                onMouseEnter={(e) => !loading && (e.target.style.background = 'var(--bg-hover)', e.target.style.borderColor = 'var(--border-light)')}
                onMouseLeave={(e) => !loading && (e.target.style.background = 'var(--bg-tertiary)', e.target.style.borderColor = 'var(--border-color)')}
                onClick={handleResendCode}
                disabled={loading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Resend Code
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <p className="m-0 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Already verified? <Link to="/login" className="text-accent-primary font-semibold no-underline transition-all duration-200 hover:text-accent-primary-hover hover:underline">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
