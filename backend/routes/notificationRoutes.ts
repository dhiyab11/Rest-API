import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', notificationController.getAllNotifications);
router.post('/', authenticateToken, requireRole(['Admin', 'Faculty']), notificationController.createNotification);
router.put('/:id/read', authenticateToken, notificationController.markAsRead);

export default router;
