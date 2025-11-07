const OptimizedScoringService = require('./dist/services/optimized-scoring.service').default;

console.log('\n🎲 FINAL VERIFICATION TEST - 15 Random Foods\n');
console.log('Last comprehensive test with maximum diversity');
console.log('=' .repeat(80));

const verificationFoods = [
  {
    name: '1. Cottage Cheese (low-fat)',
    expected: '75-90',
    data: {
      calories: 72,
      totalFat: 1,
      saturatedFat: 0.6,
      transFat: 0,
      cholesterol: 5,
      sodium: 364,
      totalCarbohydrates: 4.3,
      dietaryFiber: 0,
      sugars: 4.1,
      protein: 12,
      servingSize: '100g',
      foodContext: {
        foodName: 'Low-Fat Cottage Cheese',
        confidence: 'high',
        category: 'dairy',
        processingLevel: 'minimally-processed',
        cookingMethod: 'none',
        sugarType: 'natural',
        fatType: 'saturated',
        carbType: 'natural',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'low',
        glycemicReasoning: 'High protein, low carbs',
        overallQuality: 'good',
        qualityReasoning: 'Lean protein source with calcium'
      }
    }
  },
  {
    name: '2. Twinkies',
    expected: '0-15',
    data: {
      calories: 371,
      totalFat: 9.5,
      saturatedFat: 2.5,
      transFat: 0,
      cholesterol: 20,
      sodium: 367,
      totalCarbohydrates: 67,
      dietaryFiber: 0.3,
      sugars: 42,
      protein: 2.6,
      servingSize: '100g',
      foodContext: {
        foodName: 'Hostess Twinkies',
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
        glycemicReasoning: 'Pure sugar and refined flour',
        overallQuality: 'very-poor',
        qualityReasoning: 'Iconic junk food with no nutritional value'
      }
    }
  },
  {
    name: '3. Asparagus (steamed)',
    expected: '90-100',
    data: {
      calories: 22,
      totalFat: 0.2,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 14,
      totalCarbohydrates: 4.1,
      dietaryFiber: 2.1,
      sugars: 1.3,
      protein: 2.4,
      servingSize: '100g',
      foodContext: {
        foodName: 'Steamed Asparagus',
        confidence: 'high',
        category: 'vegetable',
        processingLevel: 'whole',
        cookingMethod: 'steamed',
        sugarType: 'natural',
        fatType: 'none',
        carbType: 'complex',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-low',
        glycemicReasoning: 'Low carb vegetable',
        overallQuality: 'excellent',
        qualityReasoning: 'Nutrient-dense low-calorie vegetable'
      }
    }
  },
  {
    name: '4. Pringles',
    expected: '5-15',
    data: {
      calories: 536,
      totalFat: 33,
      saturatedFat: 3.3,
      transFat: 0,
      cholesterol: 0,
      sodium: 554,
      totalCarbohydrates: 53,
      dietaryFiber: 3,
      sugars: 2,
      protein: 4.5,
      servingSize: '100g',
      foodContext: {
        foodName: 'Pringles Original',
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
        glycemicReasoning: 'Refined potato starch, high fat',
        overallQuality: 'very-poor',
        qualityReasoning: 'Ultra-processed potato chips'
      }
    }
  },
  {
    name: '5. Tofu (firm)',
    expected: '75-90',
    data: {
      calories: 144,
      totalFat: 9,
      saturatedFat: 1.3,
      transFat: 0,
      cholesterol: 0,
      sodium: 14,
      totalCarbohydrates: 2.3,
      dietaryFiber: 2.3,
      sugars: 0.6,
      protein: 15,
      servingSize: '100g',
      foodContext: {
        foodName: 'Firm Tofu',
        confidence: 'high',
        category: 'protein',
        processingLevel: 'minimally-processed',
        cookingMethod: 'none',
        sugarType: 'natural',
        fatType: 'healthy-unsaturated',
        carbType: 'complex',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-low',
        glycemicReasoning: 'Low carb, high protein',
        overallQuality: 'excellent',
        qualityReasoning: 'Plant-based complete protein'
      }
    }
  },
  {
    name: '6. Red Bull',
    expected: '5-20',
    data: {
      calories: 45,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 105,
      totalCarbohydrates: 11,
      dietaryFiber: 0,
      sugars: 11,
      protein: 0.9,
      servingSize: '100ml',
      foodContext: {
        foodName: 'Red Bull Energy Drink',
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
        glycemicReasoning: 'Liquid sugar with caffeine',
        overallQuality: 'very-poor',
        qualityReasoning: 'Sugar water with stimulants'
      }
    }
  },
  {
    name: '7. Black Beans (cooked)',
    expected: '85-95',
    data: {
      calories: 132,
      totalFat: 0.5,
      saturatedFat: 0.1,
      transFat: 0,
      cholesterol: 0,
      sodium: 2,
      totalCarbohydrates: 24,
      dietaryFiber: 8.7,
      sugars: 0.3,
      protein: 8.9,
      servingSize: '100g',
      foodContext: {
        foodName: 'Cooked Black Beans',
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
        qualityReasoning: 'Fiber-rich protein source'
      }
    }
  },
  {
    name: '8. Croissant',
    expected: '30-45',
    data: {
      calories: 406,
      totalFat: 21,
      saturatedFat: 12,
      transFat: 0,
      cholesterol: 67,
      sodium: 423,
      totalCarbohydrates: 46,
      dietaryFiber: 2.6,
      sugars: 9.5,
      protein: 8.2,
      servingSize: '100g',
      foodContext: {
        foodName: 'Butter Croissant',
        confidence: 'high',
        category: 'grain',
        processingLevel: 'processed',
        cookingMethod: 'baked',
        sugarType: 'added',
        fatType: 'saturated',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'high',
        glycemicReasoning: 'Refined flour with butter',
        overallQuality: 'fair',
        qualityReasoning: 'High in saturated fat and refined carbs'
      }
    }
  },
  {
    name: '9. Cashews (roasted, unsalted)',
    expected: '75-90',
    data: {
      calories: 553,
      totalFat: 44,
      saturatedFat: 7.8,
      transFat: 0,
      cholesterol: 0,
      sodium: 12,
      totalCarbohydrates: 30,
      dietaryFiber: 3.3,
      sugars: 5.9,
      protein: 18,
      servingSize: '100g',
      foodContext: {
        foodName: 'Roasted Cashews',
        confidence: 'high',
        category: 'protein',
        processingLevel: 'minimally-processed',
        cookingMethod: 'roasted',
        sugarType: 'natural',
        fatType: 'healthy-unsaturated',
        fatSources: ['monounsaturated'],
        carbType: 'complex',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'low',
        glycemicReasoning: 'Healthy fats and protein',
        overallQuality: 'excellent',
        qualityReasoning: 'Nutrient-dense nut'
      }
    }
  },
  {
    name: '10. Fried Chicken (fast food)',
    expected: '15-30',
    data: {
      calories: 290,
      totalFat: 17,
      saturatedFat: 4.1,
      transFat: 0.3,
      cholesterol: 87,
      sodium: 560,
      totalCarbohydrates: 12,
      dietaryFiber: 0.5,
      sugars: 0,
      protein: 22,
      servingSize: '100g',
      foodContext: {
        foodName: 'Fast Food Fried Chicken',
        confidence: 'high',
        category: 'fast-food',
        processingLevel: 'ultra-processed',
        cookingMethod: 'fried',
        sugarType: 'none',
        fatType: 'saturated',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'medium',
        glycemicReasoning: 'Breaded and fried with high sodium',
        overallQuality: 'poor',
        qualityReasoning: 'Deep fried with unhealthy fats'
      }
    }
  },
  {
    name: '11. Mango (fresh)',
    expected: '90-100',
    data: {
      calories: 60,
      totalFat: 0.4,
      saturatedFat: 0.1,
      transFat: 0,
      cholesterol: 0,
      sodium: 1,
      totalCarbohydrates: 15,
      dietaryFiber: 1.6,
      sugars: 13.7,
      protein: 0.8,
      servingSize: '100g',
      foodContext: {
        foodName: 'Fresh Mango',
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
        glycemicReasoning: 'Natural fruit sugars with fiber',
        overallQuality: 'excellent',
        qualityReasoning: 'Vitamin C rich tropical fruit'
      }
    }
  },
  {
    name: '12. Instant Mac & Cheese',
    expected: '20-35',
    data: {
      calories: 375,
      totalFat: 5,
      saturatedFat: 2.5,
      transFat: 0,
      cholesterol: 10,
      sodium: 980,
      totalCarbohydrates: 70,
      dietaryFiber: 3,
      sugars: 8,
      protein: 10,
      servingSize: '100g',
      foodContext: {
        foodName: 'Instant Mac and Cheese',
        confidence: 'high',
        category: 'processed',
        processingLevel: 'ultra-processed',
        cookingMethod: 'boiled',
        sugarType: 'added',
        fatType: 'saturated',
        carbType: 'refined',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: true,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'high',
        glycemicReasoning: 'Refined pasta with processed cheese',
        overallQuality: 'poor',
        qualityReasoning: 'Ultra-processed convenience food'
      }
    }
  },
  {
    name: '13. Brussels Sprouts (roasted)',
    expected: '85-95',
    data: {
      calories: 56,
      totalFat: 0.5,
      saturatedFat: 0.1,
      transFat: 0,
      cholesterol: 0,
      sodium: 16,
      totalCarbohydrates: 11,
      dietaryFiber: 4.1,
      sugars: 2.5,
      protein: 4.3,
      servingSize: '100g',
      foodContext: {
        foodName: 'Roasted Brussels Sprouts',
        confidence: 'high',
        category: 'vegetable',
        processingLevel: 'whole',
        cookingMethod: 'roasted',
        sugarType: 'natural',
        fatType: 'none',
        carbType: 'complex',
        hasWholeGrains: false,
        isOrganic: false,
        hasFortification: false,
        hasPreservatives: false,
        hasArtificialSweeteners: false,
        glycemicImpact: 'very-low',
        glycemicReasoning: 'High fiber cruciferous vegetable',
        overallQuality: 'excellent',
        qualityReasoning: 'Nutrient-dense cruciferous vegetable'
      }
    }
  },
  {
    name: '14. Granola Bar (chocolate chip)',
    expected: '35-55',
    data: {
      calories: 471,
      totalFat: 20,
      saturatedFat: 9,
      transFat: 0,
      cholesterol: 0,
      sodium: 364,
      totalCarbohydrates: 64,
      dietaryFiber: 4,
      sugars: 28,
      protein: 8,
      servingSize: '100g',
      foodContext: {
        foodName: 'Chocolate Chip Granola Bar',
        confidence: 'high',
        category: 'snack',
        processingLevel: 'ultra-processed',
        cookingMethod: 'baked',
        sugarType: 'added',
        fatType: 'mixed',
        carbType: 'mixed',
        hasWholeGrains: true,
        isOrganic: false,
        hasFortification: true,
        hasPreservatives: true,
        hasArtificialSweeteners: false,
        glycemicImpact: 'high',
        glycemicReasoning: 'High sugar despite whole grains',
        overallQuality: 'fair',
        qualityReasoning: 'Processed snack with added sugars'
      }
    }
  },
  {
    name: '15. Shrimp (grilled)',
    expected: '85-95',
    data: {
      calories: 99,
      totalFat: 0.3,
      saturatedFat: 0.1,
      transFat: 0,
      cholesterol: 189,
      sodium: 111,
      totalCarbohydrates: 0.2,
      dietaryFiber: 0,
      sugars: 0,
      protein: 24,
      servingSize: '100g',
      foodContext: {
        foodName: 'Grilled Shrimp',
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
        qualityReasoning: 'Lean seafood protein'
      }
    }
  }
];

