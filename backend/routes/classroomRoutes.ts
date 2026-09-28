import { Router } from 'express';
import { classroomController } from '../controllers/classroomController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', classroomController.getAllClassrooms);
router.get('/available', classroomController.getAvailableClassrooms);
router.post('/book', authenticateToken, requireRole(['Admin', 'Faculty']), classroomController.bookClassroom);
router.delete('/booking/:id', authenticateToken, requireRole(['Admin', 'Faculty']), classroomController.cancelBooking);

export default router;
