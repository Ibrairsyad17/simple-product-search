import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    code: 429,
    message:
      'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      code: 429,
      message:
        'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    });
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
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

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
