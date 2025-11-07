const OptimizedScoringService = require('./dist/services/optimized-scoring.service').default;

console.log('\n🔬 VALIDATION SET TEST - Testing Formula Generalization\n');
console.log('Testing on foods NOT in the training set to verify no overfitting');
console.log('=' .repeat(80));

const validationFoods = [
  {
    name: 'Salmon (wild-caught)',
    expected: '85-95',
    data: {
      calories: 208,
      totalFat: 13,
      saturatedFat: 3.1,
      transFat: 0,
      cholesterol: 63,
      sodium: 59,
      totalCarbohydrates: 0,
      dietaryFiber: 0,
      sugars: 0,
      protein: 22,
      servingSize: '100g',
      foodContext: {
        foodName: 'Wild Salmon',
        confidence: 'high',
        category: 'protein',
        processingLevel: 'whole',
        cookingMethod: 'grilled',
        sugarType: 'none',
        fatType: 'healthy-unsaturated',
        fatSources: ['omega-3', 'polyunsaturated'],
        carbType: 'none',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-low',
        glycemicReasoning: 'Zero carbs, high protein',
        overallQuality: 'excellent',
        qualityReasoning: 'Omega-3 rich protein source'
      }
    }
  },
  {
    name: 'White Bread',
    expected: '35-50',
    data: {
      calories: 265,
      totalFat: 3.2,
      saturatedFat: 0.7,
      transFat: 0,
      cholesterol: 0,
      sodium: 491,
      totalCarbohydrates: 49,
      dietaryFiber: 2.7,
      sugars: 5,
      protein: 9,
      servingSize: '100g',
      foodContext: {
        foodName: 'White Bread',
        confidence: 'high',
        category: 'grain',
        processingLevel: 'processed',
        cookingMethod: 'baked',
        sugarType: 'added',
        fatType: 'mixed',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: true,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'high',
        glycemicReasoning: 'Refined carbs, high GI',
        overallQuality: 'fair',
        qualityReasoning: 'Processed grain with added sugar'
      }
    }
  },
  {
    name: 'Spinach (fresh)',
    expected: '90-100',
    data: {
      calories: 23,
      totalFat: 0.4,
      saturatedFat: 0.1,
      transFat: 0,
      cholesterol: 0,
      sodium: 79,
      totalCarbohydrates: 3.6,
      dietaryFiber: 2.2,
      sugars: 0.4,
      protein: 2.9,
      servingSize: '100g',
      foodContext: {
        foodName: 'Fresh Spinach',
        confidence: 'high',
        category: 'vegetable',
        processingLevel: 'whole',
        cookingMethod: 'raw',
        sugarType: 'natural',
        fatType: 'none',
        carbType: 'complex',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-low',
        glycemicReasoning: 'Low carbs, high nutrients',
        overallQuality: 'excellent',
        qualityReasoning: 'Nutrient-dense leafy green'
      }
    }
  },
  {
    name: 'Potato Chips (regular)',
    expected: '5-15',
    data: {
      calories: 536,
      totalFat: 35,
      saturatedFat: 3.1,
      transFat: 0,
      cholesterol: 0,
      sodium: 477,
      totalCarbohydrates: 53,
      dietaryFiber: 3.1,
      sugars: 0.5,
      protein: 6,
      servingSize: '100g',
      foodContext: {
        foodName: 'Potato Chips',
        confidence: 'high',
        category: 'snack',
        processingLevel: 'ultra-processed',
        cookingMethod: 'fried',
        sugarType: 'natural',
        fatType: 'mixed',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'high',
        glycemicReasoning: 'Fried, refined carbs',
        overallQuality: 'very-poor',
        qualityReasoning: 'High fat, high sodium snack'
      }
    }
  },
  {
    name: 'Greek Yogurt (plain, nonfat)',
    expected: '75-90',
    data: {
      calories: 59,
      totalFat: 0.4,
      saturatedFat: 0.1,
      transFat: 0,
      cholesterol: 5,
      sodium: 36,
      totalCarbohydrates: 3.6,
      dietaryFiber: 0,
      sugars: 3.2,
      protein: 10,
      servingSize: '100g',
      foodContext: {
        foodName: 'Plain Greek Yogurt',
        confidence: 'high',
        category: 'dairy',
        processingLevel: 'minimally-processed',
        cookingMethod: 'none',
        sugarType: 'natural',
        fatType: 'none',
        carbType: 'natural',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'low',
        glycemicReasoning: 'High protein, low sugar',
        overallQuality: 'excellent',
        qualityReasoning: 'High protein, probiotic-rich'
      }
    }
  },
  {
    name: 'Candy Bar (chocolate)',
    expected: '0-15',
    data: {
      calories: 479,
      totalFat: 25,
      saturatedFat: 15,
      transFat: 0,
      cholesterol: 7,
      sodium: 147,
      totalCarbohydrates: 63,
      dietaryFiber: 2,
      sugars: 51,
      protein: 4,
      servingSize: '100g',
      foodContext: {
        foodName: 'Chocolate Candy Bar',
        confidence: 'high',
        category: 'dessert',
        processingLevel: 'ultra-processed',
        cookingMethod: 'none',
        sugarType: 'added',
        fatType: 'saturated',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-high',
        glycemicReasoning: 'Extremely high sugar',
        overallQuality: 'very-poor',
        qualityReasoning: 'Sugar bomb with saturated fat'
      }
    }
  },
  {
    name: 'Quinoa (cooked)',
    expected: '80-90',
    data: {
      calories: 120,
      totalFat: 1.9,
      saturatedFat: 0.2,
      transFat: 0,
      cholesterol: 0,
      sodium: 7,
      totalCarbohydrates: 21,
      dietaryFiber: 2.8,
      sugars: 0.9,
      protein: 4.4,
      servingSize: '100g',
      foodContext: {
        foodName: 'Cooked Quinoa',
        confidence: 'high',
        category: 'grain',
        processingLevel: 'minimally-processed',
        cookingMethod: 'boiled',
        sugarType: 'natural',
        fatType: 'healthy-unsaturated',
        carbType: 'complex',
        hasWholeGrains: true,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'medium',
        glycemicReasoning: 'Whole grain, complete protein',
        overallQuality: 'excellent',
        qualityReasoning: 'Complete protein, whole grain'
      }
    }
  },
  {
    name: 'Energy Drink (regular)',
    expected: '5-20',
    data: {
      calories: 45,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 87,
      totalCarbohydrates: 11,
      dietaryFiber: 0,
      sugars: 11,
      protein: 0,
      servingSize: '100ml',
      foodContext: {
        foodName: 'Energy Drink',
        confidence: 'high',
        category: 'beverage',
        processingLevel: 'ultra-processed',
        cookingMethod: 'none',
        sugarType: 'added',
        fatType: 'none',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: true,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-high',
        glycemicReasoning: 'Liquid sugar, caffeine',
        overallQuality: 'very-poor',
        qualityReasoning: 'Liquid sugar with stimulants'
      }
    }
  }
];

