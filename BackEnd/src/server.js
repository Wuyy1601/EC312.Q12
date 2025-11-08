import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Gift Shop API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Gift Shop E-Commerce API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Error handlers (must be after all routes)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
