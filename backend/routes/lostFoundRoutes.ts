import { Router } from 'express';
import { lostFoundController } from '../controllers/lostFoundController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', lostFoundController.getAllLostFound);
router.get('/:id', lostFoundController.getLostFoundById);
router.post('/', authenticateToken, lostFoundController.createLostFound);
router.put('/:id', authenticateToken, lostFoundController.updateLostFound);
router.delete('/:id', authenticateToken, lostFoundController.deleteLostFound);

export default router;
