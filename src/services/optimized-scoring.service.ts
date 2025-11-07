import { EnhancedNutritionData } from './enhanced-ai.service';
import { User } from '../entities/User.entity';
import { normalizeNutrients, NormalizedNutrients } from '../utils/serving-size.util';

export interface OptimizedHealthScore {
  overallScore: number;
  breakdown: {
    sugarScore: number;
    saturatedFatScore: number;  // FIXED: Now separate from total fat
    transFatScore: number;      // NEW: Dedicated trans fat score
    sodiumScore: number;
    calorieScore: number;
    proteinScore: number;
    fiberScore: number;
    micronutrientScore: number; // NEW: Micronutrient density score
  };
  adjustments: {
    processingLevelAdjustment: number; // Now integrated into weights, not a bonus
  };
  warnings: string[];
  recommendations: string[];
  category: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
  aiInsights: string[];
  novaGroup: 1 | 2 | 3 | 4; // NOVA classification for transparency
  smartWeights: {
    sugar: number;
    saturatedFat: number;
    transFat: number;
    sodium: number;
    calorie: number;
    protein: number;
    fiber: number;
    micronutrient: number;
  };
  // FIX #4: Flag for UI handling (Olive Oil Problem)
  // When true, frontend should prompt for serving size instead of showing per-100g score
  isCulinaryIngredient?: boolean;
  suggestedServingSize?: string; // e.g., "1 tbsp (15g)"
}

/**
 * OPTIMIZED SCORING SERVICE
 * 
 * Fixes all major flaws identified in the analysis:
 * 1. ✅ Separates saturated fat from total fat
 * 2. ✅ Adds dedicated trans fat scoring
 * 3. ✅ Implements NOVA-based smart weights
 * 4. ✅ Adds micronutrient scoring
 * 5. ✅ Improves protein/fiber scales (tiered buckets)
 * 6. ✅ Removes arbitrary AI bonuses/penalties
 * 7. ✅ Fixes contradictory fat logic
 */
export class OptimizedScoringService {
  
  calculateOptimizedScore(data: EnhancedNutritionData, user?: User): OptimizedHealthScore {
    console.log('🚀 Calculating OPTIMIZED health score...');
    
    // Step 1: Normalize nutrients to per-100g/100ml
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

    console.log('📊 Normalized values (per 100g/100ml):', normalizedData);
    
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const aiInsights: string[] = [];

    // Step 0: NOVA Classification (AI-driven food processing level)
    const novaGroup = this.classifyNOVAGroup(data.foodContext, aiInsights);
    
    // Add food identification
    aiInsights.push(`Food: ${data.foodContext.foodName}`);
    aiInsights.push(`NOVA Group: ${novaGroup} (${this.getNOVADescription(novaGroup)})`);
    aiInsights.push(`AI Quality: ${data.foodContext.overallQuality.toUpperCase()}`);

    // Step 2: Calculate component scores (8 components)
    const sugarScore = this.scoreSugar(
      normalizedData.sugars,
      normalizedData.fiber,
      data.foodContext,
      novaGroup,
      user,
      warnings,
      recommendations,
      aiInsights
    );

    const saturatedFatScore = this.scoreSaturatedFat(
      normalizedData.saturatedFat,
      data.foodContext,
      user,
      warnings,
      recommendations,
      aiInsights
    );

    const transFatScore = this.scoreTransFat(
      normalizedData.transFat,
      data.foodContext,
      warnings,
      aiInsights
    );

    const sodiumScore = this.scoreSodium(
      normalizedData.sodium,
      user,
      warnings,
      recommendations
    );

    const calorieScore = this.scoreCalories(
      normalizedData.calories,
      novaGroup,
      user,
      warnings,
      recommendations,
      aiInsights
    );
    
    const proteinScore = this.scoreProteinImproved(
      normalizedData.protein,
      user,
      warnings,
      recommendations,
      aiInsights
    );

    const fiberScore = this.scoreFiberImproved(
      normalizedData.fiber,
      user,
      warnings,
      recommendations,
      aiInsights
    );

    const micronutrientScore = this.scoreMicronutrients(
      data.foodContext,
      novaGroup,
      normalizedData,
      warnings,
      recommendations,
      aiInsights
    );

    // Step 3: Calculate Smart Weights (NOVA-based + Category-aware)
    const smartWeights = this.calculateSmartWeights(
      novaGroup,
      data.foodContext.category,
      user,
      aiInsights
    );

    // Step 4: Calculate weighted subtotal
    let overallScore = Math.round(
      (sugarScore * smartWeights.sugar) +
      (saturatedFatScore * smartWeights.saturatedFat) +
      (transFatScore * smartWeights.transFat) +
      (sodiumScore * smartWeights.sodium) +
      (calorieScore * smartWeights.calorie) +
      (proteinScore * smartWeights.protein) +
      (fiberScore * smartWeights.fiber) +
      (micronutrientScore * smartWeights.micronutrient)
    );

    console.log(`🔍 DEBUG PRE-PENALTIES: Base weighted score = ${overallScore}, NOVA = ${novaGroup}, Category = ${data.foodContext.category}, Quality = ${data.foodContext.overallQuality}`);

    // Step 5: Apply NOVA Group penalties/bonuses to final score
    const scoreBeforePenalties = overallScore;
    overallScore = this.applyNOVAPenalties(
      overallScore,
      novaGroup,
      data.foodContext,
      normalizedData,
      aiInsights,
      warnings
    );

    console.log(`🔍 DEBUG POST-PENALTIES: Score changed from ${scoreBeforePenalties} to ${overallScore}`);

    // Clamp between 0-100
    overallScore = Math.max(0, Math.min(100, overallScore));

    console.log('🏆 Final Score:', overallScore);

    // FIX #4: Detect culinary ingredients (Olive Oil Problem)
    const isCulinaryIngredient = novaGroup === 2;
    const suggestedServingSize = isCulinaryIngredient 
      ? (data.foodContext.category === 'other' ? '1 tbsp (15g)' : '1 portion')
      : undefined;

    if (isCulinaryIngredient) {
      aiInsights.push('ℹ️ This is a culinary ingredient - use in moderation as part of cooking');
      recommendations.push('💡 Score shown is per 100g. Use appropriate serving sizes (e.g., 1 tbsp oil = 15g)');
    }

    return {
      overallScore,
      breakdown: {
        sugarScore,
        saturatedFatScore,
        transFatScore,
        sodiumScore,
        calorieScore,
        proteinScore,
        fiberScore,
        micronutrientScore,
      },
      adjustments: {
        processingLevelAdjustment: 0, // No longer used - integrated into weights
      },
      warnings,
      recommendations,
      category: this.getCategory(overallScore),
      aiInsights,
      novaGroup,
      smartWeights,
      isCulinaryIngredient,
      suggestedServingSize,
    };
  }

