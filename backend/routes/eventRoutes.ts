import { Router } from 'express';
import { eventController } from '../controllers/eventController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', eventController.getAllEvents);
router.post('/', authenticateToken, requireRole(['Admin', 'Faculty']), eventController.createEvent);
router.put('/:id', authenticateToken, requireRole(['Admin', 'Faculty']), eventController.updateEvent);
router.delete('/:id', authenticateToken, requireRole(['Admin']), eventController.deleteEvent);
router.post('/:id/register', authenticateToken, eventController.registerForEvent);

export default router;
