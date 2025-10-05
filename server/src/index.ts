import express from 'express';
import cors from 'cors';
// FIX: Import the 'process' module to provide type definitions for 'process.exit'.
import process from 'process';
import { initializeDatabase } from './db.js';

import authRoutes from './routes/auth.js';
import deviceRoutes from './routes/devices.js';
import userRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';
import { authMiddleware, adminOnly } from './authMiddleware.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/devices', authMiddleware, deviceRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch(error => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
});