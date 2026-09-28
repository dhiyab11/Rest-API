import { Request, Response, NextFunction } from 'express';
import { db } from '../services/databaseService.js';

export function apiLogger(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();

  res.on('finish', () => {
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    
    // Set response header for client inspection
    try {
      res.setHeader('X-Response-Time', `${durationMs}ms`);
    } catch {
      // Ignored if headers already sent
    }

    if (req.originalUrl.startsWith('/api') && !req.originalUrl.includes('/api/dashboard/statistics') && !req.originalUrl.includes('/swagger.json')) {
      db.logApi({
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        method: req.method,
        endpoint: req.originalUrl.split('?')[0],
        statusCode: res.statusCode,
        durationMs,
        timestamp: new Date().toISOString(),
        userRole: req.user?.role || 'Guest',
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      });
    }
  });

  next();
}
