const { Pool } = require('pg');
const dotenv = require('dotenv');

// 1. Ensure dotenv is loaded before anything else
dotenv.config();

const { Sequelize } = require('sequelize');

// 2. Configure Pool for both local and production
let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  });
} else {
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

pool.on('connect', () => {
  console.log('✅ PostgreSQL Database connected successfully (pg Pool)');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle pg client:', err);
  process.exit(-1);
});

// 3. Configure Sequelize for both local and production
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, 
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      }
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      port: process.env.DB_PORT,
      logging: false,
    }
  );
}

sequelize.authenticate()
  .then(() => console.log('✅ Sequelize connected successfully'))
  .catch(err => console.error('❌ Unable to connect to the database with Sequelize:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  sequelize,
};
