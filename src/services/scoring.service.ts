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
   * Uses DYNAMIC WEIGHTS based on user's health risks
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

    // Assess user's health risks
    const healthRisks = this.assessHealthRisks(userProfile);
    console.log('🏥 Health risks identified:', healthRisks);

    // Score each component (0-100, higher is better)
    const sugarScore = this.scoreSugar(nutritionData.sugars, userProfile, healthRisks, warnings, recommendations);
    const fatScore = this.scoreFat(nutritionData.saturatedFat, nutritionData.transFat, userProfile, healthRisks, warnings, recommendations);
    const sodiumScore = this.scoreSodium(nutritionData.sodium, healthRisks, warnings, recommendations);
    const calorieScore = this.scoreCalories(nutritionData.calories, userProfile, healthRisks, warnings, recommendations);

    // Calculate DYNAMIC weights based on user's health risks
    const weights = this.calculateDynamicWeights(healthRisks);
    console.log('⚖️ Dynamic weights applied:', weights);

    // Calculate weighted overall score with personalized weights
    const overallScore = Math.round(
      (sugarScore * weights.sugar) +
      (fatScore * weights.fat) +
      (sodiumScore * weights.sodium) +
      (calorieScore * weights.calorie)
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
   * Assess user's health risks based on medical data
   */
  private assessHealthRisks(userProfile?: HealthProfile): {
    hasHighBloodSugar: boolean;
    hasDiabetes: boolean;
    hasHighCholesterol: boolean;
    hasVeryHighCholesterol: boolean;
    isOverweight: boolean;
    isObese: boolean;
    bmi?: number;
  } {
    const risks = {
      hasHighBloodSugar: false,
      hasDiabetes: false,
      hasHighCholesterol: false,
      hasVeryHighCholesterol: false,
      isOverweight: false,
      isObese: false,
      bmi: undefined as number | undefined,
    };

    if (!userProfile) return risks;

    // Blood Sugar Assessment
    if (userProfile.bloodSugarMgDl) {
      const bloodSugar = userProfile.bloodSugarMgDl;
      risks.hasHighBloodSugar = bloodSugar >= 100; // Pre-diabetes range
      risks.hasDiabetes = bloodSugar >= 126; // Diabetes range
    }

    // LDL Cholesterol Assessment
    if (userProfile.ldlCholesterolMgDl) {
      const ldl = userProfile.ldlCholesterolMgDl;
      risks.hasHighCholesterol = ldl >= 130; // Borderline high
      risks.hasVeryHighCholesterol = ldl >= 160; // High
    }

    // BMI Assessment (Weight/Height)
    if (userProfile.weightKg && userProfile.heightCm) {
      const heightM = userProfile.heightCm / 100;
      const bmi = userProfile.weightKg / (heightM * heightM);
      risks.bmi = Math.round(bmi * 10) / 10;
      risks.isOverweight = bmi >= 25; // Overweight
      risks.isObese = bmi >= 30; // Obese
    }

    return risks;
  }

  /**
   * Calculate dynamic weights based on user's health priorities
   * Higher risk = higher weight for that component
   */
  private calculateDynamicWeights(healthRisks: ReturnType<typeof this.assessHealthRisks>): {
    sugar: number;
    fat: number;
    sodium: number;
    calorie: number;
  } {
    // Default weights (sum = 1.0)
    let weights = {
      sugar: 0.25,
      fat: 0.25,
      sodium: 0.25,
      calorie: 0.25,
    };

    let totalBoost = 0;

    // PRIORITY 1: Diabetes/High Blood Sugar → Boost sugar weight heavily
    if (healthRisks.hasDiabetes) {
      weights.sugar = 0.50; // 50% weight
      totalBoost += 0.25;
      console.log('🩸 DIABETES DETECTED: Sugar score heavily prioritized (50%)');
    } else if (healthRisks.hasHighBloodSugar) {
      weights.sugar = 0.40; // 40% weight
      totalBoost += 0.15;
      console.log('⚠️ High blood sugar: Sugar score prioritized (40%)');
    }

    // PRIORITY 2: High Cholesterol → Boost fat weight
    if (healthRisks.hasVeryHighCholesterol) {
      weights.fat = 0.45; // 45% weight
      totalBoost += 0.20;
      console.log('❤️ VERY HIGH LDL: Fat score heavily prioritized (45%)');
    } else if (healthRisks.hasHighCholesterol) {
      weights.fat = 0.35; // 35% weight
      totalBoost += 0.10;
      console.log('⚠️ High LDL: Fat score prioritized (35%)');
    }

    // PRIORITY 3: Obesity → Boost calorie weight
    if (healthRisks.isObese) {
      weights.calorie = 0.40; // 40% weight
      totalBoost += 0.15;
      console.log('⚖️ OBESITY: Calorie score heavily prioritized (40%)');
    } else if (healthRisks.isOverweight) {
      weights.calorie = 0.30; // 30% weight
      totalBoost += 0.05;
      console.log('⚠️ Overweight: Calorie score prioritized (30%)');
    }

    // Redistribute remaining weight proportionally
    if (totalBoost > 0) {
      const remainingWeight = 1.0 - weights.sugar - weights.fat - weights.calorie;
      weights.sodium = Math.max(0.10, remainingWeight); // At least 10% for sodium
      
      // Normalize to ensure sum = 1.0
      const sum = weights.sugar + weights.fat + weights.sodium + weights.calorie;
      weights.sugar /= sum;
      weights.fat /= sum;
      weights.sodium /= sum;
      weights.calorie /= sum;
    }

    return weights;
  }

  /**
   * Score sugar content (0-100)
   * Stricter scoring for users with high blood sugar/diabetes
   */
  private scoreSugar(
    sugars: number | undefined,
    userProfile: HealthProfile | undefined,
    healthRisks: ReturnType<typeof this.assessHealthRisks>,
    warnings: string[],
    recommendations: string[]
  ): number {
    if (!sugars) return 50; // Neutral if no data

    let score = 100;

    // Stricter thresholds for diabetic users
    if (healthRisks.hasDiabetes) {
      if (sugars > 5) {
        score = Math.max(0, 100 - ((sugars - 5) / 5) * 80);
        warnings.push(`🚨 CRITICAL: ${sugars}g sugar - Unsafe for diabetes (Limit: 5g)`);
        recommendations.push('🩸 Choose sugar-free options - you have diabetes');
      } else if (sugars > 3) {
        score = 70;
        warnings.push(`⚠️ Moderate sugar: ${sugars}g (Limit for diabetes: 5g/serving)`);
      }
      recommendations.push('💡 Monitor blood sugar levels after consuming this product');
    } else if (healthRisks.hasHighBloodSugar) {
      if (sugars > 10) {
        score = Math.max(20, 100 - ((sugars - 10) / 10) * 60);
        warnings.push(`⚠️ High sugar: ${sugars}g - Risky with elevated blood sugar (Limit: 10g)`);
        recommendations.push('🩸 Reduce sugar intake - you have pre-diabetes risk');
      } else if (sugars > 7) {
        score = 60;
        warnings.push(`⚠️ Moderate sugar: ${sugars}g`);
      }
    } else {
      // Normal users
      if (sugars > 20) {
        score = 20;
        warnings.push(`⚠️ Very high sugar: ${sugars}g`);
      } else if (sugars > 12) {
        score = 50;
        warnings.push(`⚠️ High sugar: ${sugars}g`);
      } else if (sugars > 5) {
        score = 80;
      }
    }

    if (sugars > 10) {
      recommendations.push('💡 Look for "no added sugar" or "sugar-free" alternatives');
    }

    return Math.round(score);
  }

  /**
   * Score fat content (0-100)
   * Stricter scoring for users with high cholesterol
   */
  private scoreFat(
    saturatedFat: number | undefined,
    transFat: number | undefined,
    userProfile: HealthProfile | undefined,
    healthRisks: ReturnType<typeof this.assessHealthRisks>,
    warnings: string[],
    recommendations: string[]
  ): number {
    let score = 100;

    // Trans fat should ALWAYS be 0
    if (transFat && transFat > 0) {
      score -= 30;
      warnings.push(`⚠️ Contains trans fat: ${transFat}g (Should be 0g)`);
      recommendations.push('💡 Avoid trans fats - they increase heart disease risk');
      
      if (healthRisks.hasHighCholesterol) {
        warnings.push('🚨 CRITICAL: Trans fat is especially dangerous with high cholesterol!');
      }
    }

    // Stricter saturated fat scoring for high cholesterol users
    if (saturatedFat) {
      if (healthRisks.hasVeryHighCholesterol) {
        // Very strict for very high LDL (>160)
        if (saturatedFat > 1) {
          score -= 60;
          warnings.push(`🚨 CRITICAL: ${saturatedFat}g saturated fat - Unsafe with very high LDL (Limit: 1g)`);
          recommendations.push('❤️ Choose fat-free or very low-fat options - you have very high cholesterol');
        } else if (saturatedFat > 0.5) {
          score -= 30;
          warnings.push(`⚠️ Moderate saturated fat: ${saturatedFat}g (Limit: 1g for high LDL)`);
        }
      } else if (healthRisks.hasHighCholesterol) {
        // Strict for high LDL (130-160)
        if (saturatedFat > 2) {
          score -= 50;
          warnings.push(`🚨 High saturated fat: ${saturatedFat}g - Risky with high LDL (Limit: 2g)`);
          recommendations.push('❤️ Reduce saturated fat - you have borderline high cholesterol');
        } else if (saturatedFat > 1) {
          score -= 25;
          warnings.push(`⚠️ Moderate saturated fat: ${saturatedFat}g`);
        }
      } else {
        // Normal users
        if (saturatedFat > 5) {
          score -= 40;
          warnings.push(`⚠️ High saturated fat: ${saturatedFat}g`);
        } else if (saturatedFat > 3) {
          score -= 20;
          warnings.push(`⚠️ Moderate saturated fat: ${saturatedFat}g`);
        }
      }

      if (saturatedFat > 2 || healthRisks.hasHighCholesterol) {
        recommendations.push('💡 Choose products with < 1g saturated fat per serving');
      }
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Score sodium content (0-100)
   */
  private scoreSodium(
    sodium: number | undefined,
    healthRisks: ReturnType<typeof this.assessHealthRisks>,
    warnings: string[],
    recommendations: string[]
  ): number {
    if (!sodium) return 50;

    let score = 100;
    const lowSodiumLimit = 140;
    const moderateLimit = 400;
    const highLimit = 600;

    if (sodium > highLimit) {
      score = 0;
      warnings.push(`⚠️ Very high sodium: ${sodium}mg`);
    } else if (sodium > moderateLimit) {
      score = 40;
      warnings.push(`⚠️ High sodium: ${sodium}mg`);
    } else if (sodium > lowSodiumLimit) {
      score = 70;
      warnings.push(`⚠️ Moderate sodium: ${sodium}mg`);
    }

    if (sodium > lowSodiumLimit) {
      recommendations.push('💡 Look for "low sodium" (< 140mg) or "no salt added" options');
    }

    return Math.round(score);
  }

  /**
   * Score calorie content (0-100)
   * Stricter scoring for overweight/obese users
   */
  private scoreCalories(
    calories: number | undefined,
    userProfile: HealthProfile | undefined,
    healthRisks: ReturnType<typeof this.assessHealthRisks>,
    warnings: string[],
    recommendations: string[]
  ): number {
    if (!calories) return 50;

    let score = 100;

    // Stricter calorie limits for obese users
    if (healthRisks.isObese) {
      if (calories > 300) {
        score = Math.max(20, 100 - ((calories - 300) / 300) * 60);
        warnings.push(`⚠️ High calories: ${calories} cal - Risky for weight management (Limit: 300 cal)`);
        recommendations.push(`⚖️ Focus on low-calorie options - your BMI is ${healthRisks.bmi} (obese range)`);
      } else if (calories > 200) {
        score = 60;
        warnings.push(`⚠️ Moderate calories: ${calories} cal`);
      }
      recommendations.push('💡 Consider portion sizes and calorie density');
    } else if (healthRisks.isOverweight) {
      if (calories > 400) {
        score = Math.max(30, 100 - ((calories - 400) / 400) * 50);
        warnings.push(`⚠️ High calories: ${calories} cal (Limit for weight control: 400 cal)`);
        recommendations.push(`⚖️ Watch portion sizes - your BMI is ${healthRisks.bmi} (overweight)`);
      } else if (calories > 300) {
        score = 70;
      }
    } else {
      // Normal users
      if (calories > 600) {
        score = Math.max(20, 100 - ((calories - 600) / 600) * 60);
        warnings.push(`⚠️ Very high calories: ${calories} cal`);
      } else if (calories > 400) {
        score = 60;
        warnings.push(`⚠️ High calories: ${calories} cal`);
      } else if (calories > 300) {
        score = 80;
      }
    }

    if (calories > 400 || healthRisks.isOverweight) {
      recommendations.push('💡 Consider portion control or lower-calorie alternatives');
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
