import { Request, Response } from 'express';
import ocrService from '../services/ocr.service';
import scoringService from '../services/scoring.service';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { AuthRequest } from '../middleware/auth.middleware';
import fs from 'fs';

export class ScanController {
  /**
   * POST /api/scan/analyze
   * Analyze nutrition label from uploaded image
   */
  async analyzeLLabel(req: AuthRequest, res: Response) {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const imagePath = req.file.path;
      console.log('📸 Received image for analysis:', imagePath);

      // Extract text and parse nutrition data using OCR
      const nutritionData = await ocrService.processNutritionLabel(imagePath);

      // Get user's health profile for personalized scoring
      let userProfile;
      if (req.userId) {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: req.userId } });
        
        if (user) {
          userProfile = {
            bloodSugarMgDl: user.blood_sugar_mg_dl,
            ldlCholesterolMgDl: user.ldl_cholesterol_mg_dl,
            weightKg: user.weight_kg,
            heightCm: user.height_cm,
          };
        }
      }

      // Calculate health score
      const healthScore = scoringService.calculateScore(nutritionData, userProfile);

      // Clean up uploaded file
      fs.unlinkSync(imagePath);
      console.log('🗑️ Cleaned up temporary file');

      // Return results
      res.json({
        success: true,
        nutritionData,
        healthScore,
        message: 'Nutrition label analyzed successfully',
      });

    } catch (error) {
      console.error('❌ Error analyzing nutrition label:', error);
      
      // Clean up file if it exists
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        error: 'Failed to analyze nutrition label',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/scan/test
   * Test endpoint to verify scan routes are working
   */
  async testEndpoint(req: Request, res: Response) {
    res.json({
      message: 'Scan endpoint is working! 🎉',
      endpoints: {
        analyze: 'POST /api/scan/analyze - Upload nutrition label image',
      },
    });
  }
}

export default new ScanController();
