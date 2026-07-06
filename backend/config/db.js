const { Sequelize } = require('sequelize');

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Please configure your environment variables.");
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false, // Set to console.log to see SQL queries
});

module.exports = {
  sequelize,
};
