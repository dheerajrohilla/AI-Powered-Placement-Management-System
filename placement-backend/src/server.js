import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import tpoRoutes from './routes/tpoRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import studyMaterialRoutes from './routes/studyMaterialRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import { seedQuestionBank } from './services/quizService.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedDatabase } from './seed/seed.js';
import { initSocketIO } from './services/socketService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'default_fallback_placement_jwt_secret_2026';
}

export const app = express();
export const httpServer = createServer(app);
export const io = initSocketIO(httpServer);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendUploads = path.join(__dirname, '../uploads');
fs.mkdirSync(path.join(backendUploads, 'resumes'), { recursive: true });
fs.mkdirSync(path.join(backendUploads, 'avatars'), { recursive: true });
fs.mkdirSync(path.join(backendUploads, 'logos'), { recursive: true });

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads with cross-origin headers so PDF embeds and cross-port links load cleanly
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(backendUploads));

const cwdUploads = path.join(process.cwd(), 'uploads');
if (path.resolve(cwdUploads) !== path.resolve(backendUploads) && fs.existsSync(cwdUploads)) {
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  }, express.static(cwdUploads));
}

export const setupApp = () => {
  if (app._routesReady) {
    return app;
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/company', companyRoutes);
  app.use('/api/tpo', tpoRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/study-materials', studyMaterialRoutes);
  app.use('/api/student/study-materials', studyMaterialRoutes);
  app.use('/api/quiz', quizRoutes);
  app.use('/api/student/quiz', quizRoutes);
  app.use('/api/interviews', interviewRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
  });

  app.use(errorHandler);
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  app._routesReady = true;
  return app;
};

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
});

export const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();
    await seedQuestionBank();
    setupApp();

    const PORT = process.env.PORT || 5000;
    httpServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`✗ Port ${PORT} is already in use by another process. Please free port ${PORT} or stop existing Node processes.`);
      } else {
        console.error('✗ Server HTTP error:', err.message);
      }
      process.exit(1);
    });
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Socket.IO real-time collaboration initialized`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

setupApp();

const isTestEnv = Boolean(
  process.env.NODE_ENV === 'test' ||
  process.env.NODE_TEST_CONTEXT ||
  process.argv.includes('--test') ||
  process.execArgv.includes('--test')
);

if (!isTestEnv) {
  startServer();
}

export default app;
