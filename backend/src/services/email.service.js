const sgMail = require('@sendgrid/mail');
const logger  = require('../utils/logger');
const config  = require('../config/env');

if (config.sendgrid.apiKey) sgMail.setApiKey(config.sendgrid.apiKey);

const FROM    = config.sendgrid.from     || 'noreply@cubastion.com';
const APP_URL = config.server.frontendUrl || 'http://localhost:5173';

const sendEmail = async (to, subject, html) => {
  if (!config.sendgrid.apiKey) {
    logger.info('Email skipped (no SENDGRID_API_KEY)', { to, subject });
    return;
  }
  try {
    await sgMail.send({ to, from: FROM, subject, html });
    logger.info('Email sent', { to, subject });
  } catch (err) {
    logger.error('Email send failed', { to, subject, error: err.message });
  }
};

const sendPasswordReset = (email, name, token) =>
  sendEmail(
    email,
    'Reset Your Password — Cubastion Nexus',
    `<p>Hi ${name},</p>
     <p>Click the link below to reset your password. It expires in 1 hour.</p>
     <p><a href="${APP_URL}/reset-password?token=${token}">${APP_URL}/reset-password?token=${token}</a></p>
     <p>If you did not request this, please ignore this email.</p>`
  );

const sendWelcomeEmail = (email, name, tempPassword) =>
  sendEmail(
    email,
    'Welcome to Cubastion Nexus — Your Account Details',
    `<div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #01516A;">Welcome to Cubastion Nexus</h2>
      <p>Hi ${name},</p>
      <p>Your support portal account has been created.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong>
        <code style="background:#f5f5f5;padding:4px 8px;border-radius:4px;">${tempPassword}</code>
      </p>
      <p style="color:#C81E1E;">
        ⚠️ You must change this password on your first login.
      </p>
      <p>
        <a href="${APP_URL}/login"
          style="background:#01516A;color:white;padding:10px 20px;
          border-radius:6px;text-decoration:none;display:inline-block;">
          Login to Portal
        </a>
      </p>
      <p style="color:#999;font-size:12px;">
        If you did not expect this email, please contact your administrator.
      </p>
    </div>`
  );

const sendTicketStatusChange = (email, name, ticket) =>
  sendEmail(
    email,
    `[${ticket.ticket_number}] Status Updated`,
    `<p>Hi ${name},</p>
     <p>Ticket <strong>${ticket.ticket_number}: ${ticket.subject}</strong> is now <strong>${ticket.status}</strong>.</p>
     <p><a href="${APP_URL}/tickets/${ticket.id}">View ticket</a></p>`
  );

const sendTicketAssignment = (email, name, ticket) =>
  sendEmail(
    email,
    `Ticket Assigned: ${ticket.ticket_number}`,
    `<p>Hi ${name},</p>
     <p>Ticket <strong>${ticket.ticket_number}: ${ticket.subject}</strong> has been assigned to you.</p>
     <p><a href="${APP_URL}/tickets/${ticket.id}">View ticket</a></p>`
  );

module.exports = { sendEmail, sendPasswordReset, sendWelcomeEmail, sendTicketStatusChange, sendTicketAssignment };
