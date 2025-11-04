import { EnhancedNutritionData } from './enhanced-ai.service';
import { User } from '../entities/User.entity';
import { normalizeNutrients, NormalizedNutrients } from '../utils/serving-size.util';

export interface EnhancedHealthScore {
  overallScore: number;
  breakdown: {
    sugarScore: number;
    fatScore: number;
    sodiumScore: number;
    calorieScore: number;
    qualityScore: number; // NEW: Based on processing level, cooking method
  };
  adjustments: {
    sugarTypeBonus: number; // Natural sugar bonus
    fatTypeBonus: number; // Healthy fat bonus
    processingPenalty: number; // Ultra-processed penalty
    glycemicPenalty: number; // Refined carbs penalty
    cookingPenalty: number; // Fried food penalty
  };
  warnings: string[];
  recommendations: string[];
  category: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
  aiInsights: string[]; // NEW: AI-generated insights
}

export class EnhancedScoringService {
  
  calculateEnhancedScore(data: EnhancedNutritionData, user?: User): EnhancedHealthScore {
    console.log('🧠 Calculating AI-enhanced health score...');
    
    // ⭐ NORMALIZE ALL NUTRIENTS TO PER-100G/100ML BEFORE SCORING
    console.log('📏 Normalizing nutrients to per-100g/100ml...');
    const normalizedData = normalizeNutrients(
      {
        calories: data.calories,
        totalFat: data.totalFat,
        saturatedFat: data.saturatedFat,
        transFat: data.transFat,
        cholesterol: data.cholesterol,
        sodium: data.sodium,
        totalCarbs: data.totalCarbohydrates,
        fiber: data.dietaryFiber,
        sugars: data.sugars,
        protein: data.protein,
      },
      data.servingSize
    );

    console.log('📊 Original values:', {
      servingSize: data.servingSize,
      sugars: data.sugars,
      totalFat: data.totalFat,
      sodium: data.sodium,
      calories: data.calories,
    });
    console.log('📊 Normalized values (per 100g/100ml):', normalizedData);
    
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const aiInsights: string[] = [];

    // Add AI's own assessment
    aiInsights.push(`Food: ${data.foodContext.foodName}`);
    aiInsights.push(`AI Quality Assessment: ${data.foodContext.overallQuality.toUpperCase()}`);
    aiInsights.push(`Reasoning: ${data.foodContext.qualityReasoning}`);

    // Calculate base scores with NORMALIZED values
    const sugarScore = this.scoreSugarEnhanced(
      normalizedData.sugars,
      normalizedData.fiber,
      data.foodContext,
      user,
      warnings,
      recommendations,
      aiInsights
    );

    const fatScore = this.scoreFatEnhanced(
      normalizedData.totalFat,
      normalizedData.saturatedFat,
      normalizedData.transFat,
      data.foodContext,
      user,
      warnings,
      recommendations,
      aiInsights
    );

    const sodiumScore = this.scoreSodium(normalizedData.sodium, user, warnings, recommendations);
    const calorieScore = this.scoreCalories(normalizedData.calories, user, warnings, recommendations);

    // NEW: Quality score based on processing and preparation
    const qualityScore = this.scoreQuality(data.foodContext, warnings, recommendations, aiInsights);

    // Calculate adjustments
    const adjustments = this.calculateAdjustments(data.foodContext, user, warnings, aiInsights);

    const weights = this.calculateWeights(user);

    // Calculate weighted score
    let overallScore = Math.round(
      (sugarScore * weights.sugar) +
      (fatScore * weights.fat) +
      (sodiumScore * weights.sodium) +
      (calorieScore * weights.calorie) +
      (qualityScore * weights.quality)
    );

    // Apply AI-powered adjustments
    overallScore += adjustments.sugarTypeBonus;
    overallScore += adjustments.fatTypeBonus;
    overallScore -= adjustments.processingPenalty;
    overallScore -= adjustments.glycemicPenalty;
    overallScore -= adjustments.cookingPenalty;

    // Clamp between 0-100
    overallScore = Math.max(0, Math.min(100, overallScore));

    return {
      overallScore,
      breakdown: { sugarScore, fatScore, sodiumScore, calorieScore, qualityScore },
      adjustments,
      warnings,
      recommendations,
      category: this.getCategory(overallScore),
      aiInsights,
    };
  }

