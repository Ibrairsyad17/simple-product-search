import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiting for authentication endpoints
 * Prevents brute force attacks on login/auth endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    code: 429,
    message:
      'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests
  handler: (req, res) => {
    res.status(429).json({
      code: 429,
      message:
        'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    });
  },
});

/**
 * More lenient rate limiting for registration endpoint
 * Prevents spam account creation
 * 3 registrations per hour per IP
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  message: {
    code: 429,
    message:
      'Too many accounts created from this IP. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      code: 429,
      message:
        'Too many accounts created from this IP. Please try again after an hour.',
    });
  },
});

/**
 * General API rate limiting (optional)
 * Protects against general API abuse and DDoS
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: {
    code: 429,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check and documentation endpoints
    return (
      req.path === '/check-health' ||
      req.path.startsWith('/api-docs') ||
      req.path.startsWith('/swagger')
    );
  },
  handler: (req, res) => {
    res.status(429).json({
      code: 429,
      message: 'Too many requests from this IP. Please try again later.',
    });
  },
});
