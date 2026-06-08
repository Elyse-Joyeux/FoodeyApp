/**
 * @fileoverview Rate-limiting middleware using express-rate-limit.
 * Protects the API from abuse and brute-force requests.
 */

import { rateLimit } from 'express-rate-limit';

/**
 * General API rate limiter — 100 requests per minute per IP.
 * @type {import('express').RequestHandler}
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again in a minute.' },
});

/**
 * Strict limiter for write operations — 30 requests per minute per IP.
 * Apply to POST / PATCH / DELETE routes.
 * @type {import('express').RequestHandler}
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many write requests — please slow down.' },
});
