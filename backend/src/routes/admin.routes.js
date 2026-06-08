const router = require('express').Router();
const { getStats } = require('../controllers/admin.controller');
const { authenticate }  = require('../middleware/auth.middleware');
const { requireRole }   = require('../middleware/role.middleware');
const { enforceTenant } = require('../middleware/tenant.middleware');

router.use(authenticate, requireRole('admin'), enforceTenant);

router.get('/stats', getStats);

module.exports = router;
