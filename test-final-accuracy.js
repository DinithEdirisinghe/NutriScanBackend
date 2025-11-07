const OptimizedScoringService = require('./dist/services/optimized-scoring.service').default;

console.log('\n🎯 FINAL ACCURACY TEST - Brand New Food Items\n');
console.log('Testing formula on completely unseen foods to verify generalization');
console.log('=' .repeat(80));

const finalTestFoods = [
  {
    name: '1. Chickpeas (canned)',
    expected: '70-85',
    data: {
      calories: 164,
      totalFat: 2.6,
      saturatedFat: 0.3,
      transFat: 0,
      cholesterol: 0,
      sodium: 359,
      totalCarbohydrates: 27,
      dietaryFiber: 7.6,
      sugars: 4.8,
      protein: 8.9,
      servingSize: '100g',
      foodContext: {
        foodName: 'Canned Chickpeas',
        confidence: 'high',
        category: 'protein',
        processingLevel: 'processed',
        cookingMethod: 'boiled',
        sugarType: 'natural',
        fatType: 'healthy-unsaturated',
        carbType: 'complex',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'low',
        glycemicReasoning: 'High fiber, complex carbs',
        overallQuality: 'good',
        qualityReasoning: 'Nutritious but processed with added sodium'
      }
    }
  },
  {
    name: '2. Pizza (frozen pepperoni)',
    expected: '15-30',
    data: {
      calories: 268,
      totalFat: 10,
      saturatedFat: 4.8,
      transFat: 0,
      cholesterol: 21,
      sodium: 598,
      totalCarbohydrates: 33,
      dietaryFiber: 2.1,
      sugars: 3.8,
      protein: 11,
      servingSize: '100g',
      foodContext: {
        foodName: 'Frozen Pepperoni Pizza',
        confidence: 'high',
        category: 'fast-food',
        processingLevel: 'ultra-processed',
        cookingMethod: 'baked',
        sugarType: 'added',
        fatType: 'saturated',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'high',
        glycemicReasoning: 'Refined carbs, high fat, high sodium',
        overallQuality: 'poor',
        qualityReasoning: 'Ultra-processed convenience food'
      }
    }
  },
  {
    name: '3. Kale (raw)',
    expected: '90-100',
    data: {
      calories: 49,
      totalFat: 0.9,
      saturatedFat: 0.1,
      transFat: 0,
      cholesterol: 0,
      sodium: 38,
      totalCarbohydrates: 9,
      dietaryFiber: 3.6,
      sugars: 2.3,
      protein: 4.3,
      servingSize: '100g',
      foodContext: {
        foodName: 'Raw Kale',
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
        glycemicReasoning: 'Superfood with high nutrients',
        overallQuality: 'excellent',
        qualityReasoning: 'Nutrient-dense superfood vegetable'
      }
    }
  },
  {
    name: '4. Bacon',
    expected: '20-35',
    data: {
      calories: 541,
      totalFat: 42,
      saturatedFat: 14,
      transFat: 0,
      cholesterol: 110,
      sodium: 1717,
      totalCarbohydrates: 1.4,
      dietaryFiber: 0,
      sugars: 1.2,
      protein: 37,
      servingSize: '100g',
      foodContext: {
        foodName: 'Cooked Bacon',
        confidence: 'high',
        category: 'protein',
        processingLevel: 'processed',
        cookingMethod: 'fried',
        sugarType: 'added',
        fatType: 'saturated',
        fatSources: ['animal fat'],
        carbType: 'none',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-low',
        glycemicReasoning: 'Zero carbs but high fat and sodium',
        overallQuality: 'poor',
        qualityReasoning: 'High saturated fat and sodium'
      }
    }
  },
  {
    name: '5. Orange Juice (100% fresh squeezed)',
    expected: '40-60',
    data: {
      calories: 45,
      totalFat: 0.2,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 1,
      totalCarbohydrates: 10,
      dietaryFiber: 0.2,
      sugars: 8.4,
      protein: 0.7,
      servingSize: '100ml',
      foodContext: {
        foodName: 'Fresh Orange Juice',
        confidence: 'high',
        category: 'beverage',
        processingLevel: 'minimally-processed',
        cookingMethod: 'none',
        sugarType: 'natural',
        sugarSources: ['fruit'],
        fatType: 'none',
        carbType: 'natural',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'medium',
        glycemicReasoning: 'Natural fruit sugar but no fiber',
        overallQuality: 'fair',
        qualityReasoning: 'Natural but liquid sugar without fiber'
      }
    }
  },
  {
    name: '6. Oreos',
    expected: '0-15',
    data: {
      calories: 478,
      totalFat: 20,
      saturatedFat: 6,
      transFat: 0,
      cholesterol: 0,
      sodium: 420,
      totalCarbohydrates: 70,
      dietaryFiber: 3,
      sugars: 40,
      protein: 4,
      servingSize: '100g',
      foodContext: {
        foodName: 'Oreo Cookies',
        confidence: 'high',
        category: 'dessert',
        processingLevel: 'ultra-processed',
        cookingMethod: 'baked',
        sugarType: 'added',
        fatType: 'mixed',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-high',
        glycemicReasoning: 'Extremely high sugar and refined carbs',
        overallQuality: 'very-poor',
        qualityReasoning: 'Ultra-processed cookie with excessive sugar'
      }
    }
  },
  {
    name: '7. Chicken Breast (grilled, skinless)',
    expected: '85-95',
    data: {
      calories: 165,
      totalFat: 3.6,
      saturatedFat: 1,
      transFat: 0,
      cholesterol: 85,
      sodium: 74,
      totalCarbohydrates: 0,
      dietaryFiber: 0,
      sugars: 0,
      protein: 31,
      servingSize: '100g',
      foodContext: {
        foodName: 'Grilled Chicken Breast',
        confidence: 'high',
        category: 'protein',
        processingLevel: 'whole',
        cookingMethod: 'grilled',
        sugarType: 'none',
        fatType: 'healthy-unsaturated',
        carbType: 'none',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-low',
        glycemicReasoning: 'Zero carbs, lean protein',
        overallQuality: 'excellent',
        qualityReasoning: 'Lean protein source'
      }
    }
  },
  {
    name: '8. French Fries (fast food)',
    expected: '10-25',
    data: {
      calories: 312,
      totalFat: 15,
      saturatedFat: 2.3,
      transFat: 0,
      cholesterol: 0,
      sodium: 210,
      totalCarbohydrates: 41,
      dietaryFiber: 3.8,
      sugars: 0.3,
      protein: 3.4,
      servingSize: '100g',
      foodContext: {
        foodName: 'Fast Food French Fries',
        confidence: 'high',
        category: 'fast-food',
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
        glycemicReasoning: 'Deep fried, refined carbs',
        overallQuality: 'poor',
        qualityReasoning: 'Deep fried with added salt'
      }
    }
  },
  {
    name: '9. Oatmeal (steel cut, plain)',
    expected: '80-90',
    data: {
      calories: 71,
      totalFat: 1.4,
      saturatedFat: 0.2,
      transFat: 0,
      cholesterol: 0,
      sodium: 3,
      totalCarbohydrates: 12,
      dietaryFiber: 1.7,
      sugars: 0.3,
      protein: 2.5,
      servingSize: '100g',
      foodContext: {
        foodName: 'Steel Cut Oatmeal',
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
        glycemicImpact: 'low',
        glycemicReasoning: 'Whole grain with fiber',
        overallQuality: 'excellent',
        qualityReasoning: 'Whole grain with soluble fiber'
      }
    }
  },
  {
    name: '10. Hot Dog (beef)',
    expected: '5-20',
    data: {
      calories: 290,
      totalFat: 26,
      saturatedFat: 10,
      transFat: 0,
      cholesterol: 61,
      sodium: 810,
      totalCarbohydrates: 4,
      dietaryFiber: 0,
      sugars: 1,
      protein: 10,
      servingSize: '100g',
      foodContext: {
        foodName: 'Beef Hot Dog',
        confidence: 'high',
        category: 'processed',
        processingLevel: 'ultra-processed',
        cookingMethod: 'grilled',
        sugarType: 'added',
        fatType: 'saturated',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'low',
        glycemicReasoning: 'Low carbs but very unhealthy fats',
        overallQuality: 'very-poor',
        qualityReasoning: 'Processed meat with high fat and sodium'
      }
    }
  },
  {
    name: '11. Strawberries (fresh)',
    expected: '90-100',
    data: {
      calories: 32,
      totalFat: 0.3,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 1,
      totalCarbohydrates: 7.7,
      dietaryFiber: 2,
      sugars: 4.9,
      protein: 0.7,
      servingSize: '100g',
      foodContext: {
        foodName: 'Fresh Strawberries',
        confidence: 'high',
        category: 'fruit',
        processingLevel: 'whole',
        cookingMethod: 'none',
        sugarType: 'natural',
        sugarSources: ['fruit'],
        fatType: 'none',
        carbType: 'complex',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'low',
        glycemicReasoning: 'Low GI fruit with fiber',
        overallQuality: 'excellent',
        qualityReasoning: 'Vitamin C rich fruit'
      }
    }
  },
  {
    name: '12. Protein Bar (whey)',
    expected: '50-70',
    data: {
      calories: 390,
      totalFat: 12,
      saturatedFat: 5,
      transFat: 0,
      cholesterol: 15,
      sodium: 280,
      totalCarbohydrates: 44,
      dietaryFiber: 3,
      sugars: 20,
      protein: 30,
      servingSize: '100g',
      foodContext: {
        foodName: 'Whey Protein Bar',
        confidence: 'high',
        category: 'protein',
        processingLevel: 'ultra-processed',
        cookingMethod: 'none',
        sugarType: 'added',
        fatType: 'mixed',
        carbType: 'mixed',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: true,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'medium',
        glycemicReasoning: 'High protein but also high sugar',
        overallQuality: 'fair',
        qualityReasoning: 'Convenient protein but processed with added sugar'
      }
    }
  }
];

