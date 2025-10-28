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
  
  nutrientBounds: {
    calories: { low: 0, high: 1000 },
    sugar: { low: 0, high: 60 },
    sfa: { low: 0, high: 20 },
    transFat: { low: 0, high: 5 },
    unsatFat: { low: 0, high: 20 },
    sodium: { low: 0, high: 2000 },
    cholesterol: { low: 0, high: 300 },
    fiber: { low: 0, high: 15 },
    protein: { low: 0, high: 40 },
    carbs: { low: 0, high: 100 },
  },
  
  nutrientMarkerMapping: {
    sugar: {
      glucose: 8.0,     // EXTREMELY high penalty for diabetic/pre-diabetic users
      hba1c: 6.0,       // Very high penalty for long-term blood sugar impact
      triglycerides: 2.5, // Increased penalty
      bmi: 2.0,         // Increased penalty
      waist: 2.0,       // Increased penalty
    },
    sfa: {
      ldl: 5.0,       // EXTREMELY high penalty for high cholesterol users
      hdl: -0.4,      // beneficial effect (negative = lowers risk)
      crp: 1.5,       // Increased inflammation penalty
      bmi: 1.5,       // Increased penalty
      waist: 1.5,     // Increased penalty
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
 * Compute food suitability score
 */
export function computeFoodSuitability(
  person: PersonMarkers,
  food: FoodNutrients,
  cfg: ModelConfig = defaultConfig
): SuitabilityResult {
  // Step 1: Prepare person markers (calculate BMI if needed)
  const markers = { ...person };
  if (!markers.bmi && markers.height && markers.weight) {
    markers.bmi = calculateBMI(markers.height, markers.weight);
  }
  
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
  
  // Step 3: Normalize all nutrients
  const normalizedNutrients: { [key: string]: number } = {};
  const availableNutrients: string[] = [];
  const missingNutrients: string[] = [];
  
  Object.keys(cfg.nutrientBounds).forEach(nutrientKey => {
    const value = (food as any)[nutrientKey];
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
  // Normalize by available weights
  const normalizedRisk = totalWeight > 0 ? totalRisk / totalWeight : 0;
  const score = Math.max(0, Math.min(1, 1 - normalizedRisk));
  
  // Step 7: Calculate confidence
  const totalMarkers = Object.keys(cfg.markerBounds).length;
  const confidence = availableMarkers.length / totalMarkers;
  
  // Low confidence flag if more than 50% of markers missing
  if (confidence < 0.5) {
    console.warn('⚠️ Low confidence: More than 50% of markers are missing');
  }
  
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
  cfg: ModelConfig = defaultConfig
): SuitabilityResult {
  return computeFoodSuitability(person, food, cfg);
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
