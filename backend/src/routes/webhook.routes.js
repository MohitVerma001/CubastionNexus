const router = require('express').Router();
const multer = require('multer');
const { handleInboundEmail } = require('../controllers/webhook.controller');

// Memory storage — no files saved to disk for webhook payloads
const upload = multer({ storage: multer.memoryStorage() });

// No authentication or rate limiting on this route
// SendGrid Inbound Parse posts multipart/form-data
router.post('/email-inbound', upload.any(), handleInboundEmail);

// Local simulation endpoint — test email ingestion without SendGrid
// POST { from_email, subject, text }
const simulateInbound = async (req, res) => {
  const { from_email, subject, text } = req.body;
  req.body = {
    from:    from_email,
    to:      'mohit.verma@cubastion.com',
    subject: subject || 'Test ticket from simulation',
    text:    text    || 'This is a simulated ticket from email ingestion test.',
    html:    '',
  };
  return handleInboundEmail(req, res);
};

router.post('/email-inbound/simulate', simulateInbound);

module.exports = router;
