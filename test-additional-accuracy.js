const OptimizedScoringService = require('./dist/services/optimized-scoring.service').default;

console.log('\n🧪 ADDITIONAL ACCURACY TEST - More Diverse Foods\n');
console.log('Testing with another set of real-world foods');
console.log('=' .repeat(80));

const additionalTestFoods = [
  {
    name: '1. Sweet Potato (baked)',
    expected: '85-95',
    data: {
      calories: 90,
      totalFat: 0.2,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 36,
      totalCarbohydrates: 21,
      dietaryFiber: 3.3,
      sugars: 6.5,
      protein: 2,
      servingSize: '100g',
      foodContext: {
        foodName: 'Baked Sweet Potato',
        confidence: 'high',
        category: 'vegetable',
        processingLevel: 'whole',
        cookingMethod: 'baked',
        sugarType: 'natural',
        sugarSources: ['vegetable'],
        fatType: 'none',
        carbType: 'complex',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'medium',
        glycemicReasoning: 'Natural vegetable sugars with fiber',
        overallQuality: 'excellent',
        qualityReasoning: 'Nutrient-dense root vegetable'
      }
    }
  },
  {
    name: '2. Pop-Tarts',
    expected: '5-20',
    data: {
      calories: 400,
      totalFat: 10,
      saturatedFat: 2.5,
      transFat: 0,
      cholesterol: 0,
      sodium: 300,
      totalCarbohydrates: 70,
      dietaryFiber: 1,
      sugars: 32,
      protein: 4,
      servingSize: '100g',
      foodContext: {
        foodName: 'Pop-Tarts Strawberry',
        confidence: 'high',
        category: 'dessert',
        processingLevel: 'ultra-processed',
        cookingMethod: 'baked',
        sugarType: 'added',
        fatType: 'mixed',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: true,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-high',
        glycemicReasoning: 'Refined flour and high sugar',
        overallQuality: 'very-poor',
        qualityReasoning: 'Ultra-processed breakfast pastry with excessive sugar'
      }
    }
  },
  {
    name: '3. Hummus',
    expected: '70-85',
    data: {
      calories: 166,
      totalFat: 10,
      saturatedFat: 1.4,
      transFat: 0,
      cholesterol: 0,
      sodium: 379,
      totalCarbohydrates: 14,
      dietaryFiber: 6,
      sugars: 0.3,
      protein: 8,
      servingSize: '100g',
      foodContext: {
        foodName: 'Traditional Hummus',
        confidence: 'high',
        category: 'protein',
        processingLevel: 'processed',
        cookingMethod: 'none',
        sugarType: 'natural',
        fatType: 'healthy-unsaturated',
        fatSources: ['olive oil', 'tahini'],
        carbType: 'complex',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'low',
        glycemicReasoning: 'High fiber and protein',
        overallQuality: 'good',
        qualityReasoning: 'Nutritious legume-based spread'
      }
    }
  },
  {
    name: '4. McDonald\'s Big Mac',
    expected: '10-25',
    data: {
      calories: 257,
      totalFat: 13,
      saturatedFat: 5,
      transFat: 0.5,
      cholesterol: 40,
      sodium: 508,
      totalCarbohydrates: 21,
      dietaryFiber: 2,
      sugars: 4,
      protein: 13,
      servingSize: '100g',
      foodContext: {
        foodName: 'McDonald\'s Big Mac',
        confidence: 'high',
        category: 'fast-food',
        processingLevel: 'ultra-processed',
        cookingMethod: 'fried',
        sugarType: 'added',
        fatType: 'saturated',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'high',
        glycemicReasoning: 'Fast food with refined carbs and high fat',
        overallQuality: 'very-poor',
        qualityReasoning: 'Ultra-processed fast food burger'
      }
    }
  },
  {
    name: '5. Eggs (whole, boiled)',
    expected: '80-90',
    data: {
      calories: 155,
      totalFat: 11,
      saturatedFat: 3.3,
      transFat: 0,
      cholesterol: 373,
      sodium: 124,
      totalCarbohydrates: 1.1,
      dietaryFiber: 0,
      sugars: 1.1,
      protein: 13,
      servingSize: '100g',
      foodContext: {
        foodName: 'Hard Boiled Eggs',
        confidence: 'high',
        category: 'protein',
        processingLevel: 'whole',
        cookingMethod: 'boiled',
        sugarType: 'natural',
        fatType: 'mixed',
        fatSources: ['egg yolk'],
        carbType: 'none',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-low',
        glycemicReasoning: 'Zero carbs, complete protein',
        overallQuality: 'excellent',
        qualityReasoning: 'Complete protein with essential nutrients'
      }
    }
  },
  {
    name: '6. Mountain Dew',
    expected: '0-10',
    data: {
      calories: 46,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 15,
      totalCarbohydrates: 12,
      dietaryFiber: 0,
      sugars: 12,
      protein: 0,
      servingSize: '100ml',
      foodContext: {
        foodName: 'Mountain Dew Soda',
        confidence: 'high',
        category: 'beverage',
        processingLevel: 'ultra-processed',
        cookingMethod: 'none',
        sugarType: 'added',
        sugarSources: ['high fructose corn syrup'],
        fatType: 'none',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-high',
        glycemicReasoning: 'Pure liquid sugar with caffeine',
        overallQuality: 'very-poor',
        qualityReasoning: 'Liquid sugar beverage'
      }
    }
  },
  {
    name: '7. Lentils (cooked)',
    expected: '85-95',
    data: {
      calories: 116,
      totalFat: 0.4,
      saturatedFat: 0.1,
      transFat: 0,
      cholesterol: 0,
      sodium: 2,
      totalCarbohydrates: 20,
      dietaryFiber: 7.9,
      sugars: 1.8,
      protein: 9,
      servingSize: '100g',
      foodContext: {
        foodName: 'Cooked Lentils',
        confidence: 'high',
        category: 'protein',
        processingLevel: 'whole',
        cookingMethod: 'boiled',
        sugarType: 'natural',
        fatType: 'none',
        carbType: 'complex',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'low',
        glycemicReasoning: 'High fiber legume',
        overallQuality: 'excellent',
        qualityReasoning: 'Protein-rich legume with high fiber'
      }
    }
  },
  {
    name: '8. Nutella',
    expected: '15-30',
    data: {
      calories: 539,
      totalFat: 30,
      saturatedFat: 10,
      transFat: 0,
      cholesterol: 0,
      sodium: 40,
      totalCarbohydrates: 58,
      dietaryFiber: 3,
      sugars: 56,
      protein: 6,
      servingSize: '100g',
      foodContext: {
        foodName: 'Nutella Hazelnut Spread',
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
        glycemicReasoning: 'Extremely high sugar content',
        overallQuality: 'very-poor',
        qualityReasoning: 'Sugar and fat spread masquerading as healthy'
      }
    }
  },
  {
    name: '9. Tuna (canned in water)',
    expected: '80-95',
    data: {
      calories: 116,
      totalFat: 0.8,
      saturatedFat: 0.2,
      transFat: 0,
      cholesterol: 42,
      sodium: 247,
      totalCarbohydrates: 0,
      dietaryFiber: 0,
      sugars: 0,
      protein: 26,
      servingSize: '100g',
      foodContext: {
        foodName: 'Canned Tuna in Water',
        confidence: 'high',
        category: 'protein',
        processingLevel: 'processed',
        cookingMethod: 'none',
        sugarType: 'none',
        fatType: 'healthy-unsaturated',
        fatSources: ['omega-3'],
        carbType: 'none',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-low',
        glycemicReasoning: 'Zero carbs, lean protein',
        overallQuality: 'good',
        qualityReasoning: 'Lean protein with omega-3'
      }
    }
  },
  {
    name: '10. Cheetos',
    expected: '0-10',
    data: {
      calories: 570,
      totalFat: 35,
      saturatedFat: 5,
      transFat: 0,
      cholesterol: 0,
      sodium: 830,
      totalCarbohydrates: 58,
      dietaryFiber: 2,
      sugars: 4,
      protein: 7,
      servingSize: '100g',
      foodContext: {
        foodName: 'Cheetos Crunchy',
        confidence: 'high',
        category: 'snack',
        processingLevel: 'ultra-processed',
        cookingMethod: 'fried',
        sugarType: 'added',
        fatType: 'mixed',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'high',
        glycemicReasoning: 'High fat, high sodium, refined carbs',
        overallQuality: 'very-poor',
        qualityReasoning: 'Ultra-processed cheese-flavored snack'
      }
    }
  }
];

