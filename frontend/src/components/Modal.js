import React from "react";

export default function Modal({ isOpen, onClose, title, message, type = "info", actions }) {
  if (!isOpen) return null;

  const getIconClasses = () => {
    const baseClasses = "w-14 h-14 p-3 rounded-full";
    switch (type) {
      case "success":
        return `${baseClasses} bg-accent-success/10 text-accent-success`;
      case "error":
        return `${baseClasses} bg-accent-danger/10 text-accent-danger`;
      case "warning":
        return `${baseClasses} bg-accent-warning/10 text-accent-warning`;
      default:
        return `${baseClasses} bg-accent-info/10 text-accent-info`;
    }
  };

  const getButtonClasses = (variant) => {
    const baseClasses = "px-8 py-3 rounded-lg text-[0.95rem] font-medium border-none cursor-pointer transition-all duration-200 min-w-[100px]";
    switch (variant) {
      case "primary":
        return `${baseClasses} bg-gradient-purple text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(102,126,234,0.4)]`;
      case "danger":
        return `${baseClasses} bg-gradient-danger text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(239,68,68,0.4)]`;
      case "secondary":
        return `${baseClasses} bg-transparent border border-[var(--border-color)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[var(--border-hover,#444)]`;
      default:
        return `${baseClasses} bg-gradient-purple text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(102,126,234,0.4)]`;
    }
  };

  const getIcon = () => {
    const iconClasses = getIconClasses();
    switch (type) {
      case "success":
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClasses}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case "error":
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClasses}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case "warning":
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClasses}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      default:
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClasses}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-[var(--card-bg,#1e1e1e)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-[480px] w-[90%] max-h-[90vh] overflow-hidden animate-slide-up border border-[var(--border-color,#333)] data-[theme=light]:bg-white data-[theme=light]:border-[#e5e5e5]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex flex-col items-center gap-4 mb-6">
            {getIcon()}
            {title && <h3 className="text-2xl font-semibold text-[var(--text-primary,#fff)] m-0 text-center data-[theme=light]:text-[#1a1a1a]">{title}</h3>}
          </div>

          <div className="mb-8">
            {typeof message === "string" ? (
              <p className="text-base leading-relaxed text-[var(--text-secondary,#a0a0a0)] text-center m-0 whitespace-pre-wrap data-[theme=light]:text-[#666]">{message}</p>
            ) : (
              message
            )}
          </div>

          <div className="flex gap-3 justify-center flex-wrap sm:flex-nowrap">
            {actions ? (
              actions.map((action, index) => (
                <button
                  key={index}
                  className={getButtonClasses(action.variant)}
                  onClick={() => {
                    action.onClick?.();
                    onClose();
                  }}
                >
                  {action.label}
                </button>
              ))
            ) : (
              <button
                className={getButtonClasses("primary")}
                onClick={onClose}
              >
                OK
              </button>
            )}
          </div>
        </div>

        <button
          className="absolute top-4 right-4 bg-transparent border-none cursor-pointer p-2 rounded-lg text-[var(--text-secondary,#a0a0a0)] transition-all duration-200 flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] hover:text-[var(--text-primary,#fff)] data-[theme=light]:text-[#666] data-[theme=light]:hover:bg-[rgba(0,0,0,0.05)] data-[theme=light]:hover:text-[#1a1a1a]"
          onClick={onClose}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
