const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

// @desc    Create a new Admin (Super Admin only)
// @route   POST /api/users/create-admin
// @access  Private/SuperAdmin
exports.createAdmin = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const userExists = await query('SELECT * FROM users WHERE username = $1', [username]);

    if (userExists.rows.length > 0) {
      res.status(400);
      throw new Error('Username already taken');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, username, role',
      [name, username, hashedPassword, 'admin']
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Admin account created successfully',
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new Agent (Super Admin & Admin only)
// @route   POST /api/users/create-agent
// @access  Private/SuperAdmin, Admin
exports.createAgent = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const userExists = await query('SELECT * FROM users WHERE username = $1', [username]);

    if (userExists.rows.length > 0) {
      res.status(400);
      throw new Error('Username already taken');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, username, role',
      [name, username, hashedPassword, 'agent']
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Agent account created successfully',
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ success: false, message: error.message });
  }
};

// @desc    Get users (Super Admin sees all, Admin sees only agents)
// @route   GET /api/users
// @access  Private/SuperAdmin, Admin
exports.getUsers = async (req, res) => {
  try {
    let result;
    if (req.user.role === 'superadmin') {
      result = await query('SELECT id, name, username, role, created_at FROM users ORDER BY created_at DESC');
    } else if (req.user.role === 'admin') {
      result = await query('SELECT id, name, username, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC', ['agent']);
    } else {
      res.status(403);
      throw new Error('Not authorized to view users');
    }

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ success: false, message: error.message });
  }
};

// @desc    Get theatre user requests
// @route   GET /api/users/theatre-requests
// @access  Private/SuperAdmin, Admin
exports.getTheatreRequests = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, username, email, theatre_name, theatre_address, status, approved_at, rejection_reason, created_at 
       FROM theatre_users ORDER BY status DESC, created_at DESC`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ success: false, message: error.message });
  }
};

// @desc    Get theatre user request by ID
// @route   GET /api/users/theatre-requests/:id
// @access  Private/Theatre User
exports.getTheatreRequestStatus = async (req, res) => {
  try {
    const requestedId = Number(req.params.id);
    const targetId = req.user.role === 'theatre_user' ? req.user.id : requestedId;

    if (!targetId) {
      res.status(400);
      throw new Error('A valid theatre user ID is required');
    }

    if (
      req.user.role === 'theatre_user' &&
      requestedId &&
      requestedId !== req.user.id
    ) {
      res.status(403);
      throw new Error('Not authorized to view this theatre request');
    }

    const result = await query(
      `SELECT id, username, email, theatre_name, theatre_address, status, approved_by, approved_at, rejection_reason, created_at 
       FROM theatre_users WHERE id = $1`,
      [targetId]
    );

    if (result.rows.length === 0) {
      res.status(404);
      throw new Error('Theatre user not found');
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ success: false, message: error.message });
  }
};

// @desc    Approve a theatre user request
// @route   POST /api/users/theatre-requests/:id/approve
// @access  Private/SuperAdmin, Admin
exports.approveTheatreRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const result = await query(
      `UPDATE theatre_users
       SET status = $1, approved_by = $2, approved_at = NOW(), rejection_reason = NULL
       WHERE id = $3
       RETURNING *`,
      ['accepted', adminId, id]
    );

    if (result.rows.length === 0) {
      res.status(404);
      throw new Error('Theatre user not found');
    }

    res.status(200).json({
      success: true,
      message: 'Theatre user request approved successfully',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a theatre user request
// @route   POST /api/users/theatre-requests/:id/reject
// @access  Private/SuperAdmin, Admin
exports.rejectTheatreRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const result = await query(
      `UPDATE theatre_users SET status = $1, approved_by = $2, approved_at = NOW(), rejection_reason = $3 WHERE id = $4 RETURNING *`,
      ['rejected', adminId, reason || 'No reason provided', id]
    );

    if (result.rows.length === 0) {
      res.status(404);
      throw new Error('Theatre user not found');
    }

    res.status(200).json({
      success: true,
      message: 'Theatre user request rejected successfully',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ success: false, message: error.message });
  }
};