const scoringService = OptimizedScoringService;
const results = [];
let passCount = 0;

console.log('\nTesting 10 diverse real-world foods...\n');

additionalTestFoods.forEach(food => {
  const result = scoringService.calculateOptimizedScore(food.data);
  
  const match = food.expected.match(/(\d+)-(\d+)/);
  if (!match) return;
  
  const expectedMin = parseInt(match[1]);
  const expectedMax = parseInt(match[2]);
  const actualScore = result.overallScore;
  const passed = actualScore >= expectedMin && actualScore <= expectedMax;
  
  if (passed) passCount++;
  
  const expectedAvg = (expectedMin + expectedMax) / 2;
  const deviation = actualScore - expectedAvg;
  
  results.push({
    name: food.name,
    expected: food.expected,
    actual: actualScore,
    novaGroup: result.novaGroup,
    category: result.category,
    passed: passed,
    deviation: deviation
  });
  
  const statusIcon = passed ? '✅' : '❌';
  const deviationText = passed ? '' : ` (${deviation > 0 ? '+' : ''}${deviation.toFixed(0)} pts)`;
  
  console.log(`${food.name}`);
  console.log(`   Expected: ${food.expected}/100 | Actual: ${actualScore}/100 | NOVA: ${result.novaGroup}`);
  console.log(`   ${statusIcon} ${passed ? 'PASS' : 'FAIL'}${deviationText}\n`);
});

