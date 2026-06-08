const { USER_ROLE } = require('../config/constants');

/**
 * enforceTenant
 *
 * Sets req.tenantId to scope database queries by organisation.
 *
 * ┌──────────┬────────────────────────────────────────────────────────────┐
 * │ Role     │ Behaviour                                                  │
 * ├──────────┼────────────────────────────────────────────────────────────┤
 * │ customer │ req.tenantId = user's organisation_id (enforced, hard)     │
 * │          │ 403 if user has no organisation_id                         │
 * ├──────────┼────────────────────────────────────────────────────────────┤
 * │ agent    │ req.tenantId = null (may see all organisations)            │
 * │ admin    │ Optionally pass ?organisation_id= query param to filter    │
 * └──────────┴────────────────────────────────────────────────────────────┘
 *
 * Every service that queries the DB must honour req.tenantId:
 *   if (req.tenantId) → add WHERE organisation_id = req.tenantId
 *   else              → no organisation filter (or use query param)
 */
const enforceTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { role, organisation_id } = req.user;

  if (role === USER_ROLE.CUSTOMER) {
    if (!organisation_id) {
      return res.status(403).json({
        success: false,
        message:  'Your account is not associated with an organisation. Please contact support.',
      });
    }
    // Hard-pin the tenant — customer cannot override this with query params
    req.tenantId = organisation_id;
  } else {
    // agent / admin: not restricted to a single org
    req.tenantId = null;
  }

  next();
};

module.exports = { enforceTenant };
