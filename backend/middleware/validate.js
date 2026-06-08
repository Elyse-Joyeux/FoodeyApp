/**
 * @fileoverview Lightweight input-validation helpers.
 * Returns a 400 Bad Request with a descriptive message when validation fails.
 * No external schema library needed — keeps the backend lean and JS-native.
 */

/**
 * Assert that required fields are present in req.body.
 * Responds 400 and returns false if any field is missing.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string[]} fields - Field names that must exist and be non-empty
 * @returns {boolean} true if all fields are present, false if validation failed
 *
 * @example
 * app.post('/api/staff', (req, res) => {
 *   if (!requireFields(req, res, ['name', 'role', 'email'])) return;
 *   // safe to proceed
 * });
 */
export function requireFields(req, res, fields) {
  const missing = fields.filter(
    (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
  );
  if (missing.length > 0) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    return false;
  }
  return true;
}

/**
 * Validate that a value is one of the allowed enum values.
 * Responds 400 and returns false if the value is not allowed.
 *
 * @param {import('express').Response} res
 * @param {string} field - Field name (for the error message)
 * @param {unknown} value - The value to check
 * @param {string[]} allowed - Allowed values
 * @returns {boolean}
 *
 * @example
 * if (!isOneOf(res, 'status', req.body.status, ['Ready', 'In Process', 'Completed'])) return;
 */
export function isOneOf(res, field, value, allowed) {
  if (!allowed.includes(value)) {
    res.status(400).json({
      error: `Invalid value for '${field}'. Must be one of: ${allowed.join(', ')}`,
    });
    return false;
  }
  return true;
}

/**
 * Sanitize a string field — trims whitespace and removes HTML tags.
 *
 * @param {string} value
 * @returns {string}
 */
export function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/<[^>]*>/g, '');
}

/**
 * Sanitize all string fields in a plain object in-place.
 * Non-string values are left unchanged.
 *
 * @param {Record<string, unknown>} obj
 * @returns {Record<string, unknown>} same object with strings sanitized
 */
export function sanitizeBody(obj) {
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    }
  }
  return obj;
}
