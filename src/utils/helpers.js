const crypto = require('crypto');

const generateRandomPassword = (length = 12) => {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, refreshToken, resetToken, resetTokenExp, ...sanitized } = user;
  return sanitized;
};

const buildPagination = (page = 1, limit = 10, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'name', 'amount', 'date', 'id', 'status', 'salary', 'month', 'year', 'startDate', 'deliveryDate', 'email', 'employeeNumber', 'progress'];

const parseSort = (query, defaultField = 'createdAt', defaultOrder = 'desc') => {
  let field = query.sortBy || defaultField;
  const order = query.sortOrder === 'asc' ? 'asc' : 'desc';
  if (!ALLOWED_SORT_FIELDS.includes(field)) field = defaultField;
  return { [field]: order };
};

const parseFilters = (query, allowFields) => {
  const filters = {};
  for (const field of allowFields) {
    if (query[field] !== undefined && query[field] !== '') {
      filters[field] = query[field];
    }
  }
  return filters;
};

module.exports = {
  generateRandomPassword,
  sanitizeUser,
  buildPagination,
  parsePagination,
  parseSort,
  parseFilters,
};
