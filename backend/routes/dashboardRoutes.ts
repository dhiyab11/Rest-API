import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';

const router = Router();

router.get('/student', dashboardController.getStudentDashboard);
router.get('/faculty', dashboardController.getFacultyDashboard);
router.get('/admin', dashboardController.getAdminDashboard);
router.get('/statistics', dashboardController.getStatistics);
router.get('/stats', dashboardController.getStatistics);

export default router;
