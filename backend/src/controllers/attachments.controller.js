const path = require('path');
const fs   = require('fs');
const { query }           = require('../config/database');
const fileUploadService   = require('../services/fileUpload.service');

const getAttachments = async (req, res, next) => {
  try {
    const attachments = await fileUploadService.getAttachments(req.params.ticketId, req.tenantId);
    res.json({ success: true, attachments });
  } catch (err) { next(err); }
};

const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const attachment = await fileUploadService.saveAttachment(
      req.params.ticketId, req.file, req.user.id, req.tenantId
    );
    res.status(201).json({ success: true, attachment });
  } catch (err) { next(err); }
};

const downloadAttachment = async (req, res, next) => {
  try {
    const conditions = ['a.id = $1'];
    const params     = [req.params.attachmentId];
    if (req.tenantId) { conditions.push('a.organisation_id = $2'); params.push(req.tenantId); }

    const result = await query(
      `SELECT storage_path, original_name, mime_type FROM attachments a WHERE ${conditions.join(' AND ')}`,
      params
    );
    if (!result.rows.length) throw { status: 404, message: 'Attachment not found' };

    const { storage_path, original_name, mime_type } = result.rows[0];
    if (!fs.existsSync(storage_path)) throw { status: 404, message: 'File not found on disk' };

    res.setHeader('Content-Type', mime_type);
    res.download(storage_path, original_name || path.basename(storage_path));
  } catch (err) { next(err); }
};

module.exports = { getAttachments, uploadAttachment, downloadAttachment };