const scoringService = OptimizedScoringService;
const results = [];
let passCount = 0;

console.log('\nTesting 12 brand new foods across all categories...\n');

finalTestFoods.forEach(food => {
  const result = scoringService.calculateOptimizedScore(food.data);
  
  const match = food.expected.match(/(\d+)-(\d+)/);
  if (!match) return;
  
  const expectedMin = parseInt(match[1]);
  const expectedMax = parseInt(match[2]);
  const actualScore = result.overallScore;
  const passed = actualScore >= expectedMin && actualScore <= expectedMax;
  
  if (passed) passCount++;
  
  const deviation = actualScore - ((expectedMin + expectedMax) / 2);
  
  results.push({
    name: food.name,
    expected: food.expected,
    actual: actualScore,
    novaGroup: result.novaGroup,
    category: result.category,
    passed: passed,
    deviation: deviation
  });
  
  console.log(`${food.name}`);
  console.log(`   Expected: ${food.expected}/100 | Actual: ${actualScore}/100 | NOVA: ${result.novaGroup}`);
  console.log(`   ${passed ? '✅ PASS' : `❌ FAIL (${deviation > 0 ? '+' : ''}${deviation.toFixed(0)} pts)`}\n`);
});

console.log('=' .repeat(80));
console.log(`\n📊 FINAL ACCURACY: ${passCount}/${finalTestFoods.length} (${Math.round(passCount/finalTestFoods.length*100)}%)\n`);

