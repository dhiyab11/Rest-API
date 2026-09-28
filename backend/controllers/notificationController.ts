import { Request, Response } from 'express';
import { db, generateObjectId } from '../services/databaseService.js';
import { INotification } from '../models/types.js';

export const notificationController = {
  // GET /api/notifications
  getAllNotifications: (req: Request, res: Response) => {
    const { role } = req.query;
    let list = [...db.notifications];

    if (role && typeof role === 'string' && role !== 'All') {
      list = list.filter(n => n.targetRole === 'All' || n.targetRole.toLowerCase() === role.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      total: list.length,
      data: list,
    });
  },

  // POST /api/notifications
  createNotification: (req: Request, res: Response) => {
    const { title, message, type = 'Info', targetRole = 'All' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: title and message are required',
        statusCode: 400,
      });
    }

    const newNotification: INotification = {
      _id: generateObjectId(),
      title,
      message,
      type,
      targetRole,
      sender: req.user?.name || 'Campus Administration',
      readBy: [],
      createdAt: new Date().toISOString(),
    };

    db.notifications.unshift(newNotification);

    return res.status(201).json({
      success: true,
      message: 'Campus notification broadcasted successfully',
      statusCode: 201,
      data: newNotification,
    });
  },

  // PUT /api/notifications/:id/read
  markAsRead: (req: Request, res: Response) => {
    const { id } = req.params;
    const userIdentifier = req.user?.email || 'student@smartcampus.edu';

    const notification = db.notifications.find(n => n._id === id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        statusCode: 404,
      });
    }

    if (!notification.readBy.includes(userIdentifier)) {
      notification.readBy.push(userIdentifier);
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      statusCode: 200,
      data: notification,
    });
  },
};
