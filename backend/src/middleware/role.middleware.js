/**
 * requireRole(...roles)
 *
 * Factory that returns middleware enforcing one of the specified roles.
 *
 * Usage:
 *   router.delete('/:id', authenticate, requireRole('admin'), handler);
 *   router.patch('/:id',  authenticate, requireRole('agent', 'admin'), handler);
 */
const requireRole = (...roles) => (req, res, next) => {
  // authenticate must run before requireRole
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }

  next();
};

module.exports = { requireRole };
