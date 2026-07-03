const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');

// Initialize models and associations
require('./models');

// Load env vars
dotenv.config();

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

// Initialize database
const { sequelize } = require('./config/db');

const startServer = async () => {
  try {
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

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
