const { body } = require('express-validator');
const { TICKET_PRIORITY, TICKET_CATEGORY, TICKET_STATUS } = require('../config/constants');

const PRIORITIES = Object.values(TICKET_PRIORITY);
const CATEGORIES = Object.values(TICKET_CATEGORY);
const STATUSES   = Object.values(TICKET_STATUS);

const createTicketValidation = [
  body('subject')
    .trim().notEmpty().withMessage('Subject is required')
    .isLength({ min: 3, max: 120 }).withMessage('Subject must be 3–120 characters'),
  body('description')
    .trim().notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10–2000 characters'),
  body('priority')
    .notEmpty().withMessage('Priority is required')
    .isIn(PRIORITIES).withMessage('Invalid priority'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(CATEGORIES).withMessage('Invalid category'),
];

const updateTicketValidation = [
  body('subject').optional().trim().isLength({ min: 3, max: 120 }),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }),
  body('priority').optional().isIn(PRIORITIES),
  body('category').optional().isIn(CATEGORIES),
  body('status').optional().isIn(STATUSES),
  body('assigned_to_id')
    .optional({ nullable: true })
    .isUUID().withMessage('assigned_to_id must be a valid UUID'),
];

module.exports = { createTicketValidation, updateTicketValidation };
