import { Router } from 'express';
import { attendanceController } from '../controllers/attendanceController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', attendanceController.getAllAttendance);
router.get('/student/:studentId', attendanceController.getByStudentId);
router.post('/', authenticateToken, requireRole(['Admin', 'Faculty']), attendanceController.markAttendance);
router.put('/:id', authenticateToken, requireRole(['Admin', 'Faculty']), attendanceController.updateAttendance);

export default router;
