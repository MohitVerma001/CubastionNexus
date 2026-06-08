const { PAGINATION } = require('../config/constants');

/**
 * Extract page / limit / offset from an Express query object.
 * Defaults: page 1, limit 25. Max limit: 100.
 */
const getPagination = (query = {}) => {
  const page  = Math.max(1, parseInt(query.page,  10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Wrap a data array with pagination metadata.
 */
const formatPaginatedResponse = (data, total, page, limit) => ({
  data,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

// Backward-compatible aliases used by existing service files.
const paginate           = getPagination;
const paginatedResponse  = (data, total, page, limit) => ({
  data,
  pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
});

module.exports = { getPagination, formatPaginatedResponse, paginate, paginatedResponse };