console.log('=' .repeat(80));
console.log(`\n📊 TEST RESULTS: ${passCount}/${additionalTestFoods.length} (${Math.round(passCount/additionalTestFoods.length*100)}%)\n`);

// Category analysis
const wholeFoods = results.filter(r => r.novaGroup === 1);
const processed = results.filter(r => r.novaGroup === 2 || r.novaGroup === 3);
const ultraProcessed = results.filter(r => r.novaGroup === 4);

console.log('📈 NOVA CLASSIFICATION BREAKDOWN:\n');

if (wholeFoods.length > 0) {
  console.log(`🌱 NOVA Group 1 - Whole Foods (${wholeFoods.length} items):`);
  wholeFoods.forEach(f => {
    console.log(`   ${f.passed ? '✅' : '❌'} ${f.name.split('.')[1]?.trim()}: ${f.actual}/100`);
  });
  console.log('');
}

if (processed.length > 0) {
  console.log(`🏭 NOVA Group 2-3 - Processed (${processed.length} items):`);
  processed.forEach(f => {
    console.log(`   ${f.passed ? '✅' : '❌'} ${f.name.split('.')[1]?.trim()}: ${f.actual}/100 (NOVA ${f.novaGroup})`);
  });
  console.log('');
}

if (ultraProcessed.length > 0) {
  console.log(`🚨 NOVA Group 4 - Ultra-Processed (${ultraProcessed.length} items):`);
  ultraProcessed.forEach(f => {
    console.log(`   ${f.passed ? '✅' : '❌'} ${f.name.split('.')[1]?.trim()}: ${f.actual}/100`);
  });
  console.log('');
}

console.log('=' .repeat(80));
console.log('\n💡 ASSESSMENT:\n');

const passRate = (passCount / additionalTestFoods.length) * 100;

if (passRate >= 80) {
  console.log('🎉 EXCELLENT! (≥80% accuracy)');
  console.log('   Formula is highly accurate and generalizes well.');
} else if (passRate >= 70) {
  console.log('✅ VERY GOOD! (70-79% accuracy)');
  console.log('   Formula performs well with minor edge cases.');
} else if (passRate >= 60) {
  console.log('⚠️  GOOD (60-69% accuracy)');
  console.log('   Reasonable performance, some refinement needed.');
} else if (passRate >= 50) {
  console.log('⚠️  MODERATE (50-59% accuracy)');
  console.log('   Works but needs improvement on edge cases.');
} else {
  console.log('❌ NEEDS WORK (<50% accuracy)');
  console.log('   Significant adjustments required.');
}

// Show failures
const failures = results.filter(r => !r.passed);
if (failures.length > 0) {
  console.log(`\n❌ Failed Cases (${failures.length}):`);
  failures.forEach(f => {
    const foodName = f.name.split('.')[1]?.trim();
    console.log(`\n   • ${foodName}`);
    console.log(`     Expected: ${f.expected} | Actual: ${f.actual} | Deviation: ${f.deviation > 0 ? '+' : ''}${f.deviation.toFixed(0)}`);
    console.log(`     NOVA: ${f.novaGroup} | ${f.category}`);
  });
}

// Calculate overall statistics across all test runs
console.log('\n' + '='.repeat(80));
console.log('\n📊 CUMULATIVE STATISTICS (All Tests Combined):\n');
console.log('   Test 1 (Training): 80% (8/10)');
console.log('   Test 2 (Validation): 63% (5/8)');
console.log('   Test 3 (Final): 50% (6/12)');
console.log(`   Test 4 (This test): ${Math.round(passRate)}% (${passCount}/${additionalTestFoods.length})`);

const totalTests = 10 + 8 + 12 + additionalTestFoods.length;
const totalPassed = 8 + 5 + 6 + passCount;
const overallAccuracy = Math.round((totalPassed / totalTests) * 100);

console.log(`\n   🎯 OVERALL ACCURACY: ${overallAccuracy}% (${totalPassed}/${totalTests} foods)`);

if (overallAccuracy >= 70) {
  console.log('\n   ✅ Formula demonstrates strong generalization ability!');
} else if (overallAccuracy >= 60) {
  console.log('\n   ⚠️  Formula shows reasonable generalization.');
} else {
  console.log('\n   ❌ Formula needs better generalization.');
}

console.log('\n✅ Test Complete!\n');
