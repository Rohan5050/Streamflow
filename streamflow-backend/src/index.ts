import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import verifyRoutes from './routes/verify';
import workflowRoutes from './routes/workflows';
import budgetRoutes from './routes/budgets';
import recipientRoutes from './routes/recipients';
import analyticsRoutes from './routes/analytics';
//import authRoutes from './routes/auth';
import { auth } from './middleware/auth';
import { SolanaService} from "../src/services/SolanaService";



// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/streamflow'
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Public routes
//app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api', verifyRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/budgets', auth, budgetRoutes);
app.use('/api/recipients', auth, recipientRoutes);
app.use('/api/analytics', auth, analyticsRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 