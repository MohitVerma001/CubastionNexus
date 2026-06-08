const { validationResult } = require('express-validator');
const usersService = require('../services/users.service');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ success: false, errors: errors.array() }); return false; }
  return true;
};

const getUser = async (req, res, next) => {
  try {
    const user = await usersService.getUser(req.params.id, req.tenantId);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

const getUsers = async (req, res, next) => {
  try {
    const data = await usersService.getUsers(req.query, req.tenantId);
    res.json({ success: true, ...data });
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const user = await usersService.createUser(req.body, req.user.id, req.tenantId);
    res.status(201).json({ success: true, user });
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const user = await usersService.updateUser(req.params.id, req.body, req.tenantId, req.user.id);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

const deactivateUser = async (req, res, next) => {
  try {
    await usersService.deactivateUser(req.params.id, req.tenantId, req.user.id);
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) { next(err); }
};

const resetUserPassword = async (req, res, next) => {
  try {
    await usersService.resetUserPassword(req.params.id, req.tenantId);
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) { next(err); }
};

module.exports = { getUser, getUsers, createUser, updateUser, deactivateUser, resetUserPassword };
