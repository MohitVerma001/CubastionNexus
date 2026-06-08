const { body } = require('express-validator');

const PASSWORD_STRENGTH = [
  body('newPassword')
    .isLength({ min: 10 })
    .withMessage('Password must be at least 10 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?])/)
    .withMessage('Password must contain uppercase, lowercase, a number, and a special character'),
  // confirmPassword is optional — validated client-side before the request is sent
  body('confirmPassword')
    .optional()
    .custom((val, { req }) => val === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token required'),
  ...PASSWORD_STRENGTH,
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  ...PASSWORD_STRENGTH,
];

module.exports = { loginValidation, forgotPasswordValidation, resetPasswordValidation, changePasswordValidation };
