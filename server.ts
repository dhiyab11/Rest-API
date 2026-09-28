import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
dotenv.config();

import { apiLogger } from './backend/middleware/apiLogger.js';
import { errorHandler, notFoundHandler } from './backend/middleware/errorHandler.js';
import { openApiSpec } from './backend/services/swaggerDocs.js';

import authRoutes from './backend/routes/authRoutes.js';
import studentRoutes from './backend/routes/studentRoutes.js';
import attendanceRoutes from './backend/routes/attendanceRoutes.js';
import complaintRoutes from './backend/routes/complaintRoutes.js';
import eventRoutes from './backend/routes/eventRoutes.js';
import busRoutes from './backend/routes/busRoutes.js';
import classroomRoutes from './backend/routes/classroomRoutes.js';
import notificationRoutes from './backend/routes/notificationRoutes.js';
import lostFoundRoutes from './backend/routes/lostFoundRoutes.js';
import dashboardRoutes from './backend/routes/dashboardRoutes.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global parsing middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger for API explorer and analytics
  app.use(apiLogger);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      system: 'SmartCampus API Hub',
      timestamp: new Date().toISOString(),
      architecture: 'REST API First',
      version: '1.0.0',
    });
  });

  // Swagger / OpenAPI specification endpoint
  app.get('/api/swagger.json', (req, res) => {
    res.json(openApiSpec);
  });

  // REST API Module Routers
  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/buses', busRoutes);
  app.use('/api/classrooms', classroomRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/lost-found', lostFoundRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // 404 handler for API routes
  app.all('/api/*', notFoundHandler);

  // Global Error Handler for API
  app.use(errorHandler);

  // Vite Middleware setup for Frontend SPA
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SmartCampus API Hub] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