const scoringService = OptimizedScoringService;
const results = [];
let passCount = 0;

validationFoods.forEach(food => {
  const result = scoringService.calculateOptimizedScore(food.data);
  
  const match = food.expected.match(/(\d+)-(\d+)/);
  if (!match) return;
  
  const expectedMin = parseInt(match[1]);
  const expectedMax = parseInt(match[2]);
  const actualScore = result.overallScore;
  const passed = actualScore >= expectedMin && actualScore <= expectedMax;
  
  if (passed) passCount++;
  
  results.push({
    name: food.name,
    expected: food.expected,
    actual: actualScore,
    novaGroup: result.novaGroup,
    passed: passed
  });
  
  console.log(`\n${food.name}`);
  console.log(`   Expected: ${food.expected}/100`);
  console.log(`   Actual: ${actualScore}/100 (NOVA ${result.novaGroup})`);
  console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}`);
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 VALIDATION RESULTS: ${passCount}/${validationFoods.length} (${Math.round(passCount/validationFoods.length*100)}%)\n`);

if (passCount >= validationFoods.length * 0.75) {
  console.log('✅ EXCELLENT: Formula generalizes well to new foods (>75%)');
  console.log('   The formula is NOT overfitted and works accurately on diverse foods.');
} else if (passCount >= validationFoods.length * 0.60) {
  console.log('⚠️  GOOD: Formula works reasonably well (60-75%)');
  console.log('   Minor tuning may improve accuracy.');
} else {
  console.log('❌ POOR: Formula may be overfitted (<60%)');
  console.log('   Needs adjustment to generalize better.');
}

console.log('\n✅ Validation Complete!\n');
