const router = require('express').Router();
const {
  login, logout, refreshToken, forgotPassword, resetPassword, changePassword, getMe,
} = require('../controllers/auth.controller');
const { authenticate }  = require('../middleware/auth.middleware');
const { authLimiter, strictLimiter } = require('../middleware/rateLimiter.middleware');
const {
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} = require('../validations/auth.validation');

router.post('/login',           authLimiter,   loginValidation,          login);
router.post('/logout',          authenticate,                            logout);
router.post('/refresh',                                                  refreshToken);
router.post('/forgot-password', strictLimiter, forgotPasswordValidation, forgotPassword);
router.post('/reset-password',  strictLimiter, resetPasswordValidation,  resetPassword);
router.post('/change-password', authenticate,  changePasswordValidation, changePassword);
router.get('/me',               authenticate,                            getMe);

module.exports = router;
