const router = require('express').Router();
const { getSLAConfigs, updateSLAConfig } = require('../controllers/sla.controller');
const { authenticate }  = require('../middleware/auth.middleware');
const { requireRole }   = require('../middleware/role.middleware');
const { enforceTenant } = require('../middleware/tenant.middleware');

router.use(authenticate, enforceTenant);

router.get('/',      getSLAConfigs);
router.patch('/:id', requireRole('admin'), updateSLAConfig);

module.exports = router;
