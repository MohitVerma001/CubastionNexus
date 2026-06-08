const { body } = require('express-validator');

const createCommentValidation = [
  body('body').trim().isLength({ min: 1, max: 5000 }).withMessage('Comment body is required (max 5000 chars)'),
  body('is_internal').optional().isBoolean().withMessage('is_internal must be a boolean'),
];

module.exports = { createCommentValidation };
