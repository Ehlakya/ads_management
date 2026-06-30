const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const { Sequelize } = require('sequelize');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('PostgreSQL Database connected successfully (pg)');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: false, // Set to console.log to see SQL queries
  }
);

sequelize.authenticate()
  .then(() => console.log('Sequelize connected successfully'))
  .catch(err => console.error('Unable to connect to the database with Sequelize:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  sequelize,
};
