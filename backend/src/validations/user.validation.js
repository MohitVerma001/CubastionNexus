const { body } = require('express-validator');
const { USER_ROLE } = require('../config/constants');

const createUserValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('name').trim().notEmpty().isLength({ max: 255 }).withMessage('Name required'),
  body('role').isIn(Object.values(USER_ROLE)).withMessage('Invalid role'),
  body('organisation_id')
    .if(body('role').equals('customer'))
    .notEmpty().withMessage('organisation_id is required for customer role')
    .isUUID().withMessage('organisation_id must be a valid UUID'),
  body('department_id').optional({ nullable: true }).isUUID().withMessage('department_id must be a valid UUID'),
];

const updateUserValidation = [
  body('name').optional().trim().notEmpty().isLength({ max: 255 }),
  body('role').optional().isIn(Object.values(USER_ROLE)).withMessage('Invalid role'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('department_id').optional({ nullable: true }).isUUID().withMessage('department_id must be a valid UUID'),
];

module.exports = { createUserValidation, updateUserValidation };
