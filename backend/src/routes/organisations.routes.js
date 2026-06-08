const router = require('express').Router();
const { getOrganisations, createOrganisation, updateOrganisation } = require('../controllers/organisations.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole }  = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/',      getOrganisations);
router.post('/',     requireRole('admin'), createOrganisation);
router.patch('/:id', requireRole('admin'), updateOrganisation);

module.exports = router;