const scoringService = OptimizedScoringService;
const results = [];
let passCount = 0;

console.log('\nTesting 15 diverse foods for final verification...\n');

verificationFoods.forEach(food => {
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
  console.log(`   Expected: ${food.expected} | Actual: ${actualScore}/100 | NOVA: ${result.novaGroup} | ${statusIcon}${deviationText}\n`);
});

console.log('=' .repeat(80));
console.log(`\n📊 VERIFICATION TEST RESULTS: ${passCount}/${verificationFoods.length} (${Math.round(passCount/verificationFoods.length*100)}%)\n`);

// Detailed category breakdown
const wholeFoods = results.filter(r => r.novaGroup === 1);
const minimallyProcessed = results.filter(r => r.novaGroup === 2);
const processed = results.filter(r => r.novaGroup === 3);
const ultraProcessed = results.filter(r => r.novaGroup === 4);

console.log('📈 NOVA BREAKDOWN:\n');

console.log(`🌱 Group 1 - Whole Foods (${wholeFoods.length}):`);
const wholePass = wholeFoods.filter(f => f.passed).length;
wholeFoods.forEach(f => {
  console.log(`   ${f.passed ? '✅' : '❌'} ${f.name.split('.')[1]?.trim()}: ${f.actual}/100`);
});
console.log(`   Pass Rate: ${wholePass}/${wholeFoods.length} (${Math.round(wholePass/wholeFoods.length*100)}%)\n`);

