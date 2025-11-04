import { User } from '../entities/User.entity';

export interface NutritionData {
  calories?: number;
  totalFat?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  totalCarbohydrates?: number;
  dietaryFiber?: number;
  sugars?: number;
  protein?: number;
  servingSize?: string;
}

export interface HealthScore {
  overallScore: number;
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
  calculateScore(nutritionData: NutritionData, user?: User): HealthScore {
    console.log('🧮 Calculating intelligent health score...');
    
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const sugarScore = this.scoreSugar(
      nutritionData.sugars, 
      nutritionData.dietaryFiber,
      user, 
      warnings, 
      recommendations
    );
    const fatScore = this.scoreFat(
      nutritionData.totalFat,
      nutritionData.saturatedFat, 
      nutritionData.transFat, 
      user, 
      warnings, 
      recommendations
    );
    const sodiumScore = this.scoreSodium(nutritionData.sodium, user, warnings, recommendations);
    const calorieScore = this.scoreCalories(nutritionData.calories, user, warnings, recommendations);

    // New: Apply glycemic impact penalty for diabetics
    const glycemicPenalty = this.calculateGlycemicPenalty(
      nutritionData.totalCarbohydrates,
      nutritionData.dietaryFiber,
      nutritionData.sugars,
      user,
      warnings,
      recommendations
    );

    const weights = this.calculateWeights(user);

    let overallScore = Math.round(
      (sugarScore * weights.sugar) +
      (fatScore * weights.fat) +
      (sodiumScore * weights.sodium) +
      (calorieScore * weights.calorie)
    );

    // Apply glycemic penalty (reduces score for high-carb refined foods)
    overallScore = Math.max(0, overallScore - glycemicPenalty);

    return {
      overallScore,
      breakdown: { sugarScore, fatScore, sodiumScore, calorieScore },
      warnings,
      recommendations,
      category: this.getCategory(overallScore),
    };
  }

  private calculateWeights(user?: User) {
    if (!user || user.isHealthy) {
      return { sugar: 0.25, fat: 0.25, sodium: 0.25, calorie: 0.25 };
    }

    const weights = { sugar: 0.25, fat: 0.25, sodium: 0.25, calorie: 0.25 };

    // Increase sugar weight for diabetics (more important than other factors)
    if (user.hasDiabetes) weights.sugar = 0.55;
    if (user.hasHighCholesterol) weights.fat = 0.40;
    if (user.hasHighBloodPressure) weights.sodium = 0.40;
    
    if (user.bmiCategory === 'Obese') weights.calorie = 0.40;
    else if (user.bmiCategory === 'Overweight') weights.calorie = 0.35;
    else if (user.bmiCategory === 'Underweight') weights.calorie = 0.15;

    const sum = weights.sugar + weights.fat + weights.sodium + weights.calorie;
    return {
      sugar: weights.sugar / sum,
      fat: weights.fat / sum,
      sodium: weights.sodium / sum,
      calorie: weights.calorie / sum,
    };
  }

