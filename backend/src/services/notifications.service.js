const { query }     = require('../config/database');
const { sendEmail } = require('./email.service');
const logger        = require('../utils/logger');
const config        = require('../config/env');

const APP_URL = config.server.frontendUrl;

const recordNotification = async (ticketId, recipientId, type) => {
  try {
    await query(
      `INSERT INTO notifications (ticket_id, recipient_id, type, channel, sent_at, status)
       VALUES ($1, $2, $3, 'email', now(), 'sent')`,
      [ticketId, recipientId, type]
    );
  } catch (err) {
    logger.error('Failed to record notification', { error: err.message });
  }
};

const PRIORITY_JA      = { P1: '緊急', P2: '高', P3: '通常' };
const RESPONSE_TIME_JA = { P1: '4営業時間以内', P2: '1営業日以内', P3: '2営業日以内' };

const onTicketCreated = async (ticket) => {
  try {
    const [customerRes, orgRes, agentsRes] = await Promise.all([
      query('SELECT email, name FROM users WHERE id = $1', [ticket.submitted_by_id]),
      query('SELECT name FROM organisations WHERE id = $1', [ticket.organisation_id]),
      query(`SELECT id, email, name FROM users WHERE role IN ('agent','admin') AND is_active = true`),
    ]);

    if (!customerRes.rows.length) return;
    const { email: customerEmail, name: customerName } = customerRes.rows[0];
    const orgName        = orgRes.rows[0]?.name || 'Unknown';
    const priorityJa     = PRIORITY_JA[ticket.priority]      || ticket.priority;
    const responseTimeJa = RESPONSE_TIME_JA[ticket.priority]  || '2営業日以内';

    // Japanese email to customer
    await sendEmail(
      customerEmail,
      `[${ticket.ticket_number}] チケットを受け付けました`,
      `<p>${customerName} 様、</p>
       <p>お問い合わせを受け付けました。</p>
       <p><strong>チケット番号：</strong>${ticket.ticket_number}<br>
          <strong>件名：</strong>${ticket.subject}<br>
          <strong>優先度：</strong>${priorityJa}<br>
          <strong>対応予定時間：</strong>${responseTimeJa}</p>
       <p><a href="${APP_URL}/customer/tickets/${ticket.id}">チケットを確認する</a></p>
       <p>引き続きよろしくお願いいたします。</p>`
    );
    await recordNotification(ticket.id, ticket.submitted_by_id, 'ticket_created');

    // English email + notification record for each active agent/admin
    for (const agent of agentsRes.rows) {
      await sendEmail(
        agent.email,
        `[NEW] ${ticket.ticket_number}: ${ticket.subject} - ${orgName}`,
        `<p>Hi ${agent.name},</p>
         <p>A new support ticket has been submitted and requires attention.</p>
         <p><strong>Organisation:</strong> ${orgName}<br>
            <strong>Ticket:</strong> ${ticket.ticket_number}<br>
            <strong>Subject:</strong> ${ticket.subject}<br>
            <strong>Priority:</strong> ${ticket.priority}<br>
            <strong>Submitted by:</strong> ${customerName}</p>
         <p><a href="${APP_URL}/agent/tickets/${ticket.id}">View ticket</a></p>`
      );
      await recordNotification(ticket.id, agent.id, 'new_ticket');
    }
  } catch (err) {
    logger.error('onTicketCreated notification failed', { error: err.message });
  }
};

const onAgentReply = async (ticket, recipientId) => {
  try {
    const res = await query('SELECT email, name FROM users WHERE id = $1', [recipientId]);
    if (!res.rows.length) return;
    const { email, name } = res.rows[0];
    await sendEmail(
      email,
      `[${ticket.ticket_number}] New reply on your ticket`,
      `<p>Hi ${name},</p>
       <p>A new reply has been added to your ticket <strong>${ticket.ticket_number}: ${ticket.subject}</strong>.</p>
       <p><a href="${APP_URL}/customer/tickets/${ticket.id}">View ticket</a></p>`
    );
    await recordNotification(ticket.id, recipientId, 'agent_reply');
  } catch (err) {
    logger.error('onAgentReply notification failed', { error: err.message });
  }
};

const onTicketAssigned = async (ticket, agentId) => {
  try {
    const res = await query('SELECT email, name FROM users WHERE id = $1', [agentId]);
    if (!res.rows.length) return;
    const { email, name } = res.rows[0];
    await sendEmail(
      email,
      `Ticket Assigned to You: ${ticket.ticket_number}`,
      `<p>Hi ${name},</p>
       <p>Ticket <strong>${ticket.ticket_number}: ${ticket.subject}</strong> has been assigned to you.</p>
       <p><a href="${APP_URL}/agent/tickets/${ticket.id}">View ticket</a></p>`
    );
    await recordNotification(ticket.id, agentId, 'ticket_assigned');
  } catch (err) {
    logger.error('onTicketAssigned notification failed', { error: err.message });
  }
};

