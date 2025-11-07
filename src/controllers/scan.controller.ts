import { Request, Response } from 'express';
import enhancedAIService from '../services/enhanced-ai.service';
import optimizedScoringService from '../services/optimized-scoring.service';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { Scan } from '../entities/Scan.entity';
import { AuthRequest } from '../middleware/auth.middleware';
import { normalizeNutrients } from '../utils/serving-size.util';
import fs from 'fs';

export class ScanController {
  /**
   * POST /api/scan/enhanced
   * Enhanced multi-image analysis with AI context (up to 3 images)
   * Uses hybrid AI + formula approach for maximum accuracy
   */
  async analyzeEnhanced(req: AuthRequest, res: Response) {
    const uploadedFiles: string[] = [];
    
    try {
      // Check if files were uploaded (support single or multiple)
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No image files provided. Please upload 1-3 images.' });
      }

      if (files.length > 3) {
        // Clean up all files
        files.forEach(file => fs.existsSync(file.path) && fs.unlinkSync(file.path));
        return res.status(400).json({ error: 'Maximum 3 images allowed' });
      }

      console.log(`🔍 Received ${files.length} image(s) for enhanced analysis`);

      // Convert all images to base64
      const images = files.map(file => {
        uploadedFiles.push(file.path);
        const buffer = fs.readFileSync(file.path);
        return {
          base64: buffer.toString('base64'),
          mimeType: file.mimetype,
        };
      });

      // Use enhanced AI to analyze all images with context
      const enhancedData = await enhancedAIService.analyzeFood(images);

      // Get user for personalized scoring
      let user: User | undefined;
      if (req.user?.userId) {
        const userRepository = AppDataSource.getRepository(User);
        const foundUser = await userRepository.findOne({ where: { id: req.user.userId } });
        if (foundUser) user = foundUser;
      }

      // Calculate OPTIMIZED score using NEW formula with NOVA classification
      const enhancedScore = optimizedScoringService.calculateOptimizedScore(enhancedData, user);
      
      // Also calculate old score for comparison (optional - can remove later)
      // const oldScore = enhancedScoringService.calculateEnhancedScore(enhancedData, user);

      // Save to scan history
      if (req.user?.userId) {
        try {
          const scanRepository = AppDataSource.getRepository(Scan);
          const imageBase64 = images[0].base64; // Save first image
          
          const newScan = scanRepository.create({
            user: { id: req.user.userId } as User,
            scanType: 'enhanced',
            foodName: enhancedData.foodContext.foodName,
            confidenceLevel: enhancedData.foodContext.confidence,
            image: imageBase64,
            nutritionData: {
              calories: enhancedData.calories || 0,
              totalFat: enhancedData.totalFat || 0,
              saturatedFat: enhancedData.saturatedFat || 0,
              transFat: enhancedData.transFat || 0,
              cholesterol: enhancedData.cholesterol || 0,
              sodium: enhancedData.sodium || 0,
              totalCarbs: enhancedData.totalCarbohydrates || 0,
              fiber: enhancedData.dietaryFiber || 0,
              sugars: enhancedData.sugars || 0,
              protein: enhancedData.protein || 0,
              servingSize: enhancedData.servingSize,
            },
            healthScore: {
              // Save the complete optimized score with all fields
              overallScore: enhancedScore.overallScore,
              breakdown: enhancedScore.breakdown,
              recommendations: enhancedScore.recommendations,
              aiInsights: enhancedScore.aiInsights,
              warnings: enhancedScore.warnings,
              category: enhancedScore.category,
              novaGroup: enhancedScore.novaGroup,
              smartWeights: enhancedScore.smartWeights,
            } as any,
          });
          
          await scanRepository.save(newScan);
          console.log(`💾 Saved enhanced scan: ${enhancedData.foodContext.foodName}`);
          
          // Log all extracted values for manual verification
          console.log('\n📋 === EXTRACTED VALUES FOR FORMULA ===');
          console.log('🍽️  Serving Size:', enhancedData.servingSize || 'Not provided');
          console.log('🔥 Calories:', enhancedData.calories || 'Not provided');
          console.log('🥑 Total Fat:', enhancedData.totalFat || 'Not provided', 'g');
          console.log('🧈 Saturated Fat:', enhancedData.saturatedFat || 'Not provided', 'g');
          console.log('⚠️  Trans Fat:', enhancedData.transFat || 'Not provided', 'g');
          console.log('🍳 Cholesterol:', enhancedData.cholesterol || 'Not provided', 'mg');
          console.log('🧂 Sodium:', enhancedData.sodium || 'Not provided', 'mg');
          console.log('🍞 Total Carbs:', enhancedData.totalCarbohydrates || 'Not provided', 'g');
          console.log('🌾 Dietary Fiber:', enhancedData.dietaryFiber || 'Not provided', 'g');
          console.log('🍬 Sugars:', enhancedData.sugars || 'Not provided', 'g');
          console.log('💪 Protein:', enhancedData.protein || 'Not provided', 'g');
          console.log('\n🎯 === FOOD CONTEXT (AI Analysis) ===');
          console.log('📛 Food Name:', enhancedData.foodContext.foodName);
          console.log('✅ Confidence:', enhancedData.foodContext.confidence);
          console.log('🏷️  Category:', enhancedData.foodContext.category);
          console.log('⚙️  Processing Level:', enhancedData.foodContext.processingLevel);
          console.log('🍳 Cooking Method:', enhancedData.foodContext.cookingMethod || 'Not specified');
          console.log('🍭 Sugar Type:', enhancedData.foodContext.sugarType);
          console.log('🥑 Fat Type:', enhancedData.foodContext.fatType);
          console.log('🌾 Carb Type:', enhancedData.foodContext.carbType);
          console.log('📈 Glycemic Impact:', enhancedData.foodContext.glycemicImpact);
          console.log('⭐ Overall Quality:', enhancedData.foodContext.overallQuality);
          console.log('\n🎯 === FINAL SCORES ===');
          console.log('🏆 Overall Score:', enhancedScore.overallScore, '/100');
          console.log('🍬 Sugar Score:', enhancedScore.breakdown.sugarScore, '/100');
          console.log('� Saturated Fat Score:', enhancedScore.breakdown.saturatedFatScore, '/100');
          console.log('⚠️  Trans Fat Score:', enhancedScore.breakdown.transFatScore, '/100');
          console.log('🧂 Sodium Score:', enhancedScore.breakdown.sodiumScore, '/100');
          console.log('🔥 Calorie Score:', enhancedScore.breakdown.calorieScore, '/100');
          console.log('💪 Protein Score:', enhancedScore.breakdown.proteinScore, '/100');
          console.log('🌾 Fiber Score:', enhancedScore.breakdown.fiberScore, '/100');
          console.log('💎 Micronutrient Score:', enhancedScore.breakdown.micronutrientScore, '/100');
          console.log('📊 Category:', enhancedScore.category);
          console.log('🏷️  NOVA Group:', enhancedScore.novaGroup);
          console.log('=======================================\n');

          // ========== COMPREHENSIVE SCORE BREAKDOWN ==========
          console.log('\n╔════════════════════════════════════════════════════════════════╗');
          console.log('║           📊 DETAILED SCORE CALCULATION BREAKDOWN              ║');
          console.log('╚════════════════════════════════════════════════════════════════╝\n');

          // Get normalized values (per 100g/100ml)
          const normalized = normalizeNutrients(
            {
              calories: enhancedData.calories,
              totalFat: enhancedData.totalFat,
              saturatedFat: enhancedData.saturatedFat,
              transFat: enhancedData.transFat,
              cholesterol: enhancedData.cholesterol,
              sodium: enhancedData.sodium,
              totalCarbs: enhancedData.totalCarbohydrates,
              fiber: enhancedData.dietaryFiber,
              sugars: enhancedData.sugars,
              protein: enhancedData.protein,
            },
            enhancedData.servingSize
          );

          // Section 1: Normalized Values
          console.log('┌─────────────────────────────────────────────────────────────┐');
          console.log('│  📏 NORMALIZED VALUES (PER 100G/100ML)                       │');
          console.log('│  These are the standardized values used in calculations     │');
          console.log('└─────────────────────────────────────────────────────────────┘');
          console.log('  🔥 Calories:       ', normalized.calories?.toFixed(1) || '0.0', 'kcal');
          console.log('  🥑 Total Fat:      ', normalized.totalFat?.toFixed(2) || '0.00', 'g');
          console.log('  🧈 Saturated Fat:  ', normalized.saturatedFat?.toFixed(2) || '0.00', 'g');
          console.log('  ⚠️  Trans Fat:      ', normalized.transFat?.toFixed(2) || '0.00', 'g');
          console.log('  🧂 Sodium:         ', normalized.sodium?.toFixed(2) || '0.00', 'mg');
          console.log('  🍬 Sugars:         ', normalized.sugars?.toFixed(2) || '0.00', 'g');
          console.log('  🍞 Total Carbs:    ', normalized.totalCarbs?.toFixed(2) || '0.00', 'g');
          console.log('  🌾 Fiber:          ', normalized.fiber?.toFixed(2) || '0.00', 'g');
          console.log('  💪 Protein:        ', normalized.protein?.toFixed(2) || '0.00', 'g\n');

          // Section 2: Component Scores
          console.log('┌─────────────────────────────────────────────────────────────┐');
          console.log('│  🎯 COMPONENT SCORES (0-100) - 8 COMPONENTS (OPTIMIZED)     │');
          console.log('│  Individual scores for each nutritional aspect              │');
          console.log('└─────────────────────────────────────────────────────────────┘');
          
          const scores = enhancedScore.breakdown;
          const formatScore = (score: number, label: string, emoji: string) => {
            const bar = '█'.repeat(Math.floor(score / 5));
            const empty = '░'.repeat(20 - Math.floor(score / 5));
            const rating = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : score >= 20 ? 'Poor' : 'Very Poor';
            console.log(`  ${emoji} ${label.padEnd(18)} ${String(score).padStart(3)}/100 │${bar}${empty}│ ${rating}`);
          };

          formatScore(scores.sugarScore, 'Sugar', '🍬');
          formatScore(scores.saturatedFatScore, 'Saturated Fat', '🧈');
          formatScore(scores.transFatScore, 'Trans Fat', '⚠️');
          formatScore(scores.sodiumScore, 'Sodium', '🧂');
          formatScore(scores.calorieScore, 'Calorie', '🔥');
          formatScore(scores.proteinScore, 'Protein', '💪');
          formatScore(scores.fiberScore, 'Fiber', '🌾');
          formatScore(scores.micronutrientScore, 'Micronutrients', '💎');
          console.log('');

          // Section 3: Weighted Calculation
          console.log('┌─────────────────────────────────────────────────────────────┐');
          console.log('│  ⚖️  WEIGHTED CALCULATION - 8 COMPONENTS (NOVA-BASED)        │');
          console.log('│  Smart weights based on food processing level & health      │');
          console.log('└─────────────────────────────────────────────────────────────┘');

          // Use smart weights from the optimized scoring
          const weights = enhancedScore.smartWeights;

          console.log(`  🏷️  NOVA Group: ${enhancedScore.novaGroup} - ${this.getNOVADescriptionForLog(enhancedScore.novaGroup)}`);
          console.log('');

          const weightedScores = {
            sugar: scores.sugarScore * weights.sugar,
            saturatedFat: scores.saturatedFatScore * weights.saturatedFat,
            transFat: scores.transFatScore * weights.transFat,
            sodium: scores.sodiumScore * weights.sodium,
            calorie: scores.calorieScore * weights.calorie,
            protein: scores.proteinScore * weights.protein,
            fiber: scores.fiberScore * weights.fiber,
            micronutrient: scores.micronutrientScore * weights.micronutrient,
          };

          console.log(`  🍬 Sugar:        ${scores.sugarScore.toString().padStart(3)}/100 × ${(weights.sugar * 100).toFixed(0).padStart(2)}% = ${weightedScores.sugar.toFixed(1).padStart(5)}`);
          console.log(`  � Saturated Fat:${scores.saturatedFatScore.toString().padStart(3)}/100 × ${(weights.saturatedFat * 100).toFixed(0).padStart(2)}% = ${weightedScores.saturatedFat.toFixed(1).padStart(5)}`);
          console.log(`  ⚠️  Trans Fat:    ${scores.transFatScore.toString().padStart(3)}/100 × ${(weights.transFat * 100).toFixed(0).padStart(2)}% = ${weightedScores.transFat.toFixed(1).padStart(5)}`);
          console.log(`  🧂 Sodium:       ${scores.sodiumScore.toString().padStart(3)}/100 × ${(weights.sodium * 100).toFixed(0).padStart(2)}% = ${weightedScores.sodium.toFixed(1).padStart(5)}`);
          console.log(`  🔥 Calorie:      ${scores.calorieScore.toString().padStart(3)}/100 × ${(weights.calorie * 100).toFixed(0).padStart(2)}% = ${weightedScores.calorie.toFixed(1).padStart(5)}`);
          console.log(`  💪 Protein:      ${scores.proteinScore.toString().padStart(3)}/100 × ${(weights.protein * 100).toFixed(0).padStart(2)}% = ${weightedScores.protein.toFixed(1).padStart(5)}`);
          console.log(`  🌾 Fiber:        ${scores.fiberScore.toString().padStart(3)}/100 × ${(weights.fiber * 100).toFixed(0).padStart(2)}% = ${weightedScores.fiber.toFixed(1).padStart(5)}`);
          console.log(`  💎 Micronutrient:${scores.micronutrientScore.toString().padStart(3)}/100 × ${(weights.micronutrient * 100).toFixed(0).padStart(2)}% = ${weightedScores.micronutrient.toFixed(1).padStart(5)}`);
          console.log('  ─────────────────────────────────────────────────');
          const subtotal = Object.values(weightedScores).reduce((a, b) => a + b, 0);
          console.log(`  📊 FINAL SCORE:                       ${subtotal.toFixed(1).padStart(5)}/100\n`);

          // Section 4: NOVA Classification & Smart Weighting
          console.log('┌─────────────────────────────────────────────────────────────┐');
          console.log('│  🏷️  NOVA CLASSIFICATION & SMART WEIGHTING                   │');
          console.log('│  Weights automatically adjusted based on food processing    │');
          console.log('└─────────────────────────────────────────────────────────────┘');

          const adj = enhancedScore.adjustments;
          
          console.log(`  🏷️  NOVA Group: ${enhancedScore.novaGroup}`);
          console.log(`  � Description: ${this.getNOVADescriptionForLog(enhancedScore.novaGroup)}`);
          console.log(`  ⚖️  Weight Strategy: ${this.getWeightStrategyDescription(enhancedScore.novaGroup)}`);
          
          if (user && !user.isHealthy) {
            console.log('\n  🏥 Health Condition Adjustments:');
            if (user.hasDiabetes) {
              console.log('     � Diabetic: Sugar & fiber weights increased');
            }
            if (user.hasHighCholesterol) {
              console.log('     � High Cholesterol: Fat weights increased');
            }
            if (user.hasHighBloodPressure) {
              console.log('     🩺 High BP: Sodium weight increased');
            }
            if (user.bmiCategory === 'Obese' || user.bmiCategory === 'Overweight') {
              console.log('     ⚖️  Weight Management: Calorie, protein, fiber adjusted');
            } else if (user.bmiCategory === 'Underweight') {
              console.log('     📈 Underweight: Protein weight increased, calories relaxed');
            }
          }
          
          console.log('\n  ✅ No arbitrary bonuses/penalties - all logic integrated into smart weights');
          console.log('');

          // Section 5: Final Score
          console.log('┌─────────────────────────────────────────────────────────────┐');
          console.log('│  🏆 FINAL OPTIMIZED SCORE                                    │');
          console.log('└─────────────────────────────────────────────────────────────┘');
          
          console.log(`  Score: ${enhancedScore.overallScore}/100`);
          console.log(`  Category: ${enhancedScore.category.toUpperCase()}`);
          console.log(`  Formula: NEW OPTIMIZED (8 components, NOVA-based)`);
          console.log('\n╔════════════════════════════════════════════════════════════════╗\n');

        } catch (historyError) {
          console.error('⚠️ Failed to save to history:', historyError);
        }
      }

      // Clean up uploaded files
      uploadedFiles.forEach(path => {
        if (fs.existsSync(path)) fs.unlinkSync(path);
      });
      console.log('🗑️ Cleaned up temporary files');

      // Format AI advice for frontend
      const aiAdvice = {
        explanation: enhancedScore.aiInsights.join(' '),
        healthyAlternatives: enhancedScore.recommendations,
        detailedAdvice: `Based on AI analysis, this food is ${enhancedData.foodContext.processingLevel} with ${enhancedData.foodContext.overallQuality} quality. ${enhancedScore.warnings.length > 0 ? 'Health concerns: ' + enhancedScore.warnings.join(', ') : 'No major health concerns detected.'}`,
      };

      // Return enhanced results
      res.json({
        success: true,
        scanType: 'enhanced-ai',
        imagesAnalyzed: files.length,
        
        // Food identification
        foodName: enhancedData.foodContext.foodName,
        confidence: enhancedData.foodContext.confidence,
        category: enhancedData.foodContext.category,
        
        // Nutrition data
        nutritionData: {
          calories: enhancedData.calories,
          totalFat: enhancedData.totalFat,
          saturatedFat: enhancedData.saturatedFat,
          transFat: enhancedData.transFat,
          cholesterol: enhancedData.cholesterol,
          sodium: enhancedData.sodium,
          totalCarbohydrates: enhancedData.totalCarbohydrates,
          dietaryFiber: enhancedData.dietaryFiber,
          sugars: enhancedData.sugars,
          protein: enhancedData.protein,
          servingSize: enhancedData.servingSize,
        },
        
        // AI-powered context
        foodContext: enhancedData.foodContext,
        
        // Enhanced health score
        healthScore: enhancedScore,
        
        // AI advice formatted for frontend
        aiAdvice: aiAdvice,
        
        message: 'Food analyzed successfully with AI-enhanced intelligence',
      });

    } catch (error: any) {
      console.error('❌ Error in enhanced analysis:', error);
      
      // Clean up uploaded files
      uploadedFiles.forEach(path => {
        if (fs.existsSync(path)) fs.unlinkSync(path);
      });

      let errorMessage = 'Failed to analyze food images';
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
        enhanced: 'POST /api/scan/enhanced - Upload 1-3 images for AI-enhanced analysis',
      },
    });
  }

  /**
   * Helper method to get NOVA description for logging
   */
  private getNOVADescriptionForLog(group: 1 | 2 | 3 | 4): string {
    switch (group) {
      case 1: return 'Unprocessed/Minimally Processed Foods';
      case 2: return 'Processed Culinary Ingredients';
      case 3: return 'Processed Foods';
      case 4: return 'Ultra-Processed Foods';
    }
  }

  /**
   * Helper method to describe weight strategy
   */
  private getWeightStrategyDescription(group: 1 | 2 | 3 | 4): string {
    switch (group) {
      case 1: return 'Relaxed scoring - rewards nutrients, minimal penalties';
      case 2: return 'Moderate scoring - balanced approach';
      case 3: return 'Standard scoring - balanced penalties';
      case 4: return 'Strict scoring - heavy penalties on unhealthy components';
    }
  }
}

export default new ScanController();