  private scoreSugar(
    sugars: number | undefined, 
    fiber: number | undefined,
    user: User | undefined, 
    warnings: string[], 
    recommendations: string[]
  ): number {
    if (!sugars || sugars === 0) return 100; // Perfect score for zero sugar

    let score = 100;
    
    // Fiber bonus: Reduces effective sugar impact (fiber slows absorption)
    const effectiveSugar = fiber && fiber > 0 ? Math.max(0, sugars - (fiber * 0.5)) : sugars;
    
    if (user?.hasDiabetes) {
      // Much stricter thresholds for diabetics with fiber consideration
      if (effectiveSugar >= 30) {
        score = 0;
        warnings.push(`🚨 CRITICAL: ${sugars}g sugar - Extremely dangerous for diabetes!`);
        recommendations.push('🩸 Avoid completely - choose sugar-free alternatives');
      } else if (effectiveSugar >= 20) {
        score = Math.max(0, 10 - ((effectiveSugar - 20) * 1));
        warnings.push(`🚨 CRITICAL: ${sugars}g sugar - Very dangerous for diabetes`);
        recommendations.push('🩸 Avoid this food - too much sugar');
      } else if (effectiveSugar >= 10) {
        score = Math.max(10, 40 - ((effectiveSugar - 10) * 3));
        warnings.push(`🚨 High sugar for diabetes: ${sugars}g (Limit: 5g)`);
        recommendations.push('🩸 Choose sugar-free options');
      } else if (effectiveSugar >= 5) {
        score = Math.max(40, 70 - ((effectiveSugar - 5) * 6));
        warnings.push(`⚠️ Moderate sugar: ${sugars}g (Limit: 5g)`);
      } else if (effectiveSugar >= 2) {
        score = 80;
      } else if (effectiveSugar >= 0.5) {
        score = 90;
      } else {
        score = 100;
      }

      // Fiber bonus message
      if (fiber && fiber >= 3) {
        recommendations.push(`✅ Good fiber (${fiber}g) helps slow sugar absorption`);
      }
    } else {
      // Healthy/non-diabetic scoring
      if (effectiveSugar > 40) {
        score = 10;
        warnings.push(`⚠️ Extremely high sugar: ${sugars}g`);
      } else if (effectiveSugar > 25) {
        score = 30;
        warnings.push(`⚠️ Very high sugar: ${sugars}g`);
      } else if (effectiveSugar > 15) {
        score = 50;
        warnings.push(`⚠️ High sugar: ${sugars}g`);
      } else if (effectiveSugar > 8) {
        score = 75;
      } else if (effectiveSugar > 3) {
        score = 90;
      } else {
        score = 100;
      }
    }
    return Math.round(score);
  }

  private scoreFat(
    totalFat: number | undefined,
    saturatedFat: number | undefined, 
    transFat: number | undefined, 
    user: User | undefined, 
    warnings: string[], 
    recommendations: string[]
  ): number {
    let score = 100;

    // Trans fat is always bad (instant penalty)
    if (transFat && transFat > 0) {
      score -= 40;
      warnings.push(`🚨 Contains trans fat: ${transFat}g - Very unhealthy!`);
      recommendations.push('❤️ Avoid foods with trans fats');
    }

    // Evaluate saturated fat (bad fat)
    if (saturatedFat) {
      if (user?.hasHighCholesterol) {
        // Strict for high cholesterol patients
        if (saturatedFat > 5) {
          score -= 60;
          warnings.push(`🚨 Very high saturated fat: ${saturatedFat}g (Limit: 2g)`);
          recommendations.push('❤️ Choose low-fat or fat-free options');
        } else if (saturatedFat > 2) {
          score -= 40;
          warnings.push(`⚠️ High saturated fat: ${saturatedFat}g (Limit: 2g)`);
          recommendations.push('❤️ Reduce saturated fat intake');
        } else if (saturatedFat > 1) {
          score -= 20;
        }
      } else {
        // Standard scoring
        if (saturatedFat > 8) {
          score -= 50;
          warnings.push(`⚠️ Very high saturated fat: ${saturatedFat}g`);
        } else if (saturatedFat > 5) {
          score -= 30;
          warnings.push(`⚠️ High saturated fat: ${saturatedFat}g`);
        } else if (saturatedFat > 3) {
          score -= 15;
        }
      }
    }

    // Evaluate unsaturated fat (good fat - omega-3, omega-6)
    // If total fat is high but saturated fat is low, it's likely healthy fats
    if (totalFat && saturatedFat) {
      const unsaturatedFat = totalFat - saturatedFat - (transFat || 0);
      
      if (unsaturatedFat > 10 && saturatedFat < 3) {
        // High unsaturated fat, low saturated fat = healthy fats (like salmon, avocado, nuts)
        score = Math.min(100, score + 10); // Bonus for healthy fats
        recommendations.push('✅ Contains healthy unsaturated fats (omega-3/omega-6)');
      } else if (unsaturatedFat > 5 && saturatedFat < 2) {
        score = Math.min(100, score + 5);
      }
    }

    return Math.max(0, Math.round(score));
  }

