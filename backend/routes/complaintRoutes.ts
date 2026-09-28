import { Router } from 'express';
import { complaintController } from '../controllers/complaintController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', complaintController.getAllComplaints);
router.get('/:id', complaintController.getComplaintById);
router.post('/', authenticateToken, complaintController.createComplaint);
router.put('/:id/status', authenticateToken, requireRole(['Admin', 'Faculty']), complaintController.updateComplaintStatus);
router.delete('/:id', authenticateToken, requireRole(['Admin']), complaintController.deleteComplaint);

export default router;
