// Load env vars FIRST before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');

// Initialize database
const { sequelize } = require('./config/db');

// Initialize models and associations
require('./models');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    console.log(`Starting server...`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`PORT: ${PORT}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Loaded' : 'Missing'}`);

    // Authenticate database before syncing or starting server
    await sequelize.authenticate();
    console.log('Database authentication successful.');

    // Sync database (this will create/update tables to match models)
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully.');

    // Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/ads', require('./routes/adsRoutes'));
    app.use('/api/quotations', require('./routes/quotationRoutes'));
    app.use('/api/sales', require('./routes/salesRoutes'));

    // Error handler
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server (Database connection failed):');
    if (error.original) {
      console.error(`- Host: ${error.original.address || error.original.host}`);
      console.error(`- Port: ${error.original.port}`);
      console.error(`- Database: ${error.original.database}`);
      console.error(`- SSL Status: ${error.original.ssl ? 'Enabled' : 'Disabled / Unknown'}`);
      console.error(`- Original Error: ${error.original.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
};

startServer();
