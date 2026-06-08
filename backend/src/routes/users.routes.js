const router = require('express').Router();
const {
  getUser, getUsers, createUser, updateUser, deactivateUser, resetUserPassword,
} = require('../controllers/users.controller');
const { authenticate }  = require('../middleware/auth.middleware');
const { requireRole }   = require('../middleware/role.middleware');
const { enforceTenant } = require('../middleware/tenant.middleware');
const { createUserValidation, updateUserValidation } = require('../validations/user.validation');

router.use(authenticate, enforceTenant);

// Read access: agents can fetch the agent list for assignment dropdowns
router.get('/',    requireRole('agent', 'admin'), getUsers);
router.get('/:id', requireRole('agent', 'admin'), getUser);

// Write access: admins only
router.post('/',                   requireRole('admin'), createUserValidation, createUser);
router.patch('/:id',               requireRole('admin'), updateUserValidation, updateUser);
router.delete('/:id',              requireRole('admin'), deactivateUser);
router.post('/:id/reset-password', requireRole('admin'), resetUserPassword);

module.exports = router;
