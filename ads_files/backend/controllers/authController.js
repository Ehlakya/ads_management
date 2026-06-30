const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { query } = require('../config/db');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check users table first (no email column)
    let result = await query('SELECT * FROM users WHERE username = $1', [username]);
    let user = result.rows[0];
    let isTheatreUser = false;

    // If not found in users, check theatre_users table
    if (!user) {
      result = await query('SELECT * FROM theatre_users WHERE username = $1 OR email = $1', [username]);
      user = result.rows[0];
      isTheatreUser = true;
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      if (isTheatreUser) {
        res.json({
          id: user.id,
          name: user.theatre_name,
          username: user.username,
          email: user.email,
          role: user.role,
          total_screens: user.total_screens,
          token: generateToken(user.id, 'theatre_user'),
        });
      } else {
        res.json({
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          token: generateToken(user.id, 'user'),
        });
      }
    } else {
      res.status(401);
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, username, password, role } = req.body;

  try {
    const userExists = await query('SELECT * FROM users WHERE username = $1', [username]);

    if (userExists.rows.length > 0) {
      res.status(400);
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, username, role',
      [name, username, hashedPassword, role || 'agent']
    );

    const newUser = result.rows[0];

    if (newUser) {
      res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        token: generateToken(newUser.id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Auth theatre user & get token
// @route   POST /api/auth/theatre/login
// @access  Public
exports.loginTheatre = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await query('SELECT * FROM theatre_users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        name: user.theatre_name,
        username: user.username,
        email: user.email,
        role: user.role,
        total_screens: user.total_screens,
        token: generateToken(user.id, 'theatre_user'),
      });
    } else {
      res.status(401);
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Register a new theatre user
// @route   POST /api/auth/theatre/register
// @access  Public
exports.registerTheatre = async (req, res) => {
  const { username, email, theatre_name, theatre_address, total_screens, password } = req.body;

  try {
    const userExists = await query('SELECT * FROM theatre_users WHERE username = $1 OR email = $2', [username, email]);

    if (userExists.rows.length > 0) {
      res.status(400);
      throw new Error('User with this username or email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO theatre_users (username, email, theatre_name, theatre_address, total_screens, password, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id, username, email, theatre_name, role, total_screens',
      [username, email, theatre_name, theatre_address, total_screens || 1, hashedPassword, 'theatre_user']
    );

    const newUser = result.rows[0];

    if (newUser) {
      res.status(201).json({
        id: newUser.id,
        name: newUser.theatre_name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser.id, 'theatre_user'),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};
