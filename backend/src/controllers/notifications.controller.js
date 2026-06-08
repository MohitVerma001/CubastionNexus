const { query }        = require('../config/database');
const { getPagination } = require('../utils/pagination');

const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const [countRes, dataRes] = await Promise.all([
      query(
        'SELECT COUNT(*) FROM notifications WHERE recipient_id = $1',
        [req.user.id]
      ),
      query(
        `SELECT n.*, t.ticket_number, t.subject AS ticket_subject
         FROM notifications n
         LEFT JOIN tickets t ON t.id = n.ticket_id
         WHERE n.recipient_id = $1
         ORDER BY n.sent_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user.id, limit, offset]
      ),
    ]);

    res.json({
      success:       true,
      notifications: dataRes.rows,
      total:         parseInt(countRes.rows[0].count, 10),
      page,
      limit,
    });
  } catch (err) { next(err); }
};

const markAllRead = async (req, res, next) => {
  try {
    await query(
      'UPDATE notifications SET read_at = now() WHERE recipient_id = $1 AND read_at IS NULL',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND read_at IS NULL',
      [req.user.id]
    );
    res.json({ success: true, count: parseInt(result.rows[0].count, 10) });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, markAllRead, getUnreadCount };
