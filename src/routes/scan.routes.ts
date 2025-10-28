import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import scanController from '../controllers/scan.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists!
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'nutrition-label-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed!'));
      return;
    }
    cb(null, true);
  }
});

// Routes
router.get('/test', scanController.testEndpoint);
router.post('/analyze', authMiddleware, upload.single('image'), scanController.analyzeLLabel);
router.post('/food-photo', authMiddleware, upload.single('image'), scanController.analyzeFoodPhoto);

export default router;
