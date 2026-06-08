const router = require('express').Router();
const authRoutes          = require('./auth.routes');
const ticketRoutes        = require('./tickets.routes');
const userRoutes          = require('./users.routes');
const orgRoutes           = require('./organisations.routes');
const slaRoutes           = require('./sla.routes');
const adminRoutes         = require('./admin.routes');
const webhookRoutes       = require('./webhook.routes');
const notificationsRoutes  = require('./notifications.routes');
const departmentsRoutes    = require('./departments.routes');

const { authenticate }  = require('../middleware/auth.middleware');
const { requireRole }   = require('../middleware/role.middleware');
const { enforceTenant } = require('../middleware/tenant.middleware');
const { apiLimiter }    = require('../middleware/rateLimiter.middleware');
const { getAuditLogsController, getEmailTemplates, updateEmailTemplate } = require('../controllers/admin.controller');

// routes/index.js owns the /api/v1 prefix

// Unauthenticated webhook routes — no rate limiter
router.use('/api/v1/webhooks', webhookRoutes);

// Rate limiter applied to all routes below this point
router.use(apiLimiter);

router.use('/api/v1/auth',          authRoutes);
router.use('/api/v1/tickets',       ticketRoutes);
router.use('/api/v1/users',         userRoutes);
router.use('/api/v1/organisations', orgRoutes);
router.use('/api/v1/sla-configs',    slaRoutes);
router.use('/api/v1/admin',          adminRoutes);
router.use('/api/v1/notifications',  notificationsRoutes);
router.use('/api/v1/departments',    departmentsRoutes);

// Top-level endpoints called at /api/v1/... by the frontend service layer
router.get('/api/v1/audit-logs',            authenticate, requireRole('admin'), enforceTenant, getAuditLogsController);
router.get('/api/v1/email-templates',       authenticate, requireRole('admin'), enforceTenant, getEmailTemplates);
router.patch('/api/v1/email-templates/:id', authenticate, requireRole('admin'), enforceTenant, updateEmailTemplate);

module.exports = router;
