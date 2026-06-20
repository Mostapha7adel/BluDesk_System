const prisma = require('../config/database');
const logger = require('../utils/logger');

const auditLog = (action) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      if (res.statusCode < 400 && req.user) {
        prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            entity: req.baseUrl.split('/').pop() || req.path.split('/')[1],
            entityId: req.params.id ? parseInt(req.params.id) : null,
            metadata: {
              method: req.method,
              path: req.originalUrl,
              body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          },
        }).catch((err) => logger.error('Audit log error:', err));
      }
      return originalJson(body);
    };

    next();
  };
};

const SENSITIVE_FIELDS = new Set([
  'password', 'pass', 'passwd', 'confirmPassword', 'confirm_password', 'passwordConfirmation', 'password_confirmation',
  'currentPassword', 'current_password', 'newPassword', 'new_password',
  'token', 'refreshToken', 'refresh_token', 'accessToken', 'access_token',
  'secret', 'apiKey', 'api_key', 'apikey', 'secretKey', 'secret_key',
  'email', 'phone', 'nationalId', 'employeeNumber',
]);

const sanitizeBody = (body) => {
  if (!body) return {};
  if (typeof body !== 'object') return {};
  const sanitized = Array.isArray(body) ? [] : {};
  for (const [key, value] of Object.entries(body)) {
    if (SENSITIVE_FIELDS.has(key)) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeBody(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

module.exports = auditLog;
