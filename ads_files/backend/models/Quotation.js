const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Quotation = sequelize.define('Quotation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ad_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  theatre_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  admin_response: {
    type: DataTypes.ENUM('accepted', 'rejected'),
    allowNull: true,
  },
  admin_response_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  theatre_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  selected_screens: {
    type: DataTypes.JSON, // Stores array of screen numbers [1, 2, 4]
    allowNull: true,
  },
  admin_suggested_screen: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  theatre_screen_decision: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'quotations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Quotation;
