const validator = require('validator');
const xss = require('xss');

/**
 * Input Sanitization Middleware
 * 
 * Comprehensive input sanitization for all payment endpoints to prevent:
 * - SQL injection attacks
 * - XSS (Cross-Site Scripting) attacks
 * - NoSQL injection attacks
 * - Command injection
 * - Path traversal
 * 
 * Requirements: 5.7, 18.9
 */

/**
 * Sanitize a single string value
 * - Trims whitespace
 * - Escapes HTML entities
 * - Removes dangerous characters
 * 
 * @param {string} value - The string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
const sanitizeString = (value, options = {}) => {
  if (typeof value !== 'string') {
    return value;
  }

  let sanitized = value;

  // Trim whitespace
  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }

  // Escape HTML to prevent XSS
  if (options.escapeHtml !== false) {
    sanitized = xss(sanitized, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    });
  }

  // Remove SQL injection patterns
  if (options.preventSqlInjection !== false) {
    // Remove common SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
      /(--|\;|\/\*|\*\/|xp_|sp_)/gi,
    ];

    // Check for SQL injection patterns
    for (const pattern of sqlPatterns) {
      if (pattern.test(sanitized)) {
        throw new Error('Invalid input: potential SQL injection detected');
      }
    }
  }

  // Prevent NoSQL injection
  if (options.preventNoSqlInjection !== false) {
    // Remove MongoDB operators
    sanitized = sanitized.replace(/\$\w+/g, '');
  }

  // Prevent path traversal
  if (options.preventPathTraversal !== false) {
    sanitized = sanitized.replace(/\.\./g, '');
  }

  return sanitized;
};

/**
 * Recursively sanitize an object
 * 
 * @param {*} obj - The object to sanitize
 * @param {Object} options - Sanitization options
 * @returns {*} Sanitized object
 */
const sanitizeObject = (obj, options = {}) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj, options);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitize the key
        const sanitizedKey = sanitizeString(key, options);
        // Sanitize the value
        sanitized[sanitizedKey] = sanitizeObject(obj[key], options);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Express middleware for input sanitization
 * 
 * @param {Object} options - Sanitization options
 * @returns {Function} Express middleware function
 */
const sanitizeInput = (options = {}) => {
  return (req, res, next) => {
    try {
      // Sanitize request body
      if (req.body) {
        req.body = sanitizeObject(req.body, options);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = sanitizeObject(req.query, options);
      }

      // Sanitize URL parameters
      if (req.params) {
        req.params = sanitizeObject(req.params, options);
      }

      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Invalid input detected',
      });
    }
  };
};

/**
 * Validate email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate phone number format
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
const isValidPhone = (phone) => {
  return validator.isMobilePhone(phone, 'any');
};

/**
 * Validate amount format
 * 
 * @param {*} amount - Amount to validate
 * @returns {boolean} True if valid amount
 */
const isValidAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num > 0 && num < 10000000; // Max 10 million
};

module.exports = {
  sanitizeInput,
  sanitizeString,
  sanitizeObject,
  isValidEmail,
  isValidPhone,
  isValidAmount,
};