  /**
   * STEP 0: Classify food into NOVA groups
   * This drives the entire scoring logic
   */
  private classifyNOVAGroup(
    context: EnhancedNutritionData['foodContext'],
    aiInsights: string[]
  ): 1 | 2 | 3 | 4 {
    switch (context.processingLevel) {
      case 'whole':
        return 1; // Unprocessed or minimally processed
      case 'minimally-processed':
        return 2; // Processed culinary ingredients
      case 'processed':
        return 3; // Processed foods
      case 'ultra-processed':
        return 4; // Ultra-processed foods
      default:
        return 3; // Default to processed
    }
  }

  private getNOVADescription(group: 1 | 2 | 3 | 4): string {
    switch (group) {
      case 1: return 'Unprocessed/Minimally Processed - Whole foods';
      case 2: return 'Processed Culinary Ingredients - Oils, butter, salt';
      case 3: return 'Processed Foods - Canned, preserved';
      case 4: return 'Ultra-Processed - Industrial formulations';
    }
  }

  /**
   * CRITICAL FIX: Apply aggressive NOVA-based penalties to prevent overfitting
   * This is the key to preventing ultra-processed foods from scoring too high
   */
  private applyNOVAPenalties(
    baseScore: number,
    novaGroup: 1 | 2 | 3 | 4,
    context: EnhancedNutritionData['foodContext'],
    nutrients: NormalizedNutrients,
    aiInsights: string[],
    warnings: string[]
  ): number {
    let finalScore = baseScore;

    // NOVA Group 1: Whole foods get bonus
    if (novaGroup === 1) {
      // Reward truly healthy whole foods
      if (context.overallQuality === 'excellent') {
        // Boost excellent whole foods more
        if (context.category === 'fruit' || context.category === 'vegetable') {
          // Boost and cap at 95 for fruits/vegetables
          finalScore = Math.min(95, Math.round(finalScore * 1.12)); // 12% boost, capped at 95
          aiInsights.push('✨ Excellent whole food bonus: +12%, capped at 95');
        } else {
          // Other whole foods (protein, nuts, etc.) get 10% boost
          finalScore = Math.min(95, Math.round(finalScore * 1.10)); // 10% boost
          aiInsights.push('✨ Excellent whole food bonus: +10%, capped at 95');
        }
      } else if (context.overallQuality === 'good') {
        // Good quality whole foods get smaller boost
        finalScore = Math.min(90, finalScore + 3);
        aiInsights.push('✨ Good whole food bonus: +3 points');
      }
      return finalScore;
    }

    // NOVA Group 2: Culinary ingredients - neutral
    if (novaGroup === 2) {
      return finalScore;
    }

    // NOVA Group 3: Processed foods - moderate cap
    if (novaGroup === 3) {
      // Cap processed foods at 60/100 (stricter than before)
      if (finalScore > 60) {
        finalScore = 60;
        aiInsights.push('⚠️ Processed food cap: Maximum 60/100');
      }
      return finalScore;
    }

    // NOVA Group 4: Ultra-processed - AGGRESSIVE penalties
    if (novaGroup === 4) {
      console.log(`🔍 DEBUG: Entering NOVA 4 penalties. Base score: ${baseScore}, Category: ${context.category}`);
      
      // Base cap for ultra-processed
      const maxScore = 40;
      
      // Further reduce cap based on category
      let categoryMaxScore = maxScore;
      
      if (context.category === 'snack') {
        categoryMaxScore = 10; // Chips, crackers, etc. - VERY STRICT
        aiInsights.push('🚨 Ultra-processed snack: Maximum 10/100');
      } else if (context.category === 'dessert') {
        categoryMaxScore = 25; // Ice cream, cookies, etc.
        aiInsights.push('🚨 Ultra-processed dessert: Maximum 25/100');
      } else if (context.category === 'beverage') {
        // Stricter for beverages
        if (context.hasArtificialSweeteners) {
          categoryMaxScore = 30; // Diet sodas
          aiInsights.push('🚨 Ultra-processed beverage (artificial sweeteners): Maximum 30/100');
        } else if (nutrients.sugars && nutrients.sugars > 8) {
          categoryMaxScore = 15; // Sugary sodas
          aiInsights.push('🚨 Ultra-processed sugary beverage: Maximum 15/100');
        } else {
          categoryMaxScore = 35;
          aiInsights.push('🚨 Ultra-processed beverage: Maximum 35/100');
        }
      } else if (context.category === 'processed' || context.category === 'fast-food') {
        categoryMaxScore = 15; // Instant meals - STRICTER
        aiInsights.push('🚨 Ultra-processed meal: Maximum 15/100');
      } else if (context.category === 'grain') {
        // Breakfast cereals
        if (nutrients.sugars && nutrients.sugars > 25) {
          categoryMaxScore = 20; // Sugary cereals
          aiInsights.push('🚨 Ultra-processed sugary cereal: Maximum 20/100');
        } else if (nutrients.sugars && nutrients.sugars > 15) {
          categoryMaxScore = 30;
          aiInsights.push('🚨 Ultra-processed cereal: Maximum 30/100');
        } else {
          categoryMaxScore = 40;
        }
      } else {
        categoryMaxScore = 30; // General ultra-processed - STRICTER
        aiInsights.push('🚨 Ultra-processed food: Maximum 30/100');
      }

      // Apply multiplier based on overall quality
      let qualityMultiplier = 1.0;
      if (context.overallQuality === 'very-poor') {
        qualityMultiplier = 0.6; // Reduce further
        aiInsights.push('⚠️ Very poor quality: -40% penalty');
      } else if (context.overallQuality === 'poor') {
        qualityMultiplier = 0.8;
        aiInsights.push('⚠️ Poor quality: -20% penalty');
      }

      console.log(`🔍 DEBUG: Quality multiplier: ${qualityMultiplier}, Quality: ${context.overallQuality}`);

      // Apply quality multiplier
      finalScore = Math.round(finalScore * qualityMultiplier);
      console.log(`🔍 DEBUG: After quality multiplier: ${finalScore}`);

      // Apply category cap
      if (finalScore > categoryMaxScore) {
        finalScore = categoryMaxScore;
      }
      console.log(`🔍 DEBUG: After category cap (${categoryMaxScore}): ${finalScore}`);

      // Additional penalties for specific harmful combinations
      if (nutrients.sugars && nutrients.sugars > 30 && nutrients.saturatedFat && nutrients.saturatedFat > 5) {
        const beforeToxic = finalScore;
        finalScore = Math.round(finalScore * 0.7);
        console.log(`🔍 DEBUG: Toxic combo penalty: ${beforeToxic} × 0.7 = ${finalScore}`);
        warnings.push('🚨 Extremely unhealthy: High sugar + high saturated fat');
        aiInsights.push('💀 Toxic combination penalty: -30%');
      }

      // Sodium bomb penalty
      if (nutrients.sodium && nutrients.sodium > 1500) {
        const beforeSodium = finalScore;
        finalScore = Math.round(finalScore * 0.7);
        console.log(`🔍 DEBUG: Sodium bomb penalty: ${beforeSodium} × 0.7 = ${finalScore}`);
        warnings.push('🚨 Sodium bomb: Extremely high sodium content');
        aiInsights.push('🧂 Excessive sodium penalty: -30%');
      }

      console.log(`🔍 DEBUG: Final NOVA 4 score: ${finalScore}`);
      return finalScore;
    }

    return finalScore;
  }

