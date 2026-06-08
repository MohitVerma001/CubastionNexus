const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const config      = require('../config/env');

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   config.cookie.secure,
  sameSite: config.cookie.sameSite,
};

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ success: false, errors: errors.array() }); return false; }
  return true;
};

const login = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const data = await authService.login(req.body.email, req.body.password);

    res.cookie('access_token',  data.token,        { ...COOKIE_OPTS, maxAge: 60 * 60 * 1000 });
    res.cookie('refresh_token', data.refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ success: true, user: data.user, mustChangePassword: data.mustChangePassword });
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies.refresh_token;
    await authService.logout(req.user.id, rawRefreshToken);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

const refreshToken = async (req, res, next) => {
  try {
    const raw  = req.cookies.refresh_token;
    const data = await authService.refreshToken(raw);

    res.cookie('access_token',  data.token,        { ...COOKIE_OPTS, maxAge: 60 * 60 * 1000 });
    res.cookie('refresh_token', data.refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ success: true, user: data.user });
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    await authService.forgotPassword(req.body.email);
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    res.json({ success: true, mustChangePassword: false, message: 'Password changed successfully' });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

module.exports = { login, logout, refreshToken, forgotPassword, resetPassword, changePassword, getMe };