  private calculateWeights(user?: User) {
    if (!user || user.isHealthy) {
      return { sugar: 0.20, fat: 0.20, sodium: 0.20, calorie: 0.20, quality: 0.20 };
    }

    const weights = { sugar: 0.20, fat: 0.20, sodium: 0.20, calorie: 0.20, quality: 0.20 };

    // Condition-specific weight adjustments - MORE AGGRESSIVE
    if (user.hasDiabetes) {
      weights.sugar = 0.65;  // Increased from 0.40 - sugar is CRITICAL for diabetics
      weights.quality = 0.15; // Quality matters (ultra-processed foods spike glucose faster)
    }
    if (user.hasHighCholesterol) weights.fat = 0.50;  // Increased from 0.35
    if (user.hasHighBloodPressure) weights.sodium = 0.50;  // Increased from 0.35
    
    if (user.bmiCategory === 'Obese') weights.calorie = 0.40;  // Increased from 0.35
    else if (user.bmiCategory === 'Overweight') weights.calorie = 0.35;  // Increased from 0.30

    // Normalize
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    return {
      sugar: weights.sugar / sum,
      fat: weights.fat / sum,
      sodium: weights.sodium / sum,
      calorie: weights.calorie / sum,
      quality: weights.quality / sum,
    };
  }

  /**
   * Enhanced sugar scoring with AI context
   */
  private scoreSugarEnhanced(
    sugars: number | undefined,
    fiber: number | undefined,
    context: EnhancedNutritionData['foodContext'],
    user: User | undefined,
    warnings: string[],
    recommendations: string[],
    aiInsights: string[]
  ): number {
    if (!sugars || sugars === 0) return 100;

    // Fiber reduces effective sugar impact
    const effectiveSugar = fiber && fiber > 0 ? Math.max(0, sugars - (fiber * 0.5)) : sugars;

    let score = 100;

    if (user?.hasDiabetes) {
      // AI Context: Natural sugar gets bonus, added sugar gets harsh penalty
      const isNaturalSugar = context.sugarType === 'natural';
      const isUltraProcessed = context.processingLevel === 'ultra-processed';
      
      if (isNaturalSugar && effectiveSugar <= 15) {
        // Natural sugars from fruit - more lenient
        aiInsights.push(`✅ Natural sugar from ${context.sugarSources?.join(', ')}`);
        score = Math.max(40, 100 - (effectiveSugar * 4));
      } else if (effectiveSugar >= 30) {
        score = 0;
        warnings.push(`🚨 CRITICAL: ${sugars}g sugar - Extremely dangerous for diabetes!`);
      } else if (effectiveSugar >= 20) {
        score = 0;  // Changed from max(0, 10 - ...) - anything >= 20g is critical
        warnings.push(`🚨 CRITICAL: ${sugars}g sugar - Extremely high for diabetes!`);
      } else if (effectiveSugar >= 15) {
        score = 5;  // Very dangerous zone
        warnings.push(`🚨 Very high sugar: ${sugars}g - Dangerous for diabetes!`);
      } else if (effectiveSugar >= 10) {
        // 10-15g range: score 5-20 based on processing
        const baseScore = 20 - ((effectiveSugar - 10) * 3);
        score = isUltraProcessed ? Math.max(5, baseScore - 10) : baseScore;
        warnings.push(`⚠️ High sugar: ${sugars}g - Limit consumption!`);
        if (isUltraProcessed) {
          warnings.push(`🚨 Ultra-processed sugar causes rapid glucose spike!`);
        }
      } else if (effectiveSugar >= 5) {
        score = Math.max(30, 60 - ((effectiveSugar - 5) * 6));
        warnings.push(`⚠️ Moderate sugar: ${sugars}g - Monitor closely`);
      } else if (effectiveSugar >= 2) {
        score = 75;
      } else if (effectiveSugar >= 0.5) {
        score = 90;
      }

      if (fiber && fiber >= 3) {
        aiInsights.push(`✅ Good fiber (${fiber}g) helps slow sugar absorption`);
      }
    } else {
      // Non-diabetic scoring - HARSHER for ultra-processed sugary foods
      const isUltraProcessed = context.processingLevel === 'ultra-processed';
      const isBeverage = context.category === 'beverage';
      
      if (effectiveSugar > 40) score = 10;
      else if (effectiveSugar > 25) score = 30;
      else if (effectiveSugar > 15) score = 50;
      else if (effectiveSugar > 8) {
        // Reduce score for ultra-processed sugary foods/beverages
        if (isUltraProcessed && isBeverage) {
          score = 30; // Harsh penalty for sugary drinks
          warnings.push(`⚠️ High sugar beverage (${sugars}g) - empty calories`);
        } else if (isUltraProcessed) {
          score = 50; // Penalty for ultra-processed foods
        } else {
          score = 75;
        }
      }
      else if (effectiveSugar > 3) score = 90;
      else score = 100;
    }

    return Math.round(score);
  }