if (minimallyProcessed.length > 0) {
  console.log(`🌾 Group 2 - Minimally Processed (${minimallyProcessed.length}):`);
  const minPass = minimallyProcessed.filter(f => f.passed).length;
  minimallyProcessed.forEach(f => {
    console.log(`   ${f.passed ? '✅' : '❌'} ${f.name.split('.')[1]?.trim()}: ${f.actual}/100`);
  });
  console.log(`   Pass Rate: ${minPass}/${minimallyProcessed.length} (${Math.round(minPass/minimallyProcessed.length*100)}%)\n`);
}

if (processed.length > 0) {
  console.log(`🏭 Group 3 - Processed (${processed.length}):`);
  const procPass = processed.filter(f => f.passed).length;
  processed.forEach(f => {
    console.log(`   ${f.passed ? '✅' : '❌'} ${f.name.split('.')[1]?.trim()}: ${f.actual}/100`);
  });
  console.log(`   Pass Rate: ${procPass}/${processed.length} (${Math.round(procPass/processed.length*100)}%)\n`);
}

console.log(`🚨 Group 4 - Ultra-Processed (${ultraProcessed.length}):`);
const ultraPass = ultraProcessed.filter(f => f.passed).length;
ultraProcessed.forEach(f => {
  console.log(`   ${f.passed ? '✅' : '❌'} ${f.name.split('.')[1]?.trim()}: ${f.actual}/100`);
});
console.log(`   Pass Rate: ${ultraPass}/${ultraProcessed.length} (${Math.round(ultraPass/ultraProcessed.length*100)}%)\n`);

