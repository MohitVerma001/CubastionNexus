const { validationResult } = require('express-validator');
const commentsService = require('../services/comments.service');

const getComments = async (req, res, next) => {
  try {
    const comments = await commentsService.getComments(
      req.params.ticketId, req.tenantId, req.user.id, req.user.role
    );
    res.json({ success: true, comments });
  } catch (err) { next(err); }
};

const addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const comment = await commentsService.addComment(
      req.params.ticketId, req.body.body, req.body.is_internal,
      req.tenantId, req.user.id, req.user.role
    );
    res.status(201).json({ success: true, comment });
  } catch (err) { next(err); }
};

module.exports = { getComments, addComment };
