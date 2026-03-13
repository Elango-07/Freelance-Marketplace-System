import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { rateLimit } from 'express-rate-limit';
import requestIp from 'request-ip';

// Load env vars
dotenv.config();

// Step 11: Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Route Imports
import authRoutes from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { moderationCheck, logViolation } from './utils/moderation.js';
import { supabase } from './config/supabase.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Step 14: Security Middlewares
app.use(helmet());
app.use(requestIp.mw());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'FMS Backend is running' });
});

// Base API Info
app.get('/api', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'FMS API is active. Please use the frontend at http://localhost:5173 to interact with the app.' });
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`User ${socket.id} joined project: ${projectId}`);
  });

  socket.on('send_message', async (data) => {
    const { projectId, senderId, receiverId, message, attachmentUrl } = data;

    // 1. Moderation Check
    const violations = moderationCheck(message);
    
    // 2. Insert into Supabase
    const { data: msgData, error } = await supabase.from('messages').insert({
      project_id: projectId,
      sender_id: senderId,
      receiver_id: receiverId,
      message,
      attachment_url: attachmentUrl
    }).select().single();

    if (error) return socket.emit('error', { message: 'Failed to send message' });

    // 3. Log Violations if any
    if (violations.length > 0) {
      await logViolation(supabase, senderId, msgData.id, violations.join(', '));
      socket.emit('moderation_alert', { violations });
    }

    // 4. Broadcast to the project room
    io.to(`project_${projectId}`).emit('new_message', { 
      ...msgData, 
      flagged: violations.length > 0 
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 FMS Server running on port ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
});