// Category breakdown
const wholeFoods = results.filter(r => 
  r.name.includes('Kale') || r.name.includes('Chicken') || 
  r.name.includes('Oatmeal') || r.name.includes('Strawberries')
);
const ultraProcessed = results.filter(r => 
  r.name.includes('Pizza') || r.name.includes('Oreos') || 
  r.name.includes('French Fries') || r.name.includes('Hot Dog')
);
const processed = results.filter(r =>
  r.name.includes('Chickpeas') || r.name.includes('Bacon') || 
  r.name.includes('Orange Juice') || r.name.includes('Protein Bar')
);

console.log('📈 CATEGORY BREAKDOWN:\n');

console.log('🌱 Whole Foods (Expected 80-100):');
wholeFoods.forEach(f => {
  console.log(`   ${f.passed ? '✅' : '❌'} ${f.name.split('.')[1]?.trim()}: ${f.actual}/100`);
});

console.log('\n🏭 Processed Foods (Expected 20-85):');
processed.forEach(f => {
  console.log(`   ${f.passed ? '✅' : '❌'} ${f.name.split('.')[1]?.trim()}: ${f.actual}/100`);
});

console.log('\n🚨 Ultra-Processed (Expected 0-30):');
ultraProcessed.forEach(f => {
  console.log(`   ${f.passed ? '✅' : '❌'} ${f.name.split('.')[1]?.trim()}: ${f.actual}/100`);
});

console.log('\n' + '='.repeat(80));
console.log('\n💡 OVERALL ASSESSMENT:\n');

const passRate = (passCount / finalTestFoods.length) * 100;

if (passRate >= 80) {
  console.log('🎉 EXCELLENT! Formula is highly accurate (≥80%)');
  console.log('   ✅ NOVA-based scoring is working correctly');
  console.log('   ✅ Category-specific penalties are effective');
  console.log('   ✅ Formula generalizes well to unseen foods');
  console.log('   ✅ No signs of overfitting');
} else if (passRate >= 70) {
  console.log('✅ VERY GOOD! Formula is mostly accurate (70-79%)');
  console.log('   The core logic is sound with minor edge cases to refine.');
} else if (passRate >= 60) {
  console.log('⚠️  GOOD: Formula is reasonably accurate (60-69%)');
  console.log('   Works well but could benefit from fine-tuning.');
} else {
  console.log('❌ NEEDS IMPROVEMENT: Formula accuracy below 60%');
  console.log('   Review failed cases and adjust thresholds.');
}

// Show biggest failures
const failures = results.filter(r => !r.passed).sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
if (failures.length > 0) {
  console.log('\n🔍 TOP FAILURES (by deviation):');
  failures.slice(0, 3).forEach((f, i) => {
    console.log(`\n   ${i+1}. ${f.name.split('.')[1]?.trim()}`);
    console.log(`      Expected: ${f.expected} | Actual: ${f.actual} | Deviation: ${f.deviation > 0 ? '+' : ''}${f.deviation.toFixed(0)}`);
    console.log(`      NOVA: ${f.novaGroup} | Category: ${f.category}`);
  });
}

console.log('\n✅ Test Complete!\n');
