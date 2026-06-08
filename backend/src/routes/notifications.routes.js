const router = require('express').Router();
const { authenticate }          = require('../middleware/auth.middleware');
const notificationsController   = require('../controllers/notifications.controller');

router.use(authenticate);

router.get('/',             notificationsController.getNotifications);
router.patch('/read-all',   notificationsController.markAllRead);
router.get('/unread-count', notificationsController.getUnreadCount);

module.exports = router;