  /**
   * STEP 2: Score Sugar (Context-aware)
   * Natural sugars in whole foods are NOT penalized
   * Added sugars in ultra-processed foods are HEAVILY penalized
   */
  private scoreSugar(
    sugars: number | undefined,
    fiber: number | undefined,
    context: EnhancedNutritionData['foodContext'],
    novaGroup: 1 | 2 | 3 | 4,
    user: User | undefined,
    warnings: string[],
    recommendations: string[],
    aiInsights: string[]
  ): number {
    // FIX #1: Artificial Sweeteners Detection (Diet Soda Loophole)
    // Must check BEFORE zero sugar check, because artificial sweeteners have 0g sugar
    if (context.hasArtificialSweeteners) {
      if (user?.hasDiabetes) {
        aiInsights.push(`⚠️ Artificial sweeteners detected - Better than sugar for diabetics`);
        warnings.push(`Contains artificial sweeteners - OK for blood sugar control`);
        return 80; // "Good" alternative for diabetics, not perfect
      } else {
        aiInsights.push(`⚠️ Artificial sweeteners detected - Not a healthy choice`);
        warnings.push(`Contains artificial sweeteners - Choose water or whole foods instead`);
        recommendations.push(`Replace with water, unsweetened tea, or whole fruits`);
        return 30; // "Poor" score for healthy people
      }
    }

    if (!sugars || sugars === 0) return 100;

    const isNaturalSugar = context.sugarType === 'natural';
    const isWholeFruit = novaGroup === 1 && context.category === 'fruit';
    const isUltraProcessed = novaGroup === 4;

    // FIX #2: Liquid Sugar Detection (Fruit Juice Loophole)
    // Penalize beverages with high sugar and low fiber, even if "natural"
    if (context.category === 'beverage' && (!fiber || fiber < 1.5)) {
      // This is juice or sugary drink - treat harshly regardless of "natural" label
      const effectiveSugar = sugars; // No fiber bonus for liquid sugar
      
      aiInsights.push(`⚠️ Liquid sugar detected (${sugars}g) - No fiber to slow absorption`);
      warnings.push(`Liquid sugar causes rapid blood sugar spikes - Choose whole fruits instead`);
      recommendations.push(`Eat whole fruits instead of juice for fiber and slower sugar absorption`);
      
      // Apply HARSH penalties similar to ultra-processed
      if (user?.hasDiabetes) {
        if (effectiveSugar >= 15) {
          warnings.push(`🚨 CRITICAL: ${sugars}g liquid sugar - AVOID! Dangerous for diabetes!`);
          return 0;
        } else if (effectiveSugar >= 10) {
          warnings.push(`🚨 Very high liquid sugar - Dangerous!`);
          return 10;
        } else if (effectiveSugar >= 5) {
          warnings.push(`⚠️ Moderate liquid sugar - Limit strictly`);
          return 30;
        } else {
          return 60;
        }
      } else {
        if (effectiveSugar > 20) {
          return 0;
        } else if (effectiveSugar > 12) {
          return 20;
        } else if (effectiveSugar > 8) {
          return 35;
        } else {
          return 50;
        }
      }
    }

    // Fiber reduces effective sugar impact
    const effectiveSugar = fiber && fiber > 0 ? Math.max(0, sugars - (fiber * 0.5)) : sugars;

    let score = 100;

    // Special handling for whole fruits (NOVA Group 1)
    if (isWholeFruit && fiber && fiber >= 2) {
      // Whole fruits with fiber: sugar is NOT penalized
      aiInsights.push(`✅ Natural fruit sugar (${sugars}g) + fiber (${fiber}g) = healthy`);
      return 100; // Perfect score for whole fruits
    }

    // Natural dairy sugar (lactose)
    if (isNaturalSugar && context.category === 'dairy' && novaGroup <= 2) {
      if (effectiveSugar <= 12) {
        aiInsights.push(`✅ Natural lactose (${sugars}g) - low glycemic impact`);
        return 90;
      } else {
        score = Math.max(60, 100 - (effectiveSugar * 3));
      }
    }

    // Ultra-processed foods with sugar: HARSH penalties
    if (isUltraProcessed) {
      if (user?.hasDiabetes) {
        // Diabetic scoring: ultra-processed sugar is CRITICAL
        if (effectiveSugar >= 30) {
          score = 0;
          warnings.push(`🚨 CRITICAL: ${sugars}g added sugar - AVOID! Dangerous for diabetes!`);
        } else if (effectiveSugar >= 20) {
          score = 0;
          warnings.push(`🚨 CRITICAL: ${sugars}g added sugar - Extremely dangerous!`);
        } else if (effectiveSugar >= 15) {
          score = 5;
          warnings.push(`🚨 Very high sugar: ${sugars}g - Dangerous!`);
        } else if (effectiveSugar >= 10) {
          score = 15;
          warnings.push(`⚠️ High sugar: ${sugars}g - Limit consumption!`);
        } else if (effectiveSugar >= 5) {
          score = 40;
          warnings.push(`⚠️ Moderate sugar: ${sugars}g - Monitor closely`);
        } else {
          score = 70;
        }
      } else {
        // Non-diabetic: ultra-processed sugar is still bad
        // STRICTER THRESHOLDS - more aggressive penalties
        if (effectiveSugar > 35) {
          score = 0;
          warnings.push(`🚨 EXTREME sugar: ${sugars}g - Major health risk!`);
        } else if (effectiveSugar > 25) {
          score = 5;
          warnings.push(`🚨 Very high sugar: ${sugars}g`);
        } else if (effectiveSugar > 18) {
          score = 10;
          warnings.push(`🚨 Very high sugar: ${sugars}g`);
        } else if (effectiveSugar > 12) {
          score = 20;
          warnings.push(`⚠️ High sugar: ${sugars}g`);
        } else if (effectiveSugar > 8) {
          score = 35;
          warnings.push(`⚠️ Moderate sugar: ${sugars}g`);
        } else if (effectiveSugar > 4) {
          score = 60;
        } else {
          score = 75;
        }
      }
    } else {
      // Processed or minimally processed: moderate penalties
      if (user?.hasDiabetes) {
        if (effectiveSugar >= 20) {
          score = 10;
          warnings.push(`⚠️ High sugar: ${sugars}g - Monitor closely`);
        } else if (effectiveSugar >= 10) {
          score = 40;
        } else if (effectiveSugar >= 5) {
          score = 70;
        } else {
          score = 90;
        }
      } else {
        if (effectiveSugar > 25) {
          score = 40;
        } else if (effectiveSugar > 15) {
          score = 65;
        } else if (effectiveSugar > 8) {
          score = 85;
        } else {
          score = 100;
        }
      }
    }

    return Math.round(score);
  }

