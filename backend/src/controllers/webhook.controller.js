const { query }          = require('../config/database');
const ticketsService     = require('../services/tickets.service');
const commentsService    = require('../services/comments.service');
const logger             = require('../utils/logger');

const parseEmail = (from) => {
  if (!from) return '';
  const match = from.match(/<([^>]+)>/);
  return match ? match[1].trim().toLowerCase() : from.trim().toLowerCase();
};

const handleInboundEmail = async (req, res) => {
  try {
    logger.info('Inbound email webhook received', {
      from:     req.body.from,
      to:       req.body.to,
      subject:  req.body.subject,
      bodyKeys: Object.keys(req.body),
      hasText:  !!req.body.text,
      hasHtml:  !!req.body.html,
    });

    const from    = req.body.from    || '';
    const subject = req.body.subject || '(No subject)';
    const text    = req.body.text    || req.body.html || '';

    const senderEmail = parseEmail(from);

    if (!senderEmail) {
      logger.warn('Inbound email: could not parse sender', { from });
      return res.status(200).json({ success: true });
    }

    const userRes = await query(
      `SELECT u.*, o.name AS org_name
       FROM users u
       LEFT JOIN organisations o ON o.id = u.organisation_id
       WHERE LOWER(u.email) = LOWER($1) AND u.is_active = true`,
      [senderEmail]
    );

    if (!userRes.rows.length) {
      logger.warn('Inbound email: unknown sender', { email: senderEmail });
      return res.status(200).json({ success: true });
    }

    const user = userRes.rows[0];

    // Strip Re:, Fwd:, fw: prefixes (multiple levels, case-insensitive)
    const cleanSubject = subject.replace(/^\s*(re:|fwd?:)\s*/gi, '').trim() || '(No subject)';

    // Check if this is a reply to an existing ticket
    const combined       = cleanSubject + ' ' + text;
    const ticketNumMatch = combined.match(/CUB-\d{5}/i);

    if (ticketNumMatch) {
      const ticketNumber = ticketNumMatch[0].toUpperCase();
      const ticketRes    = await query('SELECT * FROM tickets WHERE ticket_number = $1', [ticketNumber]);

      if (!ticketRes.rows.length) {
        logger.warn('Inbound email: referenced ticket not found', { ticketNumber });
        return res.status(200).json({ success: true });
      }

      const ticket = ticketRes.rows[0];

      if (ticket.status === 'closed') {
        // Allow reopen if closed within ~5 business days (7 calendar days)
        const fiveBizDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (ticket.closed_at && new Date(ticket.closed_at) > fiveBizDaysAgo) {
          await ticketsService.reopenTicket(ticket.id, user.organisation_id || null, user.id, user.role);
        } else {
          logger.info('Inbound email: ticket closed too long ago, ignoring', { ticketNumber });
          return res.status(200).json({ success: true });
        }
      }

      await commentsService.addComment(
        ticket.id,
        text.slice(0, 5000),
        false,
        user.organisation_id || null,
        user.id,
        user.role
      );

      logger.info('Inbound email: comment added to ticket', { ticketNumber, userId: user.id });
    } else {
      // New ticket via email
      const urgentPattern = /urgent|critical|down|緊急|障害/i;
      const priority      = urgentPattern.test(cleanSubject) ? 'P1' : 'P3';

      await ticketsService.createTicket(
        {
          subject:     cleanSubject.slice(0, 120),
          description: text.slice(0, 2000),
          category:    'other',
          priority,
          source:      'email',
        },
        user.organisation_id,
        user.id
      );

      logger.info('Inbound email: new ticket created', { subject: cleanSubject, userId: user.id });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    logger.error('Inbound email processing failed', { error: err.message });
    // Always respond 200 — SendGrid retries on non-200
    res.status(200).json({ success: true });
  }
};

module.exports = { handleInboundEmail };
