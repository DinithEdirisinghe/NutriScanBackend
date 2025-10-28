# 🧠 Advanced Diet Risk Formula - Implementation Guide

## Overview

This implementation provides a comprehensive, scientifically-grounded health scoring system that evaluates how suitable a food product is for a specific person based on their detailed health markers and the food's nutritional composition.

## Key Features

✅ **15 Health Markers** - Comprehensive health profile including blood tests, physical measurements, and vital signs
✅ **10 Nutrient Parameters** - Detailed food composition analysis
✅ **Personalized Risk Assessment** - Dynamic weighting based on individual health conditions
✅ **Confidence Scoring** - Transparent indication of result reliability
✅ **Backward Compatible** - Works seamlessly with existing system

## Architecture

```
User Health Profile → PersonMarkers
                    ↓
Food Nutrition Data → FoodNutrients
                    ↓
    Diet Risk Formula (dietRisk.ts)
                    ↓
  Advanced Scoring Service (advancedScoring.service.ts)
                    ↓
        Scan Controller
```

## Database Schema Updates

### New User Fields

The following fields have been added to the `users` table:

**Blood Glucose Markers:**

- `hba1c` - HbA1c percentage (4.5-9%)

**Lipid Panel:**

- `hdl_cholesterol_mg_dl` - HDL cholesterol (25-80 mg/dL)
- `triglycerides_mg_dl` - Triglycerides (50-300 mg/dL)

**Liver Enzymes:**

- `alt_u_l` - ALT (5-90 U/L)
- `ast_u_l` - AST (5-90 U/L)
- `ggt_u_l` - GGT (10-100 U/L)

**Kidney Function:**

- `creatinine_mg_dl` - Creatinine (0.4-2 mg/dL)

**Inflammation & Other Markers:**

- `crp_mg_l` - C-reactive protein (0.1-10 mg/L)
- `uric_acid_mg_dl` - Uric acid (3-9 mg/dL)

**Physical Measurements:**

- `waist_cm` - Waist circumference (60-140 cm)
- `bmi` - Body Mass Index (14-45 kg/m²)

**Blood Pressure:**

- `systolic_bp_mmhg` - Systolic BP (90-200 mmHg)
- `diastolic_bp_mmhg` - Diastolic BP (50-120 mmHg)

**Demographics:**

- `age` - Age in years

## API Usage

### Endpoint: POST /api/scan/analyze

The endpoint now automatically uses the advanced scoring formula when user data is available.

**Request:**

```typescript
// Same as before - no changes needed!
POST /api/scan/analyze
Headers: Authorization: Bearer <token>
Body: FormData with image file
```

**Response:**

```json
{
  "success": true,
  "nutritionData": { ... },
  "healthScore": {
    "overallScore": 68,
    "confidence": 0.73,
    "category": "Good",
    "breakdown": {
      "sugarScore": 85,
      "fatScore": 45,
      "sodiumScore": 75,
      "calorieScore": 90
    },
    "warnings": [
      "🚨 CRITICAL: Very high LDL cholesterol - saturated fat is extremely dangerous",
      "⚠️ High saturated fat: 5.5g"
    ],
    "recommendations": [
      "❤️ Choose fat-free or very low-fat options - you have very high cholesterol",
      "💡 Choose products with < 1g saturated fat per serving"
    ],
    "details": {
      "markerRisks": {
        "glucose": 0.05,
        "ldl": 0.23,
        "bmi": 0.08,
        ...
      },
      "nutrientImpacts": {
        "glucose": 0.12,
        "ldl": 0.45,
        ...
      },
      "missingMarkers": ["alt", "ast", "ggt"],
      "missingNutrients": ["fiber"],
      "availableMarkersCount": 12,
      "totalMarkersCount": 15
    }
  },
  "aiAdvice": { ... }
}
```

## Example Usage

### 1. Direct Formula Usage

```typescript
import { computeWithPhysicals, scaleToHundred } from "./services/dietRisk";

const person = {
  age: 27,
  glucose: 115,
  ldl: 160,
  hdl: 38,
  triglycerides: 210,
  systolic: 135,
  diastolic: 85,
  height: 174,
  weight: 80,
};

const food = {
  calories: 620,
  sugar: 35,
  sfa: 14,
  sodium: 1200,
  fiber: 2,
  protein: 25,
  carbs: 55,
  transFat: 1,
};

const result = computeWithPhysicals(person, food);
const scaledResult = scaleToHundred(result);

console.log(`Score: ${scaledResult.score}/100`);
console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
```

