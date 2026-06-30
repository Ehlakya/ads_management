const { sequelize } = require('./db');
const { User, Ad, Quotation, Sale, TheatreUser } = require('../models');
const bcrypt = require('bcryptjs');

const initDb = async () => {
  try {
    console.log('Initializing Database with Sequelize...');

    // Sync all defined models to the DB
    // alter: true will update the tables to match the models
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully.');

    // Seed Users
    const seedUser = async (name, username, password, role) => {
      const userExists = await User.findOne({ where: { username } });
      if (!userExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.create({
          name,
          username,
          password: hashedPassword,
          role,
        });
        console.log(`User ${username} (${role}) created.`);
      } else {
        console.log(`User ${username} already exists.`);
      }
    };

    await seedUser('Super Admin', 'superadmin', 'superadmin123', 'superadmin');
    await seedUser('Admin User', 'admin', 'admin123', 'admin');
    await seedUser('Agent User', 'agent', 'agent123', 'agent');

    console.log('Database initialization complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDb();
