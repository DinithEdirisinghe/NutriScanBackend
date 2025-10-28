import { Request, Response } from 'express';
import ocrService from '../services/ocr.service';
import advancedScoringService from '../services/advancedScoring.service';
import aiAdviceService from '../services/ai-advice.service';
import foodRecognitionService from '../services/food-recognition.service';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { Scan } from '../entities/Scan.entity';
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

      // Get user entity for personalized scoring
      let user: User | undefined;
      if (req.user?.userId) {
        const userRepository = AppDataSource.getRepository(User);
        const foundUser = await userRepository.findOne({ where: { id: req.user.userId } });
        if (foundUser) user = foundUser;
      }

      // Calculate health score using advanced scoring (uses all 18 health markers)
      const healthScore = advancedScoringService.calculateAdvancedScore(nutritionData, user);

      // Generate AI health advice (convert User to UserProfile for compatibility)
      console.log('🤖 Generating AI health advice...');
      const userProfile = user ? {
        bloodSugarMgDl: user.glucose,
        ldlCholesterolMgDl: user.ldl,
        weightKg: user.weight,
        heightCm: user.height,
      } : undefined;
      
      const aiAdvice = await aiAdviceService.generateHealthAdvice(
        nutritionData,
        healthScore,
        userProfile
      );

      // Save to scan history
      if (req.user?.userId) {
        try {
          const scanRepository = AppDataSource.getRepository(Scan);
          const imageBuffer = fs.readFileSync(imagePath);
          const imageBase64 = imageBuffer.toString('base64');
          
          const newScan = scanRepository.create({
            userId: req.user.userId,
            scanType: 'label',
            image: imageBase64,
            nutritionData,
            healthScore,
          });
          
          await scanRepository.save(newScan);
          console.log('💾 Saved nutrition label scan to history');
        } catch (historyError) {
          console.error('⚠️ Failed to save to history:', historyError);
          // Don't fail the request if history save fails
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(imagePath);
      console.log('🗑️ Cleaned up temporary file');

      // Return results with AI advice
      res.json({
        success: true,
        nutritionData,
        healthScore,
        aiAdvice, // New field!
        message: 'Nutrition label analyzed successfully',
      });

    } catch (error: any) {
      console.error('❌ Error analyzing nutrition label:', error);
      
      // Clean up file if it exists
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      // Provide user-friendly error messages
      let errorMessage = 'Failed to analyze nutrition label';
      let statusCode = 500;
      
      if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('overloaded')) {
        errorMessage = 'AI service is temporarily overloaded. Please try again in a few moments.';
        statusCode = 503;
      } else if (error?.message?.includes('API key')) {
        errorMessage = 'API configuration error. Please contact support.';
        statusCode = 500;
      }

      res.status(statusCode).json({
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
        retryable: statusCode === 503,
      });
    }
  }

  /**
   * POST /api/scan/food-photo
   * Analyze actual food from photo using AI recognition
   */
  async analyzeFoodPhoto(req: AuthRequest, res: Response) {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const imagePath = req.file.path;
      console.log('🍔 Received food photo for analysis:', imagePath);

      // Read image and convert to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      // Recognize food and get nutrition data
      const foodData = await foodRecognitionService.recognizeAndAnalyzeFood(imageBase64);

      // Convert per-100g nutrition to our standard format
      const nutritionData = {
        servingSize: '100g (Estimated)',
        calories: foodData.nutritionPer100g.calories,
        totalFat: foodData.nutritionPer100g.totalFat,
        saturatedFat: foodData.nutritionPer100g.saturatedFat,
        transFat: foodData.nutritionPer100g.transFat,
        cholesterol: foodData.nutritionPer100g.cholesterol,
        sodium: foodData.nutritionPer100g.sodium,
        totalCarbs: foodData.nutritionPer100g.totalCarbs,
        fiber: foodData.nutritionPer100g.fiber,
        sugars: foodData.nutritionPer100g.sugars,
        protein: foodData.nutritionPer100g.protein,
      };

      // Get user entity for personalized scoring
      let user: User | undefined;
      if (req.user?.userId) {
        const userRepository = AppDataSource.getRepository(User);
        const foundUser = await userRepository.findOne({ where: { id: req.user.userId } });
        if (foundUser) user = foundUser;
      }

      // Calculate health score using advanced scoring (uses all 18 health markers)
      const healthScore = advancedScoringService.calculateAdvancedScore(nutritionData, user);

      // Generate AI health advice (convert User to UserProfile for compatibility)
      console.log('🤖 Generating AI health advice...');
      const userProfile = user ? {
        bloodSugarMgDl: user.glucose,
        ldlCholesterolMgDl: user.ldl,
        weightKg: user.weight,
        heightCm: user.height,
      } : undefined;
      
      const aiAdvice = await aiAdviceService.generateHealthAdvice(
        nutritionData,
        healthScore,
        userProfile
      );

      // Save to scan history
      if (req.user?.userId) {
        try {
          const scanRepository = AppDataSource.getRepository(Scan);
          const imageBuffer = fs.readFileSync(imagePath);
          const imageBase64 = imageBuffer.toString('base64');
          
          const newScan = scanRepository.create({
            userId: req.user.userId,
            scanType: 'food',
            foodName: foodData.foodName,
            confidenceLevel: foodData.confidence,
            image: imageBase64,
            nutritionData,
            healthScore,
          });
          
          await scanRepository.save(newScan);
          console.log(`💾 Saved food photo scan to history: ${foodData.foodName}`);
        } catch (historyError) {
          console.error('⚠️ Failed to save to history:', historyError);
          // Don't fail the request if history save fails
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(imagePath);
      console.log('🗑️ Cleaned up temporary file');

      // Return results with food recognition data
      res.json({
        success: true,
        scanType: 'food-photo', // Indicate this is food recognition
        foodName: foodData.foodName,
        confidence: foodData.confidence,
        nutritionData,
        healthScore,
        aiAdvice,
        disclaimer: '⚠️ Nutrition values are estimates based on standard food data. Actual values may vary by preparation method, ingredients, and portion size.',
        message: 'Food photo analyzed successfully',
      });

    } catch (error: any) {
      console.error('❌ Error analyzing food photo:', error);
      
      // Clean up file if it exists
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      // Provide user-friendly error messages
      let errorMessage = 'Failed to analyze food photo';
      let statusCode = 500;
      
      if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('overloaded')) {
        errorMessage = 'AI service is temporarily overloaded. Please try again in a few moments.';
        statusCode = 503;
      } else if (error?.message?.includes('API key')) {
        errorMessage = 'API configuration error. Please contact support.';
        statusCode = 500;
      }

      res.status(statusCode).json({
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
        retryable: statusCode === 503,
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
        foodPhoto: 'POST /api/scan/food-photo - Upload food photo for AI analysis',
      },
    });
  }
}

export default new ScanController();