const onTicketEscalated = async (ticket) => {
  try {
    const recipientId = ticket.assigned_to_id;
    if (!recipientId) return;
    const res = await query('SELECT email, name FROM users WHERE id = $1', [recipientId]);
    if (!res.rows.length) return;
    const { email, name } = res.rows[0];
    await sendEmail(
      email,
      `[ESCALATED] ${ticket.ticket_number}: ${ticket.subject}`,
      `<p>Hi ${name},</p>
       <p>Ticket <strong>${ticket.ticket_number}: ${ticket.subject}</strong> has been escalated and requires immediate attention.</p>
       <p><a href="${APP_URL}/agent/tickets/${ticket.id}">View ticket</a></p>`
    );
    await recordNotification(ticket.id, recipientId, 'ticket_escalated');
  } catch (err) {
    logger.error('onTicketEscalated notification failed', { error: err.message });
  }
};

const onTicketClosed = async (ticket) => {
  try {
    const res = await query('SELECT email, name FROM users WHERE id = $1', [ticket.submitted_by_id]);
    if (!res.rows.length) return;
    const { email, name } = res.rows[0];
    await sendEmail(
      email,
      `[${ticket.ticket_number}] Your ticket has been closed`,
      `<p>Hi ${name},</p>
       <p>Your ticket <strong>${ticket.ticket_number}: ${ticket.subject}</strong> has been closed.</p>
       <p>If you have further questions, please open a new ticket.</p>
       <p><a href="${APP_URL}/customer/tickets/${ticket.id}">View ticket</a></p>`
    );
    await recordNotification(ticket.id, ticket.submitted_by_id, 'ticket_closed');
  } catch (err) {
    logger.error('onTicketClosed notification failed', { error: err.message });
  }
};

const onStatusChanged = async (ticket, oldStatus, newStatus, changedById) => {
  try {
    if (newStatus === 'closed') {
      await onTicketClosed(ticket);
      return;
    }

    const customerRes = await query('SELECT email, name FROM users WHERE id = $1', [ticket.submitted_by_id]);
    if (!customerRes.rows.length) return;
    const { email, name } = customerRes.rows[0];

    if (newStatus === 'pending_customer') {
      await sendEmail(
        email,
        `[${ticket.ticket_number}] Action Required - Awaiting Your Response`,
        `<p>${name} 様、</p>
         <p>チケット <strong>${ticket.ticket_number}: ${ticket.subject}</strong> への対応のため、お客様のご返答をお待ちしております。</p>
         <p>ご確認のうえ、チケット画面よりご返信ください。</p>
         <p><a href="${APP_URL}/customer/tickets/${ticket.id}">チケットを確認する</a></p>`
      );
    } else if (newStatus === 'in_progress') {
      await sendEmail(
        email,
        `[${ticket.ticket_number}] Your ticket is being worked on`,
        `<p>Hi ${name},</p>
         <p>Your ticket <strong>${ticket.ticket_number}: ${ticket.subject}</strong> is now being worked on by our support team.</p>
         <p><a href="${APP_URL}/customer/tickets/${ticket.id}">View ticket</a></p>`
      );
    }

    await recordNotification(ticket.id, ticket.submitted_by_id, 'status_changed');
  } catch (err) {
    logger.error('onStatusChanged notification failed', { error: err.message });
  }
};

const onPriorityChanged = async (ticket, oldPriority, newPriority, changedById) => {
  try {
    if (newPriority === 'P1') {
      await onTicketEscalated(ticket);
      return;
    }

    const assigneeId = ticket.assigned_to_id;
    if (!assigneeId) return;

    const agentRes = await query('SELECT email, name FROM users WHERE id = $1', [assigneeId]);
    if (!agentRes.rows.length) return;
    const { email, name } = agentRes.rows[0];

    await sendEmail(
      email,
      `[${ticket.ticket_number}] Priority Changed: ${oldPriority} → ${newPriority}`,
      `<p>Hi ${name},</p>
       <p>The priority of ticket <strong>${ticket.ticket_number}: ${ticket.subject}</strong> has been changed from <strong>${oldPriority}</strong> to <strong>${newPriority}</strong>.</p>
       <p><a href="${APP_URL}/agent/tickets/${ticket.id}">View ticket</a></p>`
    );
    await recordNotification(ticket.id, assigneeId, 'priority_changed');
  } catch (err) {
    logger.error('onPriorityChanged notification failed', { error: err.message });
  }
};

module.exports = {
  onTicketCreated,
  onAgentReply,
  onTicketAssigned,
  onTicketEscalated,
  onTicketClosed,
  onStatusChanged,
  onPriorityChanged,
};
