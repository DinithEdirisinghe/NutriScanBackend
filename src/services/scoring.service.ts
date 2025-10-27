import { NutritionData } from './ocr.service';

export interface HealthProfile {
  bloodSugarMgDl?: number;
  ldlCholesterolMgDl?: number;
  weightKg?: number;
  heightCm?: number;
}

export interface HealthScore {
  overallScore: number; // 0-100
  breakdown: {
    sugarScore: number;
    fatScore: number;
    sodiumScore: number;
    calorieScore: number;
  };
  warnings: string[];
  recommendations: string[];
  category: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
}

export class ScoringService {
  /**
   * Calculate health score based on nutrition data and user profile
   */
  calculateScore(
    nutritionData: NutritionData,
    userProfile?: HealthProfile
  ): HealthScore {
    console.log('🧮 Calculating health score...');
    console.log('📊 Nutrition data:', nutritionData);
    console.log('👤 User profile:', userProfile);

    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Score each component (0-100, higher is better)
    const sugarScore = this.scoreSugar(nutritionData.sugars, userProfile, warnings, recommendations);
    const fatScore = this.scoreFat(nutritionData.saturatedFat, nutritionData.transFat, warnings, recommendations);
    const sodiumScore = this.scoreSodium(nutritionData.sodium, warnings, recommendations);
    const calorieScore = this.scoreCalories(nutritionData.calories, warnings, recommendations);

    // Calculate weighted overall score
    const overallScore = Math.round(
      (sugarScore * 0.3) +      // Sugar: 30%
      (fatScore * 0.25) +        // Fat: 25%
      (sodiumScore * 0.25) +     // Sodium: 25%
      (calorieScore * 0.2)       // Calories: 20%
    );

    const category = this.getCategory(overallScore);

    const result: HealthScore = {
      overallScore,
      breakdown: {
        sugarScore,
        fatScore,
        sodiumScore,
        calorieScore,
      },
      warnings,
      recommendations,
      category,
    };

    console.log('✅ Score calculated:', result);
    return result;
  }

  /**
   * Score sugar content (0-100)
   */
  private scoreSugar(
    sugars: number | undefined,
    userProfile: HealthProfile | undefined,
    warnings: string[],
    recommendations: string[]
  ): number {
    if (!sugars) return 50; // Neutral if no data

    // WHO recommends < 25g per day for adults
    const dailyLimit = 25;
    
    // Adjust for diabetic/pre-diabetic users
    const hasHighBloodSugar = userProfile?.bloodSugarMgDl && userProfile.bloodSugarMgDl > 100;
    const adjustedLimit = hasHighBloodSugar ? dailyLimit * 0.7 : dailyLimit;

    let score = 100;

    if (sugars > adjustedLimit) {
      score = Math.max(0, 100 - ((sugars - adjustedLimit) / adjustedLimit) * 100);
      warnings.push(`⚠️ High sugar content: ${sugars}g (Limit: ${Math.round(adjustedLimit)}g/day)`);
      
      if (hasHighBloodSugar) {
        warnings.push('🩸 Extra caution: You have elevated blood sugar levels');
      }
    }

    if (sugars > 15) {
      recommendations.push('💡 Look for "no added sugar" alternatives');
    }

    return Math.round(score);
  }

  /**
   * Score fat content (0-100)
   */
  private scoreFat(
    saturatedFat: number | undefined,
    transFat: number | undefined,
    warnings: string[],
    recommendations: string[]
  ): number {
    let score = 100;

    // Trans fat should be 0
    if (transFat && transFat > 0) {
      score -= 30;
      warnings.push(`⚠️ Contains trans fat: ${transFat}g (Should be 0g)`);
      recommendations.push('💡 Avoid products with trans fats - they increase heart disease risk');
    }

    // Saturated fat: < 2g per serving is good
    if (saturatedFat) {
      if (saturatedFat > 5) {
        score -= 40;
        warnings.push(`⚠️ High saturated fat: ${saturatedFat}g`);
      } else if (saturatedFat > 2) {
        score -= 20;
        warnings.push(`⚠️ Moderate saturated fat: ${saturatedFat}g`);
      }
    }

    if (saturatedFat && saturatedFat > 2) {
      recommendations.push('💡 Choose products with < 2g saturated fat per serving');
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Score sodium content (0-100)
   */
  private scoreSodium(
    sodium: number | undefined,
    warnings: string[],
    recommendations: string[]
  ): number {
    if (!sodium) return 50;

    // FDA recommends < 2300mg per day
    const dailyLimit = 2300;
    const perServingLimit = 200; // Low sodium = < 140mg, we use 200mg as threshold

    let score = 100;

    if (sodium > perServingLimit) {
      score = Math.max(0, 100 - ((sodium - perServingLimit) / perServingLimit) * 100);
      
      if (sodium > 400) {
        warnings.push(`⚠️ Very high sodium: ${sodium}mg`);
      } else {
        warnings.push(`⚠️ High sodium: ${sodium}mg`);
      }
      
      recommendations.push('💡 Look for "low sodium" or "no salt added" options');
    }

    return Math.round(score);
  }

  /**
   * Score calorie content (0-100)
   */
  private scoreCalories(
    calories: number | undefined,
    warnings: string[],
    recommendations: string[]
  ): number {
    if (!calories) return 50;

    // Average meal should be around 400-600 calories
    // Snacks should be < 200 calories
    let score = 100;

    if (calories > 600) {
      score = Math.max(0, 100 - ((calories - 600) / 600) * 100);
      warnings.push(`⚠️ High calorie content: ${calories} cal`);
      recommendations.push('💡 Consider portion control or lower-calorie alternatives');
    } else if (calories > 400) {
      score = 80;
    }

    return Math.round(score);
  }

  /**
   * Get category based on overall score
   */
  private getCategory(score: number): HealthScore['category'] {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  }
}

export default new ScoringService();