### 2. Through Advanced Scoring Service

```typescript
import advancedScoringService from "./services/advancedScoring.service";

const nutritionData = {
  servingSize: "100g",
  calories: 620,
  sugars: 35,
  saturatedFat: 14,
  sodium: 1200,
  // ... other nutrition data
};

const user = await userRepository.findOne({ where: { id: userId } });
const healthScore = advancedScoringService.calculateAdvancedScore(
  nutritionData,
  user
);
```

## How It Works

### 1. Normalization

All values are normalized to [0, 1] range:

```typescript
normalized = (value - low) / (high - low);
```

### 2. Nutrient → Marker Mapping

Each nutrient affects specific health markers with configured weights:

```typescript
sugar → glucose (1.0), hba1c (0.8), triglycerides (0.6), bmi (0.6), waist (0.7)
sfa → ldl (1.0), hdl (-0.4), crp (0.3), bmi (0.3), waist (0.4)
```

### 3. Risk Calculation

For each marker:

```typescript
impact = Σ(nutrient_coefficient × nutrient_normalized)
risk = weight × marker_normalized × impact × (1 + γ × marker_normalized)
```

### 4. Final Score

```typescript
totalRisk = Σ(marker_risks);
score = 1 - totalRisk / totalWeight;
```

## Configuration

You can customize the formula by providing a custom `ModelConfig`:

```typescript
import { defaultConfig } from "./services/dietRisk";

const customConfig = {
  ...defaultConfig,
  gamma: 0.5, // Increase interaction term
  markerWeights: {
    ...defaultConfig.markerWeights,
    ldl: 0.15, // Increase LDL weight
  },
};

const result = computeWithPhysicals(person, food, customConfig);
```

## Migration Guide

### Running the Migration

```bash
# Generate migration (if using TypeORM CLI)
npm run typeorm migration:run

# Or manually run the migration
# The migration file is in: src/migrations/AddAdvancedHealthMarkers.ts
```

### Updating Existing Users

Users will automatically use the advanced formula once they add additional health markers. The system gracefully handles missing data:

- If < 50% markers available → low confidence warning
- Missing markers → their weights redistributed to available ones
- No user data → falls back to basic scoring

## Testing

### Test with Full Profile

```typescript
const fullProfile = {
  glucose: 95,
  hba1c: 5.4,
  ldl: 120,
  hdl: 55,
  triglycerides: 150,
  alt: 25,
  ast: 20,
  ggt: 30,
  creatinine: 0.9,
  crp: 1.5,
  uricAcid: 5.5,
  bmi: 22.5,
  waist: 85,
  systolic: 120,
  diastolic: 80,
  age: 30,
};

const healthyFood = {
  calories: 150,
  sugar: 5,
  sfa: 1,
  transFat: 0,
  unsatFat: 8,
  sodium: 100,
  cholesterol: 0,
  fiber: 5,
  protein: 10,
  carbs: 15,
};

const result = computeWithPhysicals(fullProfile, healthyFood);
// Expected: High score (0.8-0.95), high confidence (1.0)
```

### Test with Partial Profile

```typescript
const partialProfile = {
  glucose: 115,
  ldl: 160,
  height: 174,
  weight: 80,
};

const unhealthyFood = {
  calories: 620,
  sugar: 35,
  sfa: 14,
  sodium: 1200,
  transFat: 1,
};

const result = computeWithPhysicals(partialProfile, unhealthyFood);
// Expected: Low score (0.2-0.4), lower confidence (0.3-0.5)
```

## Performance Considerations

- **Computation Time**: ~5-10ms per calculation
- **Database Impact**: Minimal - only reads user profile once
- **Memory Usage**: Negligible - all calculations are lightweight

## Future Enhancements

1. **Machine Learning Integration**: Train on user feedback to refine weights
2. **Temporal Analysis**: Track marker trends over time
3. **Food Category Profiles**: Different formulas for different food types
4. **Medication Interactions**: Factor in current medications
5. **Regional Variations**: Adjust thresholds based on population norms

## Support

For questions or issues:

1. Check the inline documentation in `dietRisk.ts`
2. Review example usage in `advancedScoring.service.ts`
3. Consult the original specification document

## License

Proprietary - NutriScan Backend System
