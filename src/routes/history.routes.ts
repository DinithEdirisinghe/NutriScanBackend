import { Router } from 'express';
import historyController from '../controllers/history.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/history - Get all scans for logged-in user
router.get('/', historyController.getHistory);

// GET /api/history/:id - Get detailed scan by ID
router.get('/:id', historyController.getScanById);

// POST /api/history - Save a new scan
router.post('/', historyController.saveScan);

export default router;
