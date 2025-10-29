import { NutritionData } from './ocr.service';
import { User } from '../entities/User.entity';
import {
  PersonMarkers,
  FoodNutrients,
  computeWithPhysicals,
  scaleToHundred,
  getRiskCategory,
  defaultConfig,
  ModelConfig,
  SuitabilityResult,
} from './dietRisk';

export interface AdvancedHealthScore {
  overallScore: number; // 0-100
  confidence: number; // 0-1
  category: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor'; // Match HealthScore type
  breakdown: {
    sugarScore: number;
    fatScore: number;
    sodiumScore: number;
    calorieScore: number;
  };
  warnings: string[];
  recommendations: string[];
  details?: {
    markerRisks: { [key: string]: number };
    nutrientImpacts: { [key: string]: number };
    missingMarkers: string[];
    missingNutrients: string[];
    availableMarkersCount: number;
    totalMarkersCount: number;
  };
}

export class AdvancedScoringService {
  private config: ModelConfig;

  constructor(config: ModelConfig = defaultConfig) {
    this.config = config;
  }

  /**
   * Convert User entity to PersonMarkers interface
   */
  private userToPersonMarkers(user: User): PersonMarkers {
    return {
      // Blood glucose markers
      glucose: user.glucose ? Number(user.glucose) : undefined,
      hba1c: user.hba1c ? Number(user.hba1c) : undefined,

      // Lipid panel
      ldl: user.ldl ? Number(user.ldl) : undefined,
      hdl: user.hdl ? Number(user.hdl) : undefined,
      triglycerides: user.triglycerides ? Number(user.triglycerides) : undefined,

      // Liver enzymes
      alt: user.alt ? Number(user.alt) : undefined,
      ast: user.ast ? Number(user.ast) : undefined,
      ggt: user.ggt ? Number(user.ggt) : undefined,

      // Kidney function
      creatinine: user.creatinine ? Number(user.creatinine) : undefined,

      // Inflammation & other markers
      crp: user.crp ? Number(user.crp) : undefined,
      uricAcid: user.uric_acid ? Number(user.uric_acid) : undefined,

      // Physical measurements
      bmi: user.bmi ? Number(user.bmi) : undefined,
      waist: user.waist ? Number(user.waist) : undefined,
      height: user.height ? Number(user.height) : undefined,
      weight: user.weight ? Number(user.weight) : undefined,

      // Blood pressure
      systolic: user.systolic,
      diastolic: user.diastolic,

      // Demographics
      age: user.age,
    };
  }

  /**
   * Convert NutritionData to FoodNutrients interface
   */
  private nutritionToFoodNutrients(nutrition: NutritionData): FoodNutrients {
    // Parse serving size from string (e.g., "20g" -> 20, "266ml" -> 266)
    let servingSize: number | undefined;
    if (nutrition.servingSize) {
      // Extract number and unit (e.g., "266ml" -> ["266", "ml"])
      const match = nutrition.servingSize.match(/(\d+(?:\.\d+)?)\s*(ml|g|mg|oz|fl oz)?/i);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2]?.toLowerCase() || 'g'; // Default to grams if no unit
        
        // Convert to grams if needed
        if (unit === 'ml' || unit === 'fl oz') {
          // For liquids, assume density ≈ 1 g/ml (water-like beverages)
          // This is accurate for water, soda, juice, milk (0.95-1.05 g/ml)
          servingSize = unit === 'fl oz' ? value * 29.5735 : value; // 1 fl oz ≈ 29.57 ml ≈ 29.57 g
          console.log(`📦 Parsed serving size: "${nutrition.servingSize}" → ${value}${unit} → ${servingSize}g (liquid)`);
        } else if (unit === 'oz') {
          // Solid ounces to grams (1 oz = 28.35 g)
          servingSize = value * 28.3495;
          console.log(`📦 Parsed serving size: "${nutrition.servingSize}" → ${value}${unit} → ${servingSize}g`);
        } else {
          // Already in grams or mg
          servingSize = unit === 'mg' ? value / 1000 : value;
          console.log(`📦 Parsed serving size: "${nutrition.servingSize}" → ${servingSize}g`);
        }
      }
    }
    
    return {
      servingSize,
      calories: nutrition.calories,
      sugar: nutrition.sugars,
      sfa: nutrition.saturatedFat,
      transFat: nutrition.transFat,
      unsatFat: nutrition.totalFat ? nutrition.totalFat - (nutrition.saturatedFat || 0) : undefined,
      sodium: nutrition.sodium,
      cholesterol: nutrition.cholesterol,
      fiber: nutrition.dietaryFiber,
      protein: nutrition.protein,
      carbs: nutrition.totalCarbohydrates,
    };
  }

  /**
   * Calculate advanced health score using the diet risk formula
   */
  calculateAdvancedScore(
    nutritionData: NutritionData,
    user?: User,
    scoringMode?: 'portion-aware' | 'per-100g'
  ): AdvancedHealthScore {
    console.log('🧠 Calculating advanced health score using diet risk formula...');
    console.log('📊 Nutrition data:', nutritionData);
    console.log('👤 User profile:', user);
    console.log('⚙️ Scoring mode:', scoringMode || user?.scoringMode || 'portion-aware');

    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Convert data to required formats
    const personMarkers = user ? this.userToPersonMarkers(user) : {};
    const foodNutrients = this.nutritionToFoodNutrients(nutritionData);

    // Determine scoring mode (parameter > user preference > default)
    const effectiveScoringMode = scoringMode || (user?.scoringMode as 'portion-aware' | 'per-100g') || 'portion-aware';

    // Compute suitability using the diet risk formula
    const result: SuitabilityResult = computeWithPhysicals(
      personMarkers,
      foodNutrients,
      this.config,
      effectiveScoringMode
    );

    // Scale to 0-100
    const scaledResult = scaleToHundred(result);
    const categoryString = getRiskCategory(result.score);
    
    // Convert to proper type
    const category: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor' = 
      categoryString as 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';

    // Generate warnings and recommendations based on the analysis
    this.generateWarningsAndRecommendations(
      personMarkers,
      foodNutrients,
      result,
      warnings,
      recommendations
    );

    // Calculate component scores for backward compatibility
    const breakdown = this.calculateComponentScores(
      nutritionData,
      personMarkers,
      result
    );

    const advancedScore: AdvancedHealthScore = {
      overallScore: scaledResult.score,
      confidence: result.confidence,
      category,
      breakdown,
      warnings,
      recommendations,
      details: result.details ? {
        ...result.details,
        availableMarkersCount: Object.keys(this.config.markerBounds).length - (result.details.missingMarkers?.length || 0),
        totalMarkersCount: Object.keys(this.config.markerBounds).length,
      } : undefined,
    };

    console.log('✅ Advanced score calculated:', advancedScore);
    return advancedScore;
  }

  /**
   * Generate warnings and recommendations based on the analysis
   */
  private generateWarningsAndRecommendations(
    person: PersonMarkers,
    food: FoodNutrients,
    result: SuitabilityResult,
    warnings: string[],
    recommendations: string[]
  ): void {
    // Check for critical health markers
    if (person.glucose && person.glucose >= 126) {
      warnings.push('🚨 CRITICAL: You have diabetes - sugar intake must be strictly limited');
      recommendations.push('🩸 Choose sugar-free options - you have diabetes');
    } else if (person.glucose && person.glucose >= 100) {
      warnings.push('⚠️ High blood sugar detected - pre-diabetes risk');
      recommendations.push('🩸 Reduce sugar intake - you have pre-diabetes risk');
    }

    if (person.ldl && person.ldl >= 160) {
      warnings.push('🚨 CRITICAL: Very high LDL cholesterol - saturated fat is extremely dangerous');
      recommendations.push('❤️ Choose fat-free or very low-fat options - you have very high cholesterol');
    } else if (person.ldl && person.ldl >= 130) {
      warnings.push('⚠️ High LDL cholesterol - limit saturated fat intake');
      recommendations.push('❤️ Reduce saturated fat - you have borderline high cholesterol');
    }

    // Check for critical nutrients
    if (food.transFat && food.transFat > 0) {
      warnings.push(`⚠️ Contains trans fat: ${food.transFat}g (Should be 0g)`);
      recommendations.push('💡 Avoid trans fats - they increase heart disease risk');
      
      if (person.ldl && person.ldl >= 130) {
        warnings.push('🚨 CRITICAL: Trans fat is especially dangerous with high cholesterol!');
      }
    }

    if (food.sugar && food.sugar > 20) {
      warnings.push(`⚠️ Very high sugar: ${food.sugar}g`);
      recommendations.push('💡 Look for "no added sugar" or "sugar-free" alternatives');
    }

    if (food.sfa && food.sfa > 5) {
      warnings.push(`⚠️ High saturated fat: ${food.sfa}g`);
      recommendations.push('💡 Choose products with < 1g saturated fat per serving');
    }

    if (food.sodium && food.sodium > 600) {
      warnings.push(`⚠️ Very high sodium: ${food.sodium}mg`);
      recommendations.push('💡 Look for "low sodium" (< 140mg) or "no salt added" options');
    }

    if (food.calories && food.calories > 600) {
      warnings.push(`⚠️ Very high calories: ${food.calories} cal`);
      recommendations.push('💡 Consider portion control or lower-calorie alternatives');
    }

    // BMI-based recommendations
    if (person.bmi && person.bmi >= 30) {
      recommendations.push(`⚖️ Focus on low-calorie options - your BMI is ${person.bmi.toFixed(1)} (obese range)`);
    } else if (person.bmi && person.bmi >= 25) {
      recommendations.push(`⚖️ Watch portion sizes - your BMI is ${person.bmi.toFixed(1)} (overweight)`);
    }

    // Low confidence warning
    if (result.confidence < 0.5) {
      warnings.push('⚠️ Low confidence score - many health markers are missing');
      recommendations.push('💡 Complete your health profile for more accurate recommendations');
    }
  }

  /**
   * Calculate component scores for backward compatibility
   */
  private calculateComponentScores(
    nutrition: NutritionData,
    person: PersonMarkers,
    result: SuitabilityResult
  ): { sugarScore: number; fatScore: number; sodiumScore: number; calorieScore: number } {
    // Extract component impacts from the detailed results
    const details = result.details;
    
    // Sugar score based on glucose and HbA1c impacts
    let sugarScore = 100;
    if (details?.markerRisks) {
      const glucoseRisk = details.markerRisks.glucose || 0;
      const hba1cRisk = details.markerRisks.hba1c || 0;
      sugarScore = Math.max(0, 100 - (glucoseRisk + hba1cRisk) * 500);
    }

    // Fat score based on LDL and HDL impacts
    let fatScore = 100;
    if (details?.markerRisks) {
      const ldlRisk = details.markerRisks.ldl || 0;
      const hdlRisk = details.markerRisks.hdl || 0;
      fatScore = Math.max(0, 100 - (ldlRisk + hdlRisk) * 500);
    }

    // Sodium score based on blood pressure impacts
    let sodiumScore = 100;
    if (details?.markerRisks) {
      const systolicRisk = details.markerRisks.systolic || 0;
      const diastolicRisk = details.markerRisks.diastolic || 0;
      sodiumScore = Math.max(0, 100 - (systolicRisk + diastolicRisk) * 500);
    }

    // Calorie score based on BMI and waist impacts
    let calorieScore = 100;
    if (details?.markerRisks) {
      const bmiRisk = details.markerRisks.bmi || 0;
      const waistRisk = details.markerRisks.waist || 0;
      calorieScore = Math.max(0, 100 - (bmiRisk + waistRisk) * 500);
    }

    return {
      sugarScore: Math.round(sugarScore),
      fatScore: Math.round(fatScore),
      sodiumScore: Math.round(sodiumScore),
      calorieScore: Math.round(calorieScore),
    };
  }
}

export default new AdvancedScoringService();
