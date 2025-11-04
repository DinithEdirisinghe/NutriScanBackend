/**
 * Serving Size Utility
 * Parses serving size strings and normalizes nutrient values to per-100g/100ml standard
 */

export interface ParsedServingSize {
  value: number;
  unit: 'g' | 'ml';
  originalString: string;
}

export interface NormalizedNutrients {
  calories?: number;
  totalFat?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  totalCarbs?: number;
  fiber?: number;
  sugars?: number;
  protein?: number;
}

/**
 * Parse serving size string to extract numeric value and unit
 * Examples: "250ml", "20g", "20 g 4 Wafer Sticks", "per 100g"
 */
export function parseServingSize(servingSize: string | undefined): ParsedServingSize | null {
  if (!servingSize) {
    return null;
  }

  const cleanedString = servingSize.toLowerCase().trim();

  // Match patterns like "250ml", "250 ml", "20g", "20 g"
  const numberUnitPattern = /(\d+(?:\.\d+)?)\s*(g|ml|gram|milliliter)/i;
  const match = cleanedString.match(numberUnitPattern);

  if (match) {
    const value = parseFloat(match[1]);
    let unit: 'g' | 'ml' = 'g';

    if (match[2].startsWith('ml') || match[2].startsWith('milliliter')) {
      unit = 'ml';
    }

    return {
      value,
      unit,
      originalString: servingSize,
    };
  }

  // If already per 100g/100ml, return 100
  if (cleanedString.includes('per 100') || cleanedString.includes('/100')) {
    const isLiquid = cleanedString.includes('ml');
    return {
      value: 100,
      unit: isLiquid ? 'ml' : 'g',
      originalString: servingSize,
    };
  }

  return null;
}

/**
 * Normalize all nutrient values to per-100g/100ml standard
 * Formula: (rawValue / servingSize) * 100
 */
export function normalizeNutrients(
  rawNutrients: NormalizedNutrients,
  servingSize: string | undefined
): NormalizedNutrients {
  const parsed = parseServingSize(servingSize);

  // If no serving size or already per 100g/100ml, return as is
  if (!parsed || parsed.value === 100) {
    return rawNutrients;
  }

  const multiplier = 100 / parsed.value;

  const normalized: NormalizedNutrients = {};

  // Normalize each nutrient
  if (rawNutrients.calories !== undefined) {
    normalized.calories = rawNutrients.calories * multiplier;
  }
  if (rawNutrients.totalFat !== undefined) {
    normalized.totalFat = rawNutrients.totalFat * multiplier;
  }
  if (rawNutrients.saturatedFat !== undefined) {
    normalized.saturatedFat = rawNutrients.saturatedFat * multiplier;
  }
  if (rawNutrients.transFat !== undefined) {
    normalized.transFat = rawNutrients.transFat * multiplier;
  }
  if (rawNutrients.cholesterol !== undefined) {
    normalized.cholesterol = rawNutrients.cholesterol * multiplier;
  }
  if (rawNutrients.sodium !== undefined) {
    normalized.sodium = rawNutrients.sodium * multiplier;
  }
  if (rawNutrients.totalCarbs !== undefined) {
    normalized.totalCarbs = rawNutrients.totalCarbs * multiplier;
  }
  if (rawNutrients.fiber !== undefined) {
    normalized.fiber = rawNutrients.fiber * multiplier;
  }
  if (rawNutrients.sugars !== undefined) {
    normalized.sugars = rawNutrients.sugars * multiplier;
  }
  if (rawNutrients.protein !== undefined) {
    normalized.protein = rawNutrients.protein * multiplier;
  }

  return normalized;
}
