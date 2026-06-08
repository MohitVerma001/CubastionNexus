const router = require('express').Router();
const {
  getTickets, getTicket, createTicket, updateTicket, escalateTicket, closeTicket, reopenTicket, bulkUpdate,
} = require('../controllers/tickets.controller');
const { getComments, addComment }                    = require('../controllers/comments.controller');
const { getAttachments, uploadAttachment, downloadAttachment } = require('../controllers/attachments.controller');
const { authenticate }  = require('../middleware/auth.middleware');
const { requireRole }   = require('../middleware/role.middleware');
const { enforceTenant } = require('../middleware/tenant.middleware');
const { uploadSingle }  = require('../middleware/upload.middleware');
const { createTicketValidation, updateTicketValidation } = require('../validations/ticket.validation');
const { createCommentValidation } = require('../validations/comment.validation');

router.use(authenticate, enforceTenant);

// Test route — must be before /:id to avoid param capture
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Tickets router is working', user: req.user.email, role: req.user.role });
});

// Ticket CRUD
router.get('/',     getTickets);
router.post('/',    createTicketValidation, createTicket);
router.post('/bulk', requireRole('agent', 'admin'), bulkUpdate);
router.get('/:id',  getTicket);
router.patch('/:id', requireRole('agent', 'admin'), updateTicketValidation, updateTicket);

// Ticket actions
router.post('/:id/escalate', escalateTicket);
router.post('/:id/close',    requireRole('agent', 'admin'), closeTicket);
router.post('/:id/reopen',   reopenTicket);

// Comments (nested)
router.get('/:ticketId/comments',  getComments);
router.post('/:ticketId/comments', createCommentValidation, addComment);

// Attachments (nested)
router.get('/:ticketId/attachments',                        getAttachments);
router.post('/:ticketId/attachments',                       uploadSingle, uploadAttachment);
router.get('/:ticketId/attachments/:attachmentId/download', downloadAttachment);

module.exports = router;
