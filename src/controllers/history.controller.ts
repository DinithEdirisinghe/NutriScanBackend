import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Scan } from '../entities/Scan.entity';

class HistoryController {
  // Get all scans for logged-in user
  async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const scanRepository = AppDataSource.getRepository(Scan);
      
      const scans = await scanRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' }, // Most recent first
        select: [
          'id',
          'scanType',
          'foodName',
          'healthScore',
          'createdAt',
          'confidenceLevel',
        ],
      });

      console.log(`📜 Retrieved ${scans.length} scans for user ${userId}`);

      res.json({
        success: true,
        scans: scans.map((scan) => ({
          id: scan.id,
          scanType: scan.scanType,
          foodName: scan.foodName,
          overallScore: scan.healthScore.overallScore,
          confidenceLevel: scan.confidenceLevel,
          createdAt: scan.createdAt,
        })),
      });
    } catch (error: any) {
      console.error('❌ Error fetching scan history:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch scan history',
      });
    }
  }

  // Get detailed scan by ID
  async getScanById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const scanRepository = AppDataSource.getRepository(Scan);
      
      const scan = await scanRepository.findOne({
        where: { id, userId }, // Ensure user owns this scan
      });

      if (!scan) {
        return res.status(404).json({
          success: false,
          message: 'Scan not found',
        });
      }

      console.log(`📄 Retrieved scan details: ${scan.id}`);

      // Transform old healthScore format to enhanced format for compatibility
      let healthScore: any = scan.healthScore;
      
      // Check if this is an old format (has sugarScore but no breakdown)
      if (healthScore.sugarScore !== undefined && !healthScore.breakdown) {
        console.log('🔄 Converting old score format to enhanced format');
        healthScore = {
          overallScore: healthScore.overallScore || 0,
          breakdown: {
            sugarScore: healthScore.sugarScore || 0,
            fatScore: healthScore.fatScore || 0,
            sodiumScore: healthScore.sodiumScore || 0,
            calorieScore: healthScore.calorieScore || 0,
            qualityScore: 70, // Default for old scans
          },
          adjustments: {
            sugarTypeBonus: 0,
            fatTypeBonus: 0,
            processingPenalty: 0,
            glycemicPenalty: 0,
            cookingPenalty: 0,
          },
          recommendations: [],
          aiInsights: [],
          warnings: [],
          category: 'Good', // Default category based on score
        };
      }

      // Format AI advice for frontend (matching scan controller structure)
      const aiAdvice = {
        explanation: (healthScore.aiInsights || []).join(' '),
        healthyAlternatives: healthScore.recommendations || [],
        detailedAdvice: healthScore.warnings.length > 0 
          ? `Health concerns: ${healthScore.warnings.join(', ')}`
          : 'No major health concerns detected.',
      };

      res.json({
        success: true,
        scan: {
          id: scan.id,
          scanType: scan.scanType,
          foodName: scan.foodName,
          nutritionData: scan.nutritionData,
          healthScore: healthScore,
          aiAdvice: aiAdvice, // Add AI advice object
          confidenceLevel: scan.confidenceLevel,
          createdAt: scan.createdAt,
          image: scan.image, // Full base64 image
        },
      });
    } catch (error: any) {
      console.error('❌ Error fetching scan details:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch scan details',
      });
    }
  }

  // Save a new scan (called after successful scan)
  async saveScan(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const {
        scanType,
        foodName,
        nutritionData,
        healthScore,
        confidenceLevel,
        image,
      } = req.body;

      const scanRepository = AppDataSource.getRepository(Scan);

      const newScan = scanRepository.create({
        userId,
        scanType,
        foodName,
        nutritionData,
        healthScore,
        confidenceLevel,
        image,
      });

      await scanRepository.save(newScan);

      console.log(`✅ Saved scan to history: ${newScan.id}`);

      res.json({
        success: true,
        scanId: newScan.id,
        message: 'Scan saved to history',
      });
    } catch (error: any) {
      console.error('❌ Error saving scan:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to save scan',
      });
    }
  }
}

export default new HistoryController();