console.log('=' .repeat(80));
console.log('\n🎯 FINAL CUMULATIVE STATISTICS:\n');
console.log('   Test 1 (Training):     80% (8/10)');
console.log('   Test 2 (Validation):   63% (5/8)');
console.log('   Test 3 (Final):        50% (6/12)');
console.log('   Test 4 (Additional):   50% (5/10)');
console.log(`   Test 5 (Verification): ${Math.round(passCount/verificationFoods.length*100)}% (${passCount}/${verificationFoods.length})`);

const totalTests = 10 + 8 + 12 + 10 + verificationFoods.length;
const totalPassed = 8 + 5 + 6 + 5 + passCount;
const overallAccuracy = Math.round((totalPassed / totalTests) * 100);

console.log(`\n   🏆 OVERALL ACCURACY: ${overallAccuracy}% (${totalPassed}/${totalTests} foods tested)\n`);

if (overallAccuracy >= 75) {
  console.log('   🎉 EXCELLENT - Formula is highly accurate and generalizes very well!');
} else if (overallAccuracy >= 65) {
  console.log('   ✅ GOOD - Formula shows strong generalization ability!');
} else if (overallAccuracy >= 55) {
  console.log('   ⚠️  FAIR - Formula is reasonably accurate with room for improvement.');
} else {
  console.log('   ❌ NEEDS WORK - Formula needs refinement for better accuracy.');
}

// Show biggest issues
const failures = results.filter(r => !r.passed).sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
if (failures.length > 0) {
  console.log(`\n   Remaining Issues (${failures.length} failures):`);
  failures.slice(0, 5).forEach((f, i) => {
    const foodName = f.name.split('.')[1]?.trim();
    console.log(`   ${i+1}. ${foodName}: ${f.expected} expected, got ${f.actual} (${f.deviation > 0 ? '+' : ''}${f.deviation.toFixed(0)})`);
  });
}

console.log('\n✅ All Tests Complete!\n');
