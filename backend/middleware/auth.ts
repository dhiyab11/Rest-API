import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/types.js';
import { db } from '../services/databaseService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smartcampus_dev_jwt_secret_key_2026';

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  referenceId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (err) {
    return null;
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token, check if query param or header has a demo-role header for easy API Explorer playground
    const demoRole = (req.headers['x-demo-role'] as UserRole) || 'Admin';
    const fallbackUser = db.users.find(u => u.role === demoRole) || db.users[0];
    if (fallbackUser && req.headers['x-enable-demo-auth'] === 'true') {
      req.user = {
        userId: fallbackUser._id,
        email: fallbackUser.email,
        role: fallbackUser.role,
        name: fallbackUser.name,
        referenceId: fallbackUser.referenceId,
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Access denied: Authentication token required',
      statusCode: 401,
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      statusCode: 403,
    });
  }

  req.user = decoded;
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for role verification',
        statusCode: 401,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${allowedRoles.join(', ')}] roles. Your role is '${req.user.role}'.`,
        statusCode: 403,
      });
    }

    next();
  };
}
