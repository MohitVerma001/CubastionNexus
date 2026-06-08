const fs    = require('fs');
const path  = require('path');
const { query } = require('../config/database');

const saveAttachment = async (ticketId, file, userId, tenantId) => {
  // Resolve organisation_id from ticket if not in tenantId
  const ticketRes = await query(
    'SELECT id, organisation_id FROM tickets WHERE id = $1',
    [ticketId]
  );

  if (!ticketRes.rows.length) {
    fs.unlink(file.path, () => {});
    throw { status: 404, message: 'Ticket not found' };
  }

  const orgId = tenantId || ticketRes.rows[0].organisation_id;

  const result = await query(
    `INSERT INTO attachments
       (ticket_id, organisation_id, uploaded_by_id, filename, original_name, storage_path, file_size_bytes, mime_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [ticketId, orgId, userId, file.filename, file.originalname, file.path, file.size, file.mimetype]
  );
  return result.rows[0];
};

const getAttachments = async (ticketId, tenantId) => {
  const conditions = ['a.ticket_id = $1'];
  const params     = [ticketId];
  if (tenantId) { conditions.push('a.organisation_id = $2'); params.push(tenantId); }

  const result = await query(
    `SELECT a.id, a.filename, a.original_name, a.file_size_bytes, a.mime_type, a.created_at,
            u.name AS uploaded_by_name
     FROM attachments a
     LEFT JOIN users u ON u.id = a.uploaded_by_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY a.created_at ASC`,
    params
  );
  return result.rows;
};

module.exports = { saveAttachment, getAttachments };