  /**
   * STEP 2: Score Saturated Fat (FIXED)
   * Only penalizes saturated fat, not total fat
   * Healthy unsaturated fats are NOT penalized
   */
  private scoreSaturatedFat(
    saturatedFat: number | undefined,
    context: EnhancedNutritionData['foodContext'],
    user: User | undefined,
    warnings: string[],
    recommendations: string[],
    aiInsights: string[]
  ): number {
    if (!saturatedFat || saturatedFat === 0) return 100;

    const isHealthyFat = context.fatType === 'healthy-unsaturated';
    
    if (isHealthyFat && saturatedFat < 2) {
      aiInsights.push(`✅ Healthy unsaturated fats (${context.fatSources?.join(', ')})`);
      return 100; // Perfect score for healthy fats with low saturated fat
    }

    let score = 100;

    if (user?.hasHighCholesterol) {
      // High cholesterol: strict saturated fat limits
      if (saturatedFat > 5) {
        score = 0;
        warnings.push(`🚨 Very high saturated fat: ${saturatedFat}g - Major risk!`);
        recommendations.push('💓 Choose lean proteins and plant-based fats');
      } else if (saturatedFat > 3) {
        score = 20;
        warnings.push(`⚠️ High saturated fat: ${saturatedFat}g`);
      } else if (saturatedFat > 1.5) {
        score = 50;
      } else if (saturatedFat > 0.5) {
        score = 80;
      }
    } else {
      // Normal: moderate limits
      if (saturatedFat > 10) {
        score = 0;
        warnings.push(`🚨 Extreme saturated fat: ${saturatedFat}g`);
      } else if (saturatedFat > 5) {
        score = 30;
        warnings.push(`⚠️ High saturated fat: ${saturatedFat}g`);
      } else if (saturatedFat > 3) {
        score = 60;
      } else if (saturatedFat > 1.5) {
        score = 85;
      }
    }

    return Math.round(score);
  }

