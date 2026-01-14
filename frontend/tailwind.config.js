/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        'dark-primary': '#121212',
        'dark-secondary': '#1e1e1e',
        'dark-tertiary': '#2a2a2a',
        'dark-card': '#1a1a1a',
        'dark-input': '#262626',
        'dark-hover': '#333333',
        'dark-border': '#333333',
        'dark-border-light': '#404040',

        // Light theme colors
        'light-primary': '#f8fafc',
        'light-secondary': '#ffffff',
        'light-tertiary': '#f1f5f9',
        'light-card': '#ffffff',
        'light-input': '#f1f5f9',
        'light-hover': '#e2e8f0',
        'light-border': '#e2e8f0',
        'light-border-light': '#cbd5e1',

        // Text colors dark
        'text-dark-primary': '#f5f5f5',
        'text-dark-secondary': '#b3b3b3',
        'text-dark-muted': '#737373',

        // Text colors light
        'text-light-primary': '#1e293b',
        'text-light-secondary': '#64748b',
        'text-light-muted': '#94a3b8',

        // Accent colors (same for both themes)
        'accent-primary': '#f97316',
        'accent-primary-hover': '#fb923c',
        'accent-secondary': '#ea580c',
        'accent-success': '#22c55e',
        'accent-warning': '#eab308',
        'accent-danger': '#ef4444',
        'accent-info': '#0ea5e9',
      },
      borderRadius: {
        'sm-custom': '6px',
        'md-custom': '8px',
        'lg-custom': '12px',
        'xl-custom': '16px',
      },
      boxShadow: {
        'sm-dark': '0 1px 2px rgba(0, 0, 0, 0.4)',
        'md-dark': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'lg-dark': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'sm-light': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md-light': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg-light': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(249, 115, 22, 0.25)',
        'glow-strong': '0 0 30px rgba(249, 115, 22, 0.1)',
      },
      animation: {
        'pulse-custom': 'pulse-custom 2s infinite',
        'spin-slow': 'spin 0.8s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        'pulse-custom': {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)',
          },
          '50%': {
            transform: 'scale(1.05)',
            boxShadow: '0 0 0 6px rgba(239, 68, 68, 0)',
          },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: {
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'gradient-admin': 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
        'gradient-admin-hover': 'linear-gradient(135deg, #fb923c 0%, #ef4444 100%)',
        'gradient-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'gradient-closed': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      },
    },
  },
  plugins: [],
}
