import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import phrasesRoutes from './routes/phrases.routes.js';
import readingsRoutes from './routes/readings.routes.js';
import paymentsRoutes from './routes/payments.routes.js';

dotenv.config();

// Define the IUser interface for type safety
interface IUser extends mongoose.Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'free' | 'premium' | 'admin';
  isEmailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  dailyPhrasesCount: number;
  lastPhrasesReset: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Update Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// 3. Configuración inicial
const app: Express = express();
const PORT = process.env.PORT || 5001;

// 4. Conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// 5. Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'https://interlineado.fluentphrases.org',
    'https://fluentphrases.org',
    'https://interlineado-backend-fluent-phrases.vercel.app',
    'https://backend-interlineado.vercel.app',

  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(express.json());

// Test route
app.get('/api/test', (_req: Request, res: Response) => {
  res.json({ message: 'Backend is working!' });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/phrases', phrasesRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/payments', paymentsRoutes);

// Manejo de errores mejorado
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('🔥 Error:', error.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// Iniciar servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

export default app;