  /**
   * STEP 2: Score Trans Fat (NEW)
   * Trans fat is ALWAYS bad (except natural CLA in trace amounts)
   */
  private scoreTransFat(
    transFat: number | undefined,
    context: EnhancedNutritionData['foodContext'],
    warnings: string[],
    aiInsights: string[]
  ): number {
    if (!transFat || transFat === 0) return 100;

    const isNaturalTransFat = context.category === 'dairy' || context.category === 'protein';
    
    if (isNaturalTransFat && transFat < 0.5) {
      // Natural CLA in dairy/beef - minimal penalty
      aiInsights.push('ℹ️ Contains natural trans fat (CLA) - not harmful');
      return 90;
    }

    // Any artificial trans fat is dangerous
    if (transFat >= 2) {
      warnings.push(`🚨 DANGER: ${transFat}g trans fat - AVOID! Major heart disease risk`);
      return 0;
    } else if (transFat >= 0.5) {
      warnings.push(`🚨 Contains ${transFat}g trans fat - Strongly avoid!`);
      return 20;
    } else {
      warnings.push(`⚠️ Contains trace trans fat (${transFat}g)`);
      return 60;
    }
  }

  /**
   * STEP 2: Score Sodium (unchanged from original)
   */
  private scoreSodium(
    sodium: number | undefined,
    user: User | undefined,
    warnings: string[],
    recommendations: string[]
  ): number {
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
      if (sodium > 1500) {
        score = 0;
        warnings.push(`🚨 EXTREME sodium: ${sodium}mg - Major health risk!`);
      } else if (sodium > 1000) {
        score = Math.max(0, 10 - ((sodium - 1000) / 100));
        warnings.push(`🚨 EXTREME sodium: ${sodium}mg - Avoid!`);
      } else if (sodium > 800) {
        score = Math.max(10, 20 - ((sodium - 800) / 50));
        warnings.push(`🚨 Very high sodium: ${sodium}mg`);
      } else if (sodium > 600) {
        score = 20;
        warnings.push(`⚠️ High sodium: ${sodium}mg`);
      } else if (sodium > 400) {
        score = 50;
      } else if (sodium > 300) {
        score = 65;
      } else if (sodium > 200) {
        score = 75;
      }
    }
    return Math.round(score);
  }

  /**
   * STEP 2: Score Calories (NOVA-aware)
   * Natural high-calorie foods (nuts, avocados) are NOT heavily penalized
   * Ultra-processed high-calorie foods ARE penalized
   */
  private scoreCalories(
    calories: number | undefined,
    novaGroup: 1 | 2 | 3 | 4,
    user: User | undefined,
    warnings: string[],
    recommendations: string[],
    aiInsights: string[]
  ): number {
    if (!calories) return 75;

    const bmiCategory = user?.bmiCategory;
    const isWholeFoodOrMinimal = novaGroup <= 2;

    if (bmiCategory === 'Underweight') {
      if (calories >= 300) {
        recommendations.push(`✅ Good calorie density (${Math.round(calories)} kcal)`);
        return Math.min(100, 60 + ((calories - 300) / 10));
      } else {
        warnings.push(`⚠️ Low calorie density (${Math.round(calories)} kcal)`);
        return 40;
      }
    } else if (bmiCategory === 'Obese') {
      if (calories > 300) {
        warnings.push(`🚨 Very high calories: ${Math.round(calories)} kcal`);
        return Math.max(0, 100 - ((calories - 300) / 4));
      } else if (calories > 200) {
        warnings.push(`⚠️ High calories: ${Math.round(calories)} kcal`);
        return Math.max(20, 100 - ((calories - 200) / 5));
      } else if (calories <= 100) {
        recommendations.push(`✅ Low calorie density (${Math.round(calories)} kcal)`);
        return 100;
      } else {
        return 80;
      }
    } else if (bmiCategory === 'Overweight') {
      if (calories > 400) {
        warnings.push(`⚠️ Very high calories: ${Math.round(calories)} kcal`);
        return Math.max(10, 100 - ((calories - 400) / 6));
      } else if (calories > 300) {
        return 60;
      } else if (calories <= 150) {
        recommendations.push(`✅ Good calorie density (${Math.round(calories)} kcal)`);
        return 90;
      } else {
        return 75;
      }
    } else {
      // Normal BMI: context-aware scoring
      if (isWholeFoodOrMinimal && calories > 400) {
        // Whole foods like nuts, avocados - don't penalize heavily
        aiInsights.push(`ℹ️ High-calorie whole food (${Math.round(calories)} kcal) - nutrient-dense`);
        return 70;
      } else if (calories > 600) {
        warnings.push(`⚠️ Very calorie-dense: ${Math.round(calories)} kcal`);
        return 30;
      } else if (calories > 400) {
        return 60;
      } else if (calories > 250) {
        return 80;
      } else {
        return 100;
      }
    }
  }

  /**
   * STEP 2: Score Protein (IMPROVED - Tiered Buckets)
   * Fixes low ceiling problem: now differentiates good from excellent
   */
  private scoreProteinImproved(
    protein: number | undefined,
    user: User | undefined,
    warnings: string[],
    recommendations: string[],
    aiInsights: string[]
  ): number {
    if (!protein || protein === 0) {
      recommendations.push('💪 Add protein-rich foods for satiety');
      return 0;
    }

    const bmiCategory = user?.bmiCategory;
    
    // TIERED SCORING: 0-3g=Poor, 4-7g=Fair, 8-14g=Good, 15-24g=Very Good, 25+=Excellent
    
    if (bmiCategory === 'Underweight' || user?.hasDiabetes) {
      if (protein >= 25) {
        aiInsights.push(`✅ Excellent protein (${protein}g) - great for your needs`);
        return 100;
      } else if (protein >= 15) {
        aiInsights.push(`✅ Very good protein (${protein}g)`);
        return 80;
      } else if (protein >= 8) {
        return 60;
      } else if (protein >= 4) {
        return 40;
        recommendations.push('💪 Higher protein would be better');
      } else {
        return 20;
        warnings.push('⚠️ Low protein');
      }
    } else if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
      if (protein >= 25) {
        aiInsights.push(`✅ Excellent protein (${protein}g) - great for satiety`);
        return 100;
      } else if (protein >= 15) {
        aiInsights.push(`✅ Very good protein (${protein}g)`);
        return 85;
      } else if (protein >= 8) {
        return 65;
      } else if (protein >= 4) {
        return 45;
      } else {
        return 25;
        recommendations.push('💪 Higher protein helps with weight loss');
      }
    } else {
      // Normal BMI
      if (protein >= 25) {
        aiInsights.push(`✅ Excellent protein (${protein}g)`);
        return 100;
      } else if (protein >= 15) {
        return 85;
      } else if (protein >= 8) {
        return 70;
      } else if (protein >= 4) {
        return 50;
      } else {
        return 30;
      }
    }
  }

  /**
   * STEP 2: Score Fiber (IMPROVED - Tiered Buckets)
   * Fixes low ceiling problem: now differentiates good from excellent
   */
  private scoreFiberImproved(
    fiber: number | undefined,
    user: User | undefined,
    warnings: string[],
    recommendations: string[],
    aiInsights: string[]
  ): number {
    if (!fiber || fiber === 0) {
      recommendations.push('🌾 Add fiber-rich foods');
      return 0;
    }

    // TIERED SCORING: 0-1.5g=Poor, 1.6-3g=Fair, 3.1-6g=Good, 6.1-10g=Very Good, 10+=Excellent
    
    if (user?.hasDiabetes || user?.hasHighCholesterol) {
      if (fiber >= 10) {
        aiInsights.push(`✅ Excellent fiber (${fiber}g) - very beneficial for you`);
        return 100;
      } else if (fiber >= 6) {
        aiInsights.push(`✅ Very good fiber (${fiber}g)`);
        return 80;
      } else if (fiber >= 3) {
        return 60;
      } else if (fiber >= 1.5) {
        return 40;
        recommendations.push('🌾 Higher fiber would help your condition');
      } else {
        return 20;
        warnings.push('⚠️ Low fiber');
      }
    } else {
      if (fiber >= 10) {
        aiInsights.push(`✅ Excellent fiber (${fiber}g)`);
        return 100;
      } else if (fiber >= 6) {
        return 85;
      } else if (fiber >= 3) {
        return 70;
      } else if (fiber >= 1.5) {
        return 50;
      } else {
        return 30;
      }
    }
  }

  /**
   * STEP 2: Score Micronutrients (NEW)
   * Addresses the micronutrient blindness problem
   */
  private scoreMicronutrients(
    context: EnhancedNutritionData['foodContext'],
    novaGroup: 1 | 2 | 3 | 4,
    normalizedData: NormalizedNutrients,
    warnings: string[],
    recommendations: string[],
    aiInsights: string[]
  ): number {
    let score = 0;

    // NOVA Group 1 (whole foods) = highest micronutrient density
    switch (novaGroup) {
      case 1:
        score = 90; // Whole foods are naturally nutrient-rich
        break;
      case 2:
        score = 50; // Culinary ingredients have some nutrients
        break;
      case 3:
        score = 30; // Processed foods have reduced nutrients
        break;
      case 4:
        score = 10; // Ultra-processed = nutrient-void
        break;
    }

    // Boost for specific nutrient-dense categories
    if (context.category === 'vegetable') {
      score = Math.min(100, score + 10);
      aiInsights.push('✅ Vegetables - excellent source of vitamins & minerals');
    } else if (context.category === 'fruit') {
      score = Math.min(100, score + 8);
      aiInsights.push('✅ Fruit - good source of vitamins & antioxidants');
    } else if (context.category === 'protein' && novaGroup <= 2) {
      score = Math.min(100, score + 6);
      aiInsights.push('✅ Whole protein - contains essential amino acids & minerals');
    }

    // Fortification bonus (only for processed foods that need it)
    if (context.hasFortification && novaGroup >= 3) {
      score = Math.min(100, score + 10);
      aiInsights.push('✅ Fortified with vitamins/minerals');
    }

    // Penalty for ultra-processed foods claiming to be healthy
    if (novaGroup === 4 && score > 30) {
      recommendations.push('💡 Whole foods provide more nutrients than fortified processed foods');
    }

    return Math.round(score);
  }

  /**
   * STEP 3: Calculate Smart Weights (NOVA-based)
   * This is the KEY innovation: weights change based on food processing level
   * FIX #3: Category-specific weights for NOVA 1 to fix the "Orange Problem"
   */
  private calculateSmartWeights(
    novaGroup: 1 | 2 | 3 | 4,
    category: string,
    user: User | undefined,
    aiInsights: string[]
  ): OptimizedHealthScore['smartWeights'] {
    let weights = {
      sugar: 0.125,
      saturatedFat: 0.125,
      transFat: 0.125,
      sodium: 0.125,
      calorie: 0.125,
      protein: 0.125,
      fiber: 0.125,
      micronutrient: 0.125,
    };

    // FIX #3: NOVA Group 1 - Category-Specific Weights (Fixes "Orange Problem")
    if (novaGroup === 1) {
      // Fruits & Vegetables: Don't penalize for lack of protein
      if (category === 'fruit' || category === 'vegetable') {
        weights = {
          sugar: 0.00,          // Natural sugar NOT penalized
          saturatedFat: 0.01,   // Minimal penalty (fruits/veggies have no fat)
          transFat: 0.01,       // Minimal penalty
          sodium: 0.01,         // Minimal penalty
          calorie: 0.00,        // Natural calories NOT penalized
          protein: 0.00,        // DON'T penalize fruits/veggies for low protein!
          fiber: 0.46,          // REWARD fiber highly
          micronutrient: 0.51,  // REWARD vitamins/minerals highly
        };
        aiInsights.push(`🍎 ${category} scoring: Fiber & micronutrients rewarded, protein not required`);
      }
      // Protein foods: Don't penalize for lack of fiber
      else if (category === 'protein') {
        weights = {
          sugar: 0.00,          // Natural sugar NOT penalized
          saturatedFat: 0.35,   // PENALIZE bad fats in protein (increased)
          transFat: 0.05,       // Minimal penalty (whole proteins rarely have trans fat)
          sodium: 0.05,         // Minimal penalty
          calorie: 0.00,        // Natural calories NOT penalized
          protein: 0.45,        // REWARD protein highly
          fiber: 0.00,          // DON'T penalize meat/fish for no fiber!
          micronutrient: 0.10,  // Some reward for B vitamins, iron, zinc
        };
        aiInsights.push('🥩 Protein food scoring: Protein rewarded, fiber not required, fat quality matters');
      }
      // Grains & Dairy: Balanced approach
      else if (category === 'grain' || category === 'dairy') {
        weights = {
          sugar: 0.05,          // Slight penalty for added sugar
          saturatedFat: 0.15,   // Moderate penalty (dairy can have sat fat)
          transFat: 0.05,       // Minimal penalty
          sodium: 0.05,         // Minimal penalty
          calorie: 0.00,        // Natural calories NOT penalized
          protein: 0.25,        // Reward protein
          fiber: 0.25,          // Reward fiber (for grains)
          micronutrient: 0.20,  // Reward nutrients
        };
        aiInsights.push(`🌾 ${category} scoring: Balanced whole food approach`);
      }
      // Default whole food (nuts, seeds, etc.)
      else {
        weights = {
          sugar: 0.00,          // Natural sugar NOT penalized
          saturatedFat: 0.05,   // Minimal penalty
          transFat: 0.05,       // Minimal penalty
          sodium: 0.05,         // Minimal penalty
          calorie: 0.00,        // Natural calories NOT penalized
          protein: 0.30,        // Reward protein
          fiber: 0.30,          // Reward fiber
          micronutrient: 0.25,  // Reward nutrient density
        };
        aiInsights.push('🍎 Whole food scoring: Natural nutrients rewarded, not penalized');
      }
    }
    // NOVA Group 2: Processed Culinary Ingredients - MODERATE
    else if (novaGroup === 2) {
      weights = {
        sugar: 0.05,
        saturatedFat: 0.20,   // Important for oils/fats
        transFat: 0.15,
        sodium: 0.15,
        calorie: 0.10,
        protein: 0.15,
        fiber: 0.10,
        micronutrient: 0.10,
      };
    }
    // NOVA Group 3: Processed Foods - BALANCED
    else if (novaGroup === 3) {
      weights = {
        sugar: 0.15,
        saturatedFat: 0.15,
        transFat: 0.15,
        sodium: 0.15,
        calorie: 0.15,
        protein: 0.10,
        fiber: 0.10,
        micronutrient: 0.05,
      };
    }
    // NOVA Group 4: Ultra-Processed - STRICT SCORING
    else {
      weights = {
        sugar: 0.30,          // Heavily penalize added sugar
        saturatedFat: 0.25,   // Heavily penalize bad fats
        transFat: 0.20,       // Critical penalty
        sodium: 0.20,         // Heavily penalize sodium
        calorie: 0.03,        // Minor penalty for empty calories
        protein: 0.01,        // Don't care about added protein
        fiber: 0.01,          // Don't care about added fiber
        micronutrient: 0.00,  // Ultra-processed = no nutrients
      };
      aiInsights.push('🚨 Ultra-processed scoring: Strict penalties on all unhealthy components');
    }

    // User health condition adjustments (apply on top of NOVA weights)
    if (user && !user.isHealthy) {
      if (user.hasDiabetes) {
        weights.sugar *= 2.5;
        weights.fiber *= 1.5;
        aiInsights.push('💉 Diabetic scoring: Sugar weight increased significantly');
      }
      if (user.hasHighCholesterol) {
        weights.saturatedFat *= 2.0;
        weights.transFat *= 2.0;
        weights.fiber *= 1.3;
        aiInsights.push('💓 High cholesterol scoring: Fat weights increased');
      }
      if (user.hasHighBloodPressure) {
        weights.sodium *= 2.5;
        aiInsights.push('🩺 High blood pressure scoring: Sodium weight increased');
      }
      
      if (user.bmiCategory === 'Obese') {
        weights.calorie *= 2.0;
        weights.protein *= 1.5;
        weights.fiber *= 1.5;
      } else if (user.bmiCategory === 'Overweight') {
        weights.calorie *= 1.5;
        weights.protein *= 1.3;
        weights.fiber *= 1.3;
      } else if (user.bmiCategory === 'Underweight') {
        weights.calorie *= 0.5; // Don't penalize calories
        weights.protein *= 2.0;
      }

      // Normalize weights to sum to 1.0
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      weights = {
        sugar: weights.sugar / sum,
        saturatedFat: weights.saturatedFat / sum,
        transFat: weights.transFat / sum,
        sodium: weights.sodium / sum,
        calorie: weights.calorie / sum,
        protein: weights.protein / sum,
        fiber: weights.fiber / sum,
        micronutrient: weights.micronutrient / sum,
      };
    }

    return weights;
  }

  private getCategory(score: number): OptimizedHealthScore['category'] {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  }
}

export default new OptimizedScoringService();
