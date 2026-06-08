const { query } = require('../config/database');

const getDepartments = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, description, is_active, created_at
       FROM departments
       WHERE is_active = true
       ORDER BY name ASC`
    );
    res.json({ success: true, departments: result.rows });
  } catch (err) { next(err); }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }
    const result = await query(
      `INSERT INTO departments (name, description)
       VALUES ($1, $2) RETURNING *`,
      [name.trim(), description || null]
    );
    res.status(201).json({ success: true, department: result.rows[0] });
  } catch (err) { next(err); }
};

const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, is_active } = req.body;
    const result = await query(
      `UPDATE departments
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_active = COALESCE($3, is_active),
           updated_at = now()
       WHERE id = $4
       RETURNING *`,
      [name || null, description !== undefined ? description : null, is_active !== undefined ? is_active : null, req.params.id]
    );
    if (!result.rows.length) throw { status: 404, message: 'Department not found' };
    res.json({ success: true, department: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getDepartments, createDepartment, updateDepartment };
