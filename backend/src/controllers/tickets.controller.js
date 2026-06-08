const { validationResult } = require('express-validator');
const ticketsService = require('../services/tickets.service');
const { onStatusChanged, onPriorityChanged } = require('../services/notifications.service');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ success: false, errors: errors.array() }); return false; }
  return true;
};

const getTickets = async (req, res, next) => {
  try {
    const data = await ticketsService.getTickets(req.query, req.tenantId, req.user.id, req.user.role);
    res.json({
      success:    true,
      tickets:    data.tickets,
      total:      data.total,
      page:       data.page,
      limit:      data.limit,
      totalPages: data.totalPages,
    });
  } catch (err) { next(err); }
};

const getTicket = async (req, res, next) => {
  try {
    const ticket = await ticketsService.getTicket(req.params.id, req.tenantId, req.user.id, req.user.role);
    res.json({ success: true, ticket });
  } catch (err) { next(err); }
};

const createTicket = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const orgId = req.tenantId || req.body.organisation_id || req.user.organisation_id;
    if (!orgId) {
      return res.status(400).json({ success: false, message: 'Organisation is required to create a ticket' });
    }
    const ticket = await ticketsService.createTicket(req.body, orgId, req.user.id);
    res.status(201).json({ success: true, ticket });
  } catch (err) { next(err); }
};

const updateTicket = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { ticket, oldStatus, oldPriority } = await ticketsService.updateTicket(
      req.params.id, req.body, req.tenantId, req.user.id, req.user.role
    );

    if (req.body.status && req.body.status !== oldStatus) {
      onStatusChanged(ticket, oldStatus, req.body.status, req.user.id);
    }
    if (req.body.priority && req.body.priority !== oldPriority) {
      onPriorityChanged(ticket, oldPriority, req.body.priority, req.user.id);
    }

    res.json({ success: true, ticket });
  } catch (err) { next(err); }
};

const escalateTicket = async (req, res, next) => {
  try {
    const ticket = await ticketsService.escalateTicket(req.params.id, req.tenantId, req.user.id, req.user.role);
    res.json({ success: true, ticket });
  } catch (err) { next(err); }
};

const closeTicket = async (req, res, next) => {
  try {
    const ticket = await ticketsService.closeTicket(req.params.id, req.tenantId, req.user.id, req.user.role);
    res.json({ success: true, ticket });
  } catch (err) { next(err); }
};

const reopenTicket = async (req, res, next) => {
  try {
    const ticket = await ticketsService.reopenTicket(req.params.id, req.tenantId, req.user.id, req.user.role);
    res.json({ success: true, ticket });
  } catch (err) { next(err); }
};

const bulkUpdate = async (req, res, next) => {
  try {
    const { ticketIds, action, value } = req.body;
    if (!Array.isArray(ticketIds) || !ticketIds.length) {
      return res.status(400).json({ success: false, message: 'ticketIds must be a non-empty array' });
    }

    let updateData = {};
    if (action === 'assign')   updateData = { assigned_to_id: value };
    else if (action === 'priority') updateData = { priority: value };
    else if (action === 'close')    updateData = { status: 'closed' };
    else return res.status(400).json({ success: false, message: 'Invalid action' });

    await Promise.all(
      ticketIds.map(id =>
        ticketsService.updateTicket(id, updateData, req.tenantId, req.user.id, req.user.role)
      )
    );

    res.json({ success: true, updated: ticketIds.length });
  } catch (err) { next(err); }
};

module.exports = { getTickets, getTicket, createTicket, updateTicket, escalateTicket, closeTicket, reopenTicket, bulkUpdate };
