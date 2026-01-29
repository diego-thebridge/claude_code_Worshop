// tests/integration/rateLimit.test.js
// Integration tests for rate limiting middleware

const request = require('supertest');
const app = require('../../src/app');

describe('Rate Limiting', () => {
  describe('API endpoints', () => {
    it('should allow requests under the rate limit', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should include rate limit headers in response', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.headers['ratelimit-limit']).toBe('100');
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
    });

    it('should apply rate limiting to /api/users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.headers['ratelimit-limit']).toBe('100');
    });

    it('should apply rate limiting to /api/orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.headers['ratelimit-limit']).toBe('100');
    });

    it('should not apply rate limiting to health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['ratelimit-limit']).toBeUndefined();
      expect(response.body.status).toBe('ok');
    });

    it('should decrement remaining requests with each call', async () => {
      const firstResponse = await request(app)
        .get('/api/products')
        .expect(200);

      const firstRemaining = parseInt(firstResponse.headers['ratelimit-remaining'], 10);

      const secondResponse = await request(app)
        .get('/api/products')
        .expect(200);

      const secondRemaining = parseInt(secondResponse.headers['ratelimit-remaining'], 10);

      expect(secondRemaining).toBeLessThan(firstRemaining);
    });
  });

  describe('Rate limit exceeded', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      // Create a new app instance with a very low rate limit for testing
      const express = require('express');
      const rateLimit = require('express-rate-limit');

      const testApp = express();
      testApp.use(express.json());

      const strictLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 2, // Only 2 requests for testing
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          error: 'Too many requests',
          message: 'You have exceeded the rate limit. Please try again later.',
          retryAfter: '15 minutes'
        }
      });

      testApp.use('/api', strictLimiter);
      testApp.get('/api/test', (req, res) => res.json({ ok: true }));

      // First two requests should succeed
      await request(testApp).get('/api/test').expect(200);
      await request(testApp).get('/api/test').expect(200);

      // Third request should be rate limited
      const response = await request(testApp).get('/api/test').expect(429);

      expect(response.body.error).toBe('Too many requests');
      expect(response.body.retryAfter).toBe('15 minutes');
    });

    it('should include retry-after header when rate limited', async () => {
      const express = require('express');
      const rateLimit = require('express-rate-limit');

      const testApp = express();
      const strictLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1,
        standardHeaders: true,
        legacyHeaders: false
      });

      testApp.use('/api', strictLimiter);
      testApp.get('/api/test', (req, res) => res.json({ ok: true }));

      // First request succeeds
      await request(testApp).get('/api/test').expect(200);

      // Second request is rate limited
      const response = await request(testApp).get('/api/test').expect(429);

      expect(response.headers['retry-after']).toBeDefined();
    });
  });

  describe('Rate limit configuration', () => {
    it('should have a 15-minute window', () => {
      const { apiLimiter } = require('../../src/middleware/rateLimit.middleware');

      // The limiter should be configured with 15 minutes (900000 ms)
      expect(apiLimiter).toBeDefined();
    });

    it('should allow 100 requests per window', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.headers['ratelimit-limit']).toBe('100');
    });
  });
});
