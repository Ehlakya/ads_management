const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ad_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  theater_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sale_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  theater_address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
}, {
  tableName: 'sales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Sale;
