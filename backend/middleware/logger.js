/**
 * @fileoverview HTTP request logger middleware using Morgan.
 * Uses "dev" format in development and "combined" (Apache-style) in production.
 */

import morgan from 'morgan';

const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

/**
 * Pre-configured Morgan request-logging middleware.
 * @type {import('express').RequestHandler}
 */
export const logger = morgan(format);
