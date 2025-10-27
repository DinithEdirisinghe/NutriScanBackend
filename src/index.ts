import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import scanRoutes from './routes/scan.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // For base64 images
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'NutriScore API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/scan', scanRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize Database and Start Server
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
      console.log(`Local: http://localhost:${PORT}/health`);
      console.log(`Network: http://192.168.1.101:${PORT}/health`);
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });
