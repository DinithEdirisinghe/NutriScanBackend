/**
 * 🧠 Diet Risk Formula
 * Document version: 1.0
 * Implementation language: TypeScript
 * 
 * Purpose: Compute a personalized suitability score (0–1 or 0–100) for a given food item
 * based on a user's measurable medical markers and the food's nutritional composition.
 */

export interface PersonMarkers {
  // Blood glucose markers
  glucose?: number;        // mg/dL - Fasting blood sugar
  hba1c?: number;          // % - Average glucose 2–3 months
  
  // Lipid panel
  ldl?: number;            // mg/dL - Low-density lipoprotein
  hdl?: number;            // mg/dL - High-density lipoprotein
  triglycerides?: number;  // mg/dL - Triglycerides
  
  // Liver enzymes
  alt?: number;            // U/L - Alanine aminotransferase
  ast?: number;            // U/L - Aspartate aminotransferase
  ggt?: number;            // U/L - Gamma-glutamyl transferase
  
  // Kidney function
  creatinine?: number;     // mg/dL - Kidney function marker
  
  // Inflammation & other markers
  crp?: number;            // mg/L - C-reactive protein (inflammation)
  uricAcid?: number;       // mg/dL - Gout indicator
  
  // Physical measurements
  bmi?: number;            // kg/m² - Body Mass Index
  waist?: number;          // cm - Abdominal obesity indicator
  systolic?: number;       // mmHg - Blood pressure (upper)
  diastolic?: number;      // mmHg - Blood pressure (lower)
  
  // Demographics
  age?: number;            // years - Optional, scales overall risk
  height?: number;         // cm - Used to compute BMI
  weight?: number;         // kg - Used to compute BMI
}

export interface FoodNutrients {
  servingSize?: number;    // g or ml - Serving size (for density calculation)
  calories?: number;       // kcal/serving - Total energy
  sugar?: number;          // g - Total sugar
  sfa?: number;            // g - Saturated fat
  transFat?: number;       // g - Trans fat
  unsatFat?: number;       // g - Unsaturated fat
  sodium?: number;         // mg - Sodium
  cholesterol?: number;    // mg - Dietary cholesterol
  fiber?: number;          // g - Dietary fiber
  protein?: number;        // g - Protein
  carbs?: number;          // g - Total carbohydrates
}

export interface ModelConfig {
  // Marker normalization bounds
  markerBounds: {
    [key: string]: { low: number; high: number };
  };
  
  // Nutrient normalization bounds
  nutrientBounds: {
    [key: string]: { low: number; high: number };
  };
  
  // Nutrient → Marker mapping coefficients (a₍ⱼ,ₖ₎)
  nutrientMarkerMapping: {
    [nutrient: string]: { [marker: string]: number };
  };
  
  // Marker weights (wₖ)
  markerWeights: {
    [key: string]: number;
  };
  
  // Interaction term coefficient
  gamma: number;
}

export interface SuitabilityResult {
  score: number;       // 0-1 or 0-100
  confidence: number;  // 0-1, fraction of markers available
  details?: {
    markerRisks: { [key: string]: number };
    nutrientImpacts: { [key: string]: number };
    missingMarkers: string[];
    missingNutrients: string[];
  };
}

/**
 * Default configuration for the diet risk model
 */
export const defaultConfig: ModelConfig = {
  markerBounds: {
    glucose: { low: 70, high: 180 },
    hba1c: { low: 4.5, high: 9 },
    ldl: { low: 50, high: 190 },
    hdl: { low: 25, high: 80 },
    triglycerides: { low: 50, high: 300 },
    alt: { low: 5, high: 90 },
    ast: { low: 5, high: 90 },
    ggt: { low: 10, high: 100 },
    creatinine: { low: 0.4, high: 2 },
    crp: { low: 0.1, high: 10 },
    uricAcid: { low: 3, high: 9 },
    bmi: { low: 14, high: 45 },
    waist: { low: 60, high: 140 },
    systolic: { low: 90, high: 200 },
    diastolic: { low: 50, high: 120 },
  },
  
  // NOTE: All nutrient bounds are per 100g/ml to ensure fair comparison
  // regardless of serving size
  nutrientBounds: {
    calories: { low: 0, high: 600 },     // per 100g (very dense foods ~600 kcal/100g)
    sugar: { low: 0, high: 15 },         // per 100g/ml (LOWERED: Coke has ~10.6g/100ml, realistic max ~15g)
    sfa: { low: 0, high: 60 },           // per 100g (butter = ~50g/100g, raised to reduce over-penalization)
    transFat: { low: 0, high: 10 },      // per 100g
    unsatFat: { low: 0, high: 50 },      // per 100g (oils = ~100g/100g)
    sodium: { low: 0, high: 5000 },      // per 100g (salt = ~38,000mg/100g)
    cholesterol: { low: 0, high: 500 },  // per 100g (egg yolk = ~1,085mg/100g)
    fiber: { low: 0, high: 30 },         // per 100g (wheat bran = ~40g/100g)
    protein: { low: 0, high: 80 },       // per 100g (protein powder = ~80g/100g)
    carbs: { low: 0, high: 100 },        // per 100g (pure sugar = 100g/100g)
  },
  
  nutrientMarkerMapping: {
    sugar: {
      glucose: 6.0,     // High penalty for diabetic/pre-diabetic users (reduced from 8.0)
      hba1c: 4.0,       // High penalty for long-term blood sugar impact (reduced from 6.0)
      triglycerides: 2.0, // Moderate penalty (reduced from 2.5)
      bmi: 1.5,         // Moderate penalty (reduced from 2.0)
      waist: 1.5,       // Moderate penalty (reduced from 2.0)
      ldl: 1.0,         // Sugar affects LDL (via triglycerides) (reduced from 1.5)
      crp: 0.8,         // Sugar causes inflammation (reduced from 1.0)
    },
    sfa: {
      ldl: 2.0,       // Moderate-high penalty for high cholesterol users (reduced from 2.5 to prevent over-penalization)
      hdl: -0.4,      // beneficial effect (negative = lowers risk)
      crp: 1.0,       // Moderate inflammation penalty (reduced from 1.2)
      bmi: 0.8,       // Moderate penalty (reduced from 1.0)
      waist: 0.8,     // Moderate penalty (reduced from 1.0)
    },
    transFat: {
      ldl: 1.2,
      hdl: -0.8,  // negative effect on HDL
      crp: 0.4,
    },
    unsatFat: {
      hdl: 0.5,   // beneficial (raises HDL)
    },
    sodium: {
      systolic: 1.0,
      diastolic: 0.9,
    },
    cholesterol: {
      ldl: 0.4,
    },
    fiber: {
      glucose: -0.4,    // beneficial
      ldl: -0.3,        // beneficial
      bmi: -0.2,        // beneficial
    },
    calories: {
      bmi: 1.0,
      waist: 0.6,
    },
    protein: {
      bmi: 0.2,
    },
    carbs: {
      glucose: 0.7,
      triglycerides: 0.3,
      bmi: 0.5,        // Carbs contribute to weight gain
      waist: 0.4,      // Especially refined carbs
    },
  },
  
  markerWeights: {
    glucose: 0.15,      // DOUBLED - critical for diabetic users
    hba1c: 0.12,        // DOUBLED - critical for long-term diabetes risk
    ldl: 0.18,          // Increased 50% - critical for heart disease
    hdl: 0.08,          // Slightly increased
    triglycerides: 0.10, // Increased significantly
    alt: 0.05,
    ast: 0.03,
    ggt: 0.03,
    creatinine: 0.05,
    crp: 0.06,          // Slightly increased
    uricAcid: 0.03,
    bmi: 0.12,          // Increased 20%
    waist: 0.10,        // Increased 25%
    systolic: 0.10,     // Increased 25%
    diastolic: 0.10,    // Increased 25%
  },
  
  gamma: 1.5, // Interaction term coefficient - TRIPLED to severely penalize risky foods for at-risk users
};

/**
 * Normalize a value between 0 and 1 using min-max scaling
 */
function normalize(value: number, low: number, high: number): number {
  if (high === low) return 0.5;
  const normalized = (value - low) / (high - low);
  return Math.max(0, Math.min(1, normalized)); // Clamp to [0, 1]
}

/**
 * Calculate BMI from height and weight
 */
function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * Normalize nutrients to per-100g basis for fair comparison
 * 
 * This ensures that nutrient density is properly accounted for:
 * - 20g food with 5g sugar (25% density) → 25g sugar per 100g
 * - 100g food with 10g sugar (10% density) → 10g sugar per 100g
 * 
 * @param food - Original food nutrients (may be for any serving size)
 * @returns Food nutrients normalized to per-100g basis
 */
function normalizeNutrientsPer100g(food: FoodNutrients): FoodNutrients {
  const servingSize = food.servingSize || 100; // Default to 100g if not provided
  
  // If already 100g, no normalization needed
  if (servingSize === 100) {
    return { ...food };
  }
  
  // Scale all nutrients to per-100g basis
  const scaleFactor = 100 / servingSize;
  
  return {
    servingSize: 100, // Normalized serving size
    calories: food.calories !== undefined ? food.calories * scaleFactor : undefined,
    sugar: food.sugar !== undefined ? food.sugar * scaleFactor : undefined,
    sfa: food.sfa !== undefined ? food.sfa * scaleFactor : undefined,
    transFat: food.transFat !== undefined ? food.transFat * scaleFactor : undefined,
    unsatFat: food.unsatFat !== undefined ? food.unsatFat * scaleFactor : undefined,
    sodium: food.sodium !== undefined ? food.sodium * scaleFactor : undefined,
    cholesterol: food.cholesterol !== undefined ? food.cholesterol * scaleFactor : undefined,
    fiber: food.fiber !== undefined ? food.fiber * scaleFactor : undefined,
    protein: food.protein !== undefined ? food.protein * scaleFactor : undefined,
    carbs: food.carbs !== undefined ? food.carbs * scaleFactor : undefined,
  };
}

/**
 * Calculate serving size risk multiplier
 * 
 * Small serving sizes often indicate concentrated/processed foods that should
 * carry slightly higher risk. This multiplier gently amplifies the risk for very small servings.
 * 
 * Examples:
 * - 10g serving → 1.15× risk multiplier (very concentrated, like candy)
 * - 20g serving → 1.10× risk multiplier (concentrated, like chips)
 * - 50g serving → 1.04× risk multiplier (moderately concentrated)
 * - 100g serving → 1.0× baseline (standard comparison)
 * - 200g serving → 0.95× risk multiplier (dilute, like soup)
 * 
 * @param servingSize - Serving size in grams
 * @returns Risk multiplier (1.0 = baseline for 100g)
 */
function calculateServingSizeRiskMultiplier(servingSize: number): number {
  const baseSize = 100; // Reference serving size
  
  if (servingSize >= baseSize) {
    // Large servings get slight reduction (0.95× minimum)
    return Math.max(0.95, 1 - (servingSize - baseSize) / 2000);
  } else {
    // Small servings get gently amplified risk (reduced from 0.6 to 0.15)
    // 10g → 1.15×, 20g → 1.10×, 50g → 1.04×, 100g → 1.0×
    const ratio = servingSize / baseSize;
    return 1 + (1 - ratio) * 0.15; // Up to 15% increase for very small servings (was 60%)
  }
}

/**
 * Compute food suitability score
 * 
 * @param person - User's health markers
 * @param food - Food nutritional data
 * @param cfg - Model configuration
 * @param scoringMode - Scoring mode: 'portion-aware' (default) or 'per-100g'
 */
export function computeFoodSuitability(
  person: PersonMarkers,
  food: FoodNutrients,
  cfg: ModelConfig = defaultConfig,
  scoringMode: 'portion-aware' | 'per-100g' = 'portion-aware'
): SuitabilityResult {
  // Step 1: Prepare person markers (calculate BMI if needed)
  const markers = { ...person };
  if (!markers.bmi && markers.height && markers.weight) {
    markers.bmi = calculateBMI(markers.height, markers.weight);
  }
  
  // Step 1.5: Normalize food nutrients to per-100g for fair density comparison
  const originalServingSize = food.servingSize || 100;
  const normalizedFood = normalizeNutrientsPer100g(food);
  
  // Apply serving size multiplier only if in portion-aware mode
  const servingSizeMultiplier = scoringMode === 'portion-aware' 
    ? calculateServingSizeRiskMultiplier(originalServingSize)
    : 1.0;
  
  console.log('🔍 DENSITY DEBUG:');
  console.log(`   Original serving: ${originalServingSize}g`);
  console.log(`   Original SFA: ${food.sfa}g`);
  console.log(`   Normalized SFA (per 100g): ${normalizedFood.sfa}g`);
  console.log(`   Serving size multiplier: ${servingSizeMultiplier.toFixed(2)}×`);
  
  // Step 2: Normalize all markers
  const normalizedMarkers: { [key: string]: number } = {};
  const availableMarkers: string[] = [];
  const missingMarkers: string[] = [];
  
  Object.keys(cfg.markerBounds).forEach(markerKey => {
    const value = (markers as any)[markerKey];
    if (value !== undefined && value !== null) {
      const bounds = cfg.markerBounds[markerKey];
      normalizedMarkers[markerKey] = normalize(value, bounds.low, bounds.high);
      availableMarkers.push(markerKey);
    } else {
      missingMarkers.push(markerKey);
    }
  });
  
  // Step 3: Normalize all nutrients (now using per-100g normalized values)
  const normalizedNutrients: { [key: string]: number } = {};
  const availableNutrients: string[] = [];
  const missingNutrients: string[] = [];
  
  Object.keys(cfg.nutrientBounds).forEach(nutrientKey => {
    const value = (normalizedFood as any)[nutrientKey];
    if (value !== undefined && value !== null) {
      const bounds = cfg.nutrientBounds[nutrientKey];
      normalizedNutrients[nutrientKey] = normalize(value, bounds.low, bounds.high);
      availableNutrients.push(nutrientKey);
    } else {
      missingNutrients.push(nutrientKey);
    }
  });
  
  // Step 4: Calculate nutrient impact on each marker
  const markerImpacts: { [key: string]: number } = {};
  
  Object.keys(cfg.markerBounds).forEach(markerKey => {
    let impact = 0;
    
    // For each nutrient, check if it affects this marker
    Object.keys(cfg.nutrientMarkerMapping).forEach(nutrientKey => {
      const mapping = cfg.nutrientMarkerMapping[nutrientKey];
      if (mapping[markerKey] !== undefined && normalizedNutrients[nutrientKey] !== undefined) {
        impact += mapping[markerKey] * normalizedNutrients[nutrientKey];
      }
    });
    
    markerImpacts[markerKey] = impact;
  });
  
  // Step 5: Calculate risk for each marker
  const markerRisks: { [key: string]: number } = {};
  let totalRisk = 0;
  let totalWeight = 0;
  
  availableMarkers.forEach(markerKey => {
    const markerNorm = normalizedMarkers[markerKey];
    const impact = markerImpacts[markerKey] || 0;
    const weight = cfg.markerWeights[markerKey] || 0;
    
    // Base risk calculation
    let risk = weight * markerNorm * impact;
    
    // Add interaction term (amplifies risk if marker is already high)
    risk = risk * (1 + cfg.gamma * markerNorm);
    
    markerRisks[markerKey] = risk;
    totalRisk += risk;
    totalWeight += weight;
  });
  
  // Step 6: Calculate final suitability score
  // Apply serving size multiplier to amplify risk for small/concentrated servings
  const adjustedRisk = totalWeight > 0 ? (totalRisk / totalWeight) * servingSizeMultiplier : 0;
  let score = Math.max(0, Math.min(1, 1 - adjustedRisk));
  
  // Step 6.5: Apply penalty for nutritionally empty foods
  // If a food has ZERO protein AND ZERO fiber AND has calories, it's nutritionally empty (e.g., soda, candy)
  // These foods should score lower because they provide only calories without nutrients
  // EXCEPTION: Zero-calorie foods/beverages (water, tea, diet soda) are NOT penalized
  const hasProtein = normalizedFood.protein !== undefined && normalizedFood.protein > 0;
  const hasFiber = normalizedFood.fiber !== undefined && normalizedFood.fiber > 0;
  const isProteinZero = normalizedFood.protein !== undefined && normalizedFood.protein === 0;
  const isFiberZero = normalizedFood.fiber !== undefined && normalizedFood.fiber === 0;
  const hasCalories = normalizedFood.calories !== undefined && normalizedFood.calories > 0;
  
  // Penalty 1: Nutritionally empty (protein=0 AND fiber=0)
  if (isProteinZero && isFiberZero && hasCalories) {
    // Nutritionally empty food with calories - apply 25% penalty (multiply score by 0.75)
    // Examples: soda, candy, sugar water
    const originalScore = score;
    score = score * 0.75;
    console.warn(`⚠️ NUTRITIONAL EMPTINESS PENALTY: protein=0, fiber=0, ${normalizedFood.calories}cal`);
    console.log(`   Score before penalty: ${(originalScore * 100).toFixed(0)}/100`);
    console.log(`   Score after 25% penalty: ${(score * 100).toFixed(0)}/100`);
  } else if (isProteinZero && isFiberZero && !hasCalories) {
    // Zero-calorie beverage (water, tea, diet soda) - NO PENALTY
    console.log(`✅ ZERO-CALORIE BEVERAGE: No nutritional emptiness penalty`);
  } else if (!hasProtein && !hasFiber) {
    // Both missing from label (unknown) - smaller penalty (15%)
    const originalScore = score;
    score = score * 0.85;
    console.warn(`⚠️ MISSING NUTRITION DATA PENALTY: protein AND fiber not on label`);
    console.log(`   Score before penalty: ${(originalScore * 100).toFixed(0)}/100`);
    console.log(`   Score after 15% penalty: ${(score * 100).toFixed(0)}/100`);
  }
  
  // Penalty 2: Lack of fiber (fiber=0 or missing) - DISABLED
  // This penalty was making scores too harsh
  // Fiber benefits are already captured in the positive fiber coefficient
  /*
  if ((isFiberZero || !hasFiber) && hasCalories && (normalizedFood.calories || 0) > 20) {
    const originalScore = score;
    score = score * 0.9;
    console.warn(`⚠️ LACK OF FIBER PENALTY: fiber=0 or missing`);
    console.log(`   Score before penalty: ${(originalScore * 100).toFixed(0)}/100`);
    console.log(`   Score after 10% penalty: ${(score * 100).toFixed(0)}/100`);
  }
  */
  
  console.log('📊 RISK CALCULATION:');
  console.log(`   Scoring mode: ${scoringMode}`);
  console.log(`   Total risk (before multiplier): ${(totalRisk / totalWeight).toFixed(4)}`);
  console.log(`   Adjusted risk (after ${servingSizeMultiplier.toFixed(2)}× multiplier): ${adjustedRisk.toFixed(4)}`);
  console.log(`   Final score (1 - risk): ${score.toFixed(4)} = ${(score * 100).toFixed(0)}/100`);
  
  // Step 7: Calculate confidence
  const totalMarkers = Object.keys(cfg.markerBounds).length;
  const confidence = availableMarkers.length / totalMarkers;
  
  // Low confidence flag if more than 50% of markers missing
  if (confidence < 0.5) {
    console.warn('⚠️ Low confidence: More than 50% of markers are missing');
  }
  
  // Add serving size info to debug output
  const modeLabel = scoringMode === 'portion-aware' ? '(portion-aware)' : '(per-100g only)';
  console.log(`📏 Serving size: ${originalServingSize}g → Multiplier: ${servingSizeMultiplier.toFixed(2)}× ${modeLabel}`);
  
  return {
    score,
    confidence,
    details: {
      markerRisks,
      nutrientImpacts: markerImpacts,
      missingMarkers,
      missingNutrients,
    },
  };
}

/**
 * Convenience wrapper that automatically calculates BMI
 */
export function computeWithPhysicals(
  person: PersonMarkers,
  food: FoodNutrients,
  cfg: ModelConfig = defaultConfig,
  scoringMode: 'portion-aware' | 'per-100g' = 'portion-aware'
): SuitabilityResult {
  return computeFoodSuitability(person, food, cfg, scoringMode);
}

/**
 * Scale score from 0-1 to 0-100
 */
export function scaleToHundred(result: SuitabilityResult): SuitabilityResult {
  return {
    ...result,
    score: Math.round(result.score * 100),
  };
}

/**
 * Get risk category based on score
 */
export function getRiskCategory(score: number): string {
  if (score >= 0.8) return 'Excellent';
  if (score >= 0.6) return 'Good';
  if (score >= 0.4) return 'Fair';
  if (score >= 0.2) return 'Poor';
  return 'Very Poor';
}
