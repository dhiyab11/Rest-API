import { Router } from 'express';
import { busController } from '../controllers/busController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', busController.getAllBuses);
router.get('/:id', busController.getBusById);
router.get('/:id/location', busController.getBusLocation);
router.post('/location', authenticateToken, requireRole(['Admin', 'Faculty']), busController.updateBusLocation);

export default router;
