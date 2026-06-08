/**
 * @fileoverview Centralized error-handling middleware for the Foodey Express server.
 * Must be registered LAST (after all routes) with four parameters.
 */

/**
 * Global Express error handler.
 * Catches any error thrown or passed via next(err) and returns a clean JSON response.
 *
 * @param {Error & { status?: number; statusCode?: number }} err
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? err.statusCode ?? 500;
  const message = status < 500 ? err.message : 'Internal server error';

  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
