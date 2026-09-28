import { Router } from 'express';
import { studentController } from '../controllers/studentController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Allow public/authenticated viewing; modify requires Faculty/Admin
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', authenticateToken, requireRole(['Admin', 'Faculty']), studentController.createStudent);
router.put('/:id', authenticateToken, requireRole(['Admin', 'Faculty']), studentController.updateStudent);
router.delete('/:id', authenticateToken, requireRole(['Admin']), studentController.deleteStudent);

export default router;