  /**
   * Enhanced fat scoring with AI context
   * BUG FIX: Reduce saturated fat penalty when fat is predominantly healthy
   */
  private scoreFatEnhanced(
    totalFat: number | undefined,
    saturatedFat: number | undefined,
    transFat: number | undefined,
    context: EnhancedNutritionData['foodContext'],
    user: User | undefined,
    warnings: string[],
    recommendations: string[],
    aiInsights: string[]
  ): number {
    let score = 100;

    // Trans fat is always terrible
    if (transFat && transFat > 0) {
      score -= 40;
      warnings.push(`🚨 Contains trans fat: ${transFat}g - Avoid!`);
    }

    // AI Context: Healthy fats get bonus
    const isHealthyFat = context.fatType === 'healthy-unsaturated';
    
    if (isHealthyFat) {
      aiInsights.push(`✅ Healthy fats from ${context.fatSources?.join(', ')}`);
      score = Math.min(100, score + 10); // Bonus for healthy fats
    }

    // Saturated fat penalty - REDUCED for healthy fat sources
    if (saturatedFat) {
      // Calculate penalty reduction for healthy fats
      const penaltyMultiplier = isHealthyFat ? 0.4 : 1.0; // 60% less penalty for healthy fats
      
      if (user?.hasHighCholesterol) {
        if (saturatedFat > 5) {
          const penalty = Math.round(60 * penaltyMultiplier);
          score -= penalty;
          if (!isHealthyFat) {
            warnings.push(`🚨 Very high saturated fat: ${saturatedFat}g`);
          } else {
            aiInsights.push(`ℹ️ Saturated fat ${saturatedFat}g balanced by healthy fats`);
          }
        } else if (saturatedFat > 2) {
          const penalty = Math.round(40 * penaltyMultiplier);
          score -= penalty;
        } else if (saturatedFat > 1) {
          const penalty = Math.round(20 * penaltyMultiplier);
          score -= penalty;
        }
      } else {
        // Normal person - also benefits from healthy fats but less critical
        if (saturatedFat > 8) score -= Math.round(50 * penaltyMultiplier);
        else if (saturatedFat > 5) score -= Math.round(30 * penaltyMultiplier);
        else if (saturatedFat > 3) score -= Math.round(15 * penaltyMultiplier);
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
      }
    } else {
      if (sodium > 600) score = 20;
      else if (sodium > 400) score = 50;
      else if (sodium > 200) score = 75;
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
        warnings.push(`⚠️ High calories: ${calories}`);
      } else if (calories > 150) score = 70;
    } else if (bmiCategory === 'Overweight') {
      if (calories > 350) score = Math.max(20, 100 - ((calories - 350) / 8));
      else if (calories > 250) score = 70;
    } else {
      if (calories > 600) score = 30;
      else if (calories > 400) score = 60;
      else if (calories > 250) score = 80;
    }
    return Math.round(score);
  }

  /**
   * NEW: Score based on food quality (processing, preparation)
   */
  private scoreQuality(
    context: EnhancedNutritionData['foodContext'],
    warnings: string[],
    recommendations: string[],
    aiInsights: string[]
  ): number {
    let score = 100;

    // Processing level penalty - HARSHER
    switch (context.processingLevel) {
      case 'whole':
        score = 100;
        aiInsights.push('✅ Whole, unprocessed food');
        break;
      case 'minimally-processed':
        score = 90;
        break;
      case 'processed':
        score = 60;  // Reduced from 70
        break;
      case 'ultra-processed':
        score = 20;  // Reduced from 40 - ultra-processed is very unhealthy
        warnings.push('🚨 Ultra-processed food - high health risk');
        recommendations.push('Choose whole foods instead');
        break;
    }

    // Cooking method adjustment
    if (context.cookingMethod === 'fried') {
      score -= 20;
      warnings.push('⚠️ Fried food - unhealthy cooking method');
    } else if (context.cookingMethod === 'grilled' || context.cookingMethod === 'steamed') {
      aiInsights.push(`✅ Healthy cooking method: ${context.cookingMethod}`);
    }

    // Whole grains bonus
    if (context.hasWholeGrains) {
      score = Math.min(100, score + 10);
      aiInsights.push('✅ Contains whole grains');
    }

    // Preservatives/additives penalty
    if (context.hasPreservatives) {
      score -= 10;  // Increased from 5
      warnings.push('⚠️ Contains preservatives and additives');
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Calculate AI-powered score adjustments
   * BUG FIX: Larger bonus for healthy fats when user has high cholesterol
   */
  private calculateAdjustments(
    context: EnhancedNutritionData['foodContext'],
    user: User | undefined,
    warnings: string[],
    aiInsights: string[]
  ): EnhancedHealthScore['adjustments'] {
    const adjustments = {
      sugarTypeBonus: 0,
      fatTypeBonus: 0,
      processingPenalty: 0,
      glycemicPenalty: 0,
      cookingPenalty: 0,
    };

    // Natural sugar bonus
    if (context.sugarType === 'natural') {
      adjustments.sugarTypeBonus = 5;
    }

    // Healthy fat bonus - LARGER for cholesterol patients
    if (context.fatType === 'healthy-unsaturated') {
      if (user?.hasHighCholesterol) {
        adjustments.fatTypeBonus = 15; // Triple bonus for cholesterol patients
        aiInsights.push('💚 Excellent choice! Healthy fats help reduce bad cholesterol');
      } else {
        adjustments.fatTypeBonus = 5;
      }
    }

    // Ultra-processed penalty - HARSHER
    if (context.processingLevel === 'ultra-processed') {
      adjustments.processingPenalty = 25; // Increased from 15
    } else if (context.processingLevel === 'processed') {
      adjustments.processingPenalty = 10; // Increased from 5
    }

    // Glycemic penalty - APPLY TO EVERYONE, not just diabetics
    // Ultra-processed foods cause blood sugar spikes even in healthy people
    const isUltraProcessed = context.processingLevel === 'ultra-processed';
    const isDiabetic = user?.hasDiabetes;
    const multiplier = isDiabetic ? (isUltraProcessed ? 1.5 : 1.0) : 0.5; // Half penalty for non-diabetics
    
    switch (context.glycemicImpact) {
      case 'very-high':
        adjustments.glycemicPenalty = Math.round(30 * multiplier);
        if (isDiabetic) {
          warnings.push(`🚨 ${context.glycemicReasoning}`);
          if (isUltraProcessed) {
            warnings.push(`🚨 Ultra-processed with very high glycemic impact - AVOID!`);
          }
        } else if (isUltraProcessed) {
          warnings.push(`⚠️ High glycemic impact - can cause energy crashes`);
        }
        break;
      case 'high':
        adjustments.glycemicPenalty = Math.round(20 * multiplier);
        if (isDiabetic) {
          warnings.push(`⚠️ ${context.glycemicReasoning}`);
        }
        break;
      case 'medium':
        adjustments.glycemicPenalty = Math.round(8 * multiplier);
        break;
    }

    // Fried food penalty
    if (context.cookingMethod === 'fried') {
      adjustments.cookingPenalty = 10;
    }

    return adjustments;
  }

  private getCategory(score: number): EnhancedHealthScore['category'] {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  }
}

export default new EnhancedScoringService();
