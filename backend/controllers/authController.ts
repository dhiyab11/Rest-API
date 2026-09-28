import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, generateObjectId } from '../services/databaseService.js';
import { generateToken } from '../middleware/auth.js';
import { IUser, UserRole } from '../models/types.js';

export const authController = {
  // POST /api/auth/register
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, name, role = 'Student', department, studentId } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed: Email, password, and name are required',
          statusCode: 400,
        });
      }

      const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email address',
          statusCode: 400,
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUserId = generateObjectId();
      const userRole: UserRole = ['Admin', 'Faculty', 'Student'].includes(role) ? role : 'Student';

      const newUser: IUser = {
        _id: newUserId,
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: userRole,
        department: department || 'General Studies',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=059669`,
        referenceId: studentId || (userRole === 'Student' ? `STU${Math.floor(100000 + Math.random() * 900000)}` : undefined),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.users.push(newUser);

      // If registered as student, automatically add to students collection
      if (userRole === 'Student') {
        db.students.push({
          _id: generateObjectId(),
          studentId: newUser.referenceId || `STU${Math.floor(100000 + Math.random() * 900000)}`,
          name: newUser.name,
          email: newUser.email,
          phone: '+91 98400 00000',
          department: newUser.department || 'Computer Science & Engineering',
          year: 1,
          semester: 1,
          cgpa: 8.5,
          attendanceRate: 100,
          hostelResident: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      const token = generateToken({
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        referenceId: newUser.referenceId,
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        statusCode: 201,
        data: {
          token,
          user: {
            _id: newUser._id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            referenceId: newUser.referenceId,
            department: newUser.department,
            avatar: newUser.avatar,
          },
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Internal registration error',
        statusCode: 500,
      });
    }
  },

  // POST /api/auth/login
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          statusCode: 400,
        });
      }

      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          statusCode: 401,
        });
      }

      // Check password (supports default password123 or hashed)
      const isMatch = password === 'password123' || await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          statusCode: 401,
        });
      }

      const token = generateToken({
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        referenceId: user.referenceId,
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        statusCode: 200,
        data: {
          token,
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            referenceId: user.referenceId,
            department: user.department,
            avatar: user.avatar,
          },
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Authentication failed',
        statusCode: 500,
      });
    }
  },

  // POST /api/auth/logout
  logout: async (req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully. Invalidate client token storage.',
      statusCode: 200,
    });
  },

  // GET /api/auth/me
  me: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthenticated session',
        statusCode: 401,
      });
    }

    const user = db.users.find(u => u._id === req.user?.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
        statusCode: 404,
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        referenceId: user.referenceId,
        department: user.department,
        avatar: user.avatar,
      },
    });
  },
};
