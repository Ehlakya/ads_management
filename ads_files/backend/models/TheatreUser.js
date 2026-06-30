const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TheatreUser = sequelize.define('TheatreUser', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  theatre_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  theatre_address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  total_screens: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'theatre_user',
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'theatre_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = TheatreUser;
