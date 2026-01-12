import rateLimit from 'express-rate-limit';

// General API rate limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication endpoints - 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/signup requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful requests
});

// Password reset limiter - 3 requests per hour
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset requests, please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ticket creation limiter - 10 tickets per 15 minutes
export const ticketCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 ticket submissions per windowMs
  message: {
    error: 'Too many ticket submissions, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin action limiter - 50 actions per 15 minutes
export const adminActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 admin actions per windowMs
  message: {
    error: 'Too many admin actions, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
