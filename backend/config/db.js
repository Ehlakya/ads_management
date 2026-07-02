const { Pool } = require('pg');
const dotenv = require('dotenv');

// 1. Ensure dotenv is loaded before anything else
dotenv.config();

const { Sequelize } = require('sequelize');

// Hardcoded fallback as explicitly requested by the user
const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_5MIZbVdKYW9G@ep-delicate-shape-aoii5n44-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

let pool;
let sequelize;

// Utility to safely log DB info without leaking passwords
const logDbInfo = () => {
  try {
    const url = new URL(DB_URL);
    console.log(`ℹ️  Using DATABASE_URL configuration.`);
    console.log(`ℹ️  Connecting to Database Host: ${url.hostname} on Port: ${url.port || 5432}`);
  } catch (e) {
    console.log(`ℹ️  Using DATABASE_URL configuration (Invalid URL format).`);
  }
};

logDbInfo();

// Use the Neon database directly with SSL enabled
pool = new Pool({
  connectionString: DB_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  }
});

sequelize = new Sequelize(DB_URL, {
  dialect: 'postgres',
  logging: false, 
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  }
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL Database connected successfully (pg Pool)');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle pg client:', err);
  process.exit(-1);
});

sequelize.authenticate()
  .then(() => console.log('✅ Sequelize connected successfully'))
  .catch(err => {
    console.error('❌ Unable to connect to the database with Sequelize:', err);
  });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  sequelize,
};
