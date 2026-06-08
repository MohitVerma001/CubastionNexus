const router = require('express').Router();
const { authenticate }   = require('../middleware/auth.middleware');
const { requireRole }    = require('../middleware/role.middleware');
const { getDepartments, createDepartment, updateDepartment } = require('../controllers/departments.controller');

router.get('/',     authenticate, requireRole('agent', 'admin'), getDepartments);
router.post('/',    authenticate, requireRole('admin'),          createDepartment);
router.patch('/:id', authenticate, requireRole('admin'),         updateDepartment);

module.exports = router;