  private scoreSodium(sodium: number | undefined, user: User | undefined, warnings: string[], recommendations: string[]): number {
    if (!sodium) return 75;

    let score = 100;
    if (user?.hasHighBloodPressure) {
      if (sodium > 300) {
        score = Math.max(0, 100 - ((sodium - 300) / 10));
        warnings.push(`🚨 High sodium: ${sodium}mg`);
        recommendations.push('💓 Choose low sodium options');
      } else if (sodium > 200) {
        score = 70;
      } else {
        score = 95;
      }
    } else {
      if (sodium > 600) {
        score = 20;
        warnings.push(`⚠️ Very high sodium: ${sodium}mg`);
      } else if (sodium > 400) {
        score = 50;
      } else if (sodium > 200) {
        score = 75;
      } else {
        score = 95;
      }
    }
    return Math.round(score);
  }

  private scoreCalories(calories: number | undefined, user: User | undefined, warnings: string[], recommendations: string[]): number {
    if (!calories) return 75;

    let score = 100;
    const bmiCategory = user?.bmiCategory;

    if (bmiCategory === 'Obese') {
      if (calories > 250) {
        score = Math.max(0, 100 - ((calories - 250) / 5));
        warnings.push(`🚨 High calories: ${calories} cal`);
        recommendations.push(`⚖️ Low-calorie options recommended (BMI: ${user?.bmi})`);
      } else if (calories > 150) {
        score = 70;
      } else {
        score = 95;
      }
    } else if (bmiCategory === 'Overweight') {
      if (calories > 350) {
        score = Math.max(20, 100 - ((calories - 350) / 8));
        warnings.push(`⚠️ High calories: ${calories} cal`);
      } else if (calories > 250) {
        score = 70;
      } else {
        score = 95;
      }
    } else if (bmiCategory === 'Underweight') {
      if (calories > 600) {
        score = 100;
        recommendations.push(`⚖️ High-calorie foods are beneficial (BMI: ${user?.bmi})`);
      } else if (calories > 400) {
        score = 95;
      } else {
        score = 80;
      }
    } else {
      if (calories > 600) {
        score = 30;
        warnings.push(`⚠️ Very high calories: ${calories} cal`);
      } else if (calories > 400) {
        score = 60;
      } else if (calories > 250) {
        score = 80;
      } else {
        score = 95;
      }
    }
    return Math.round(score);
  }

  private getCategory(score: number): HealthScore['category'] {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Calculate glycemic impact penalty for high-carb refined foods
   * This penalizes foods with high carbs but low fiber (refined/processed carbs)
   * Especially important for diabetics (pasta, white rice, french fries, bagels)
   */
  private calculateGlycemicPenalty(
    totalCarbs: number | undefined,
    fiber: number | undefined,
    sugars: number | undefined,
    user: User | undefined,
    warnings: string[],
    recommendations: string[]
  ): number {
    if (!user?.hasDiabetes || !totalCarbs) return 0;

    // Calculate net carbs (total carbs - fiber)
    const netCarbs = fiber ? totalCarbs - fiber : totalCarbs;
    
    // Calculate non-sugar carbs (starch, refined flour, etc.)
    const starchCarbs = sugars ? netCarbs - sugars : netCarbs;

    // If high starch carbs with low fiber = refined carbs = glycemic spike
    if (starchCarbs > 20 && (!fiber || fiber < 3)) {
      // High refined carbs (pasta, white rice, french fries, bagels)
      const penalty = Math.min(30, Math.round(starchCarbs * 0.8)); // Up to -30 points
      warnings.push(`⚠️ High refined carbs: ${Math.round(starchCarbs)}g (Low fiber: ${fiber || 0}g)`);
      recommendations.push('🩸 Choose whole grain or low-carb alternatives');
      return penalty;
    } else if (starchCarbs > 15 && (!fiber || fiber < 2)) {
      // Moderate refined carbs
      const penalty = Math.min(20, Math.round(starchCarbs * 0.6));
      warnings.push(`⚠️ Moderate refined carbs: ${Math.round(starchCarbs)}g`);
      return penalty;
    } else if (starchCarbs > 30 && fiber && fiber >= 5) {
      // High carbs but also high fiber (whole grains, legumes) - smaller penalty
      const penalty = Math.min(10, Math.round(starchCarbs * 0.2));
      recommendations.push(`ℹ️ High carbs (${Math.round(starchCarbs)}g) but good fiber (${fiber}g)`);
      return penalty;
    }

    return 0;
  }
}

export default new ScoringService();
