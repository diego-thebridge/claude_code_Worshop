// rateLimit.middleware.js
// Rate limiting middleware using express-rate-limit

const rateLimit = require('express-rate-limit');

// Global API rate limiter: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the 100 requests in 15 minutes limit. Please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

module.exports = {
  apiLimiter
};
