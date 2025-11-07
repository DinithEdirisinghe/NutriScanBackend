import OptimizedScoringService from './src/services/optimized-scoring.service';
import { EnhancedNutritionData } from './src/services/enhanced-ai.service';

console.log('\n🎲 RANDOM 10 FOODS TEST - NOVA Formula (Direct Test)\n');
console.log('=' .repeat(80));

const testFoods: Array<{
  name: string;
  expected: string;
  data: EnhancedNutritionData;
}> = [
  {
    name: '1. Avocado (whole food, healthy fats)',
    expected: '85-95',
    data: {
      calories: 160,
      totalFat: 15,
      saturatedFat: 2,
      transFat: 0,
      cholesterol: 0,
      sodium: 7,
      totalCarbohydrates: 9,
      dietaryFiber: 7,
      sugars: 0.7,
      protein: 2,
      servingSize: '100g',
      foodContext: {
        foodName: 'Avocado',
        category: 'fruit',
        processingLevel: 'whole',
        sugarType: 'natural',
        fatType: 'healthy-unsaturated',
        fatSources: ['monounsaturated'],
        overallQuality: 'excellent',
        hasArtificialSweeteners: false,
        hasFortification: false
      }
    }
  },
  {
    name: '2. Instant Ramen (ultra-processed, high sodium)',
    expected: '5-15',
    data: {
      calories: 380,
      totalFat: 14,
      saturatedFat: 7,
      transFat: 0,
      cholesterol: 0,
      sodium: 1820,
      totalCarbohydrates: 52,
      dietaryFiber: 2,
      sugars: 2,
      protein: 10,
      servingSize: '100g',
      foodContext: {
        foodName: 'Instant Ramen Noodles',
        category: 'grain',
        processingLevel: 'ultra-processed',
        sugarType: 'added',
        fatType: 'unhealthy-saturated',
        overallQuality: 'very-poor',
        hasArtificialSweeteners: false,
        hasFortification: false
      }
    }
  },
  {
    name: '3. Blueberries (superfood)',
    expected: '90-100',
    data: {
      calories: 57,
      totalFat: 0.3,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 1,
      totalCarbohydrates: 14,
      dietaryFiber: 2.4,
      sugars: 10,
      protein: 0.7,
      servingSize: '100g',
      foodContext: {
        foodName: 'Fresh Blueberries',
        category: 'fruit',
        processingLevel: 'whole',
        sugarType: 'natural',
        fatType: 'minimal',
        overallQuality: 'excellent',
        hasArtificialSweeteners: false,
        hasFortification: false
      }
    }
  },
  {
    name: '4. Doritos Chips (ultra-processed snack)',
    expected: '0-10',
    data: {
      calories: 500,
      totalFat: 28,
      saturatedFat: 4,
      transFat: 0,
      cholesterol: 0,
      sodium: 350,
      totalCarbohydrates: 58,
      dietaryFiber: 3,
      sugars: 1,
      protein: 7,
      servingSize: '100g',
      foodContext: {
        foodName: 'Doritos Nacho Cheese',
        category: 'snack',
        processingLevel: 'ultra-processed',
        sugarType: 'added',
        fatType: 'processed',
        overallQuality: 'very-poor',
        hasArtificialSweeteners: false,
        hasFortification: false
      }
    }
  },
  {
    name: '5. Brown Rice (whole grain)',
    expected: '75-85',
    data: {
      calories: 111,
      totalFat: 0.9,
      saturatedFat: 0.2,
      transFat: 0,
      cholesterol: 0,
      sodium: 5,
      totalCarbohydrates: 23,
      dietaryFiber: 1.8,
      sugars: 0.4,
      protein: 2.6,
      servingSize: '100g',
      foodContext: {
        foodName: 'Cooked Brown Rice',
        category: 'grain',
        processingLevel: 'minimally-processed',
        sugarType: 'natural',
        fatType: 'minimal',
        overallQuality: 'good',
        hasArtificialSweeteners: false,
        hasFortification: false
      }
    }
  },
  {
    name: '6. Diet Coke (artificial sweeteners)',
    expected: '20-35',
    data: {
      calories: 0,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 40,
      totalCarbohydrates: 0,
      dietaryFiber: 0,
      sugars: 0,
      protein: 0,
      servingSize: '355ml',
      foodContext: {
        foodName: 'Diet Coke',
        category: 'beverage',
        processingLevel: 'ultra-processed',
        sugarType: 'none',
        fatType: 'none',
        overallQuality: 'poor',
        hasArtificialSweeteners: true,
        hasFortification: false
      }
    }
  },
  {
    name: '7. Almonds (nuts, healthy snack)',
    expected: '80-90',
    data: {
      calories: 579,
      totalFat: 50,
      saturatedFat: 3.8,
      transFat: 0,
      cholesterol: 0,
      sodium: 1,
      totalCarbohydrates: 22,
      dietaryFiber: 12.5,
      sugars: 4.4,
      protein: 21,
      servingSize: '100g',
      foodContext: {
        foodName: 'Raw Almonds',
        category: 'protein',
        processingLevel: 'whole',
        sugarType: 'natural',
        fatType: 'healthy-unsaturated',
        fatSources: ['monounsaturated', 'omega-3'],
        overallQuality: 'excellent',
        hasArtificialSweeteners: false,
        hasFortification: false
      }
    }
  },
  {
    name: '8. Ice Cream (processed dessert)',
    expected: '15-30',
    data: {
      calories: 207,
      totalFat: 11,
      saturatedFat: 7,
      transFat: 0,
      cholesterol: 44,
      sodium: 80,
      totalCarbohydrates: 24,
      dietaryFiber: 0.7,
      sugars: 21,
      protein: 3.5,
      servingSize: '100g',
      foodContext: {
        foodName: 'Vanilla Ice Cream',
        category: 'dairy',
        processingLevel: 'ultra-processed',
        sugarType: 'added',
        fatType: 'unhealthy-saturated',
        overallQuality: 'poor',
        hasArtificialSweeteners: false,
        hasFortification: false
      }
    }
  },
  {
    name: '9. Broccoli (vegetable)',
    expected: '90-100',
    data: {
      calories: 34,
      totalFat: 0.4,
      saturatedFat: 0.1,
      transFat: 0,
      cholesterol: 0,
      sodium: 33,
      totalCarbohydrates: 7,
      dietaryFiber: 2.6,
      sugars: 1.7,
      protein: 2.8,
      servingSize: '100g',
      foodContext: {
        foodName: 'Cooked Broccoli',
        category: 'vegetable',
        processingLevel: 'whole',
        sugarType: 'natural',
        fatType: 'minimal',
        overallQuality: 'excellent',
        hasArtificialSweeteners: false,
        hasFortification: false
      }
    }
  },
  {
    name: '10. Frosted Flakes (sugary cereal)',
    expected: '10-25',
    data: {
      calories: 375,
      totalFat: 1,
      saturatedFat: 0.2,
      transFat: 0,
      cholesterol: 0,
      sodium: 450,
      totalCarbohydrates: 87,
      dietaryFiber: 3,
      sugars: 37,
      protein: 4,
      servingSize: '100g',
      foodContext: {
        foodName: 'Frosted Flakes Cereal',
        category: 'grain',
        processingLevel: 'ultra-processed',
        sugarType: 'added',
        fatType: 'minimal',
        overallQuality: 'very-poor',
        hasArtificialSweeteners: false,
        hasFortification: true
      }
    }
  }
];

const scoringService = new OptimizedScoringService();
const results: Array<{
  name: string;
  expected: string;
  actual: number;
  category: string;
  novaGroup: number;
  passed: boolean;
  breakdown: any;
}> = [];
let passCount = 0;

testFoods.forEach(food => {
  const result = scoringService.calculateOptimizedScore(food.data);
  
  // Parse expected range
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
    category: result.category,
    novaGroup: result.novaGroup,
    passed: passed,
    breakdown: result.breakdown
  });
  
  console.log(`\n${food.name}`);
  console.log(`   Expected: ${food.expected}/100`);
  console.log(`   Actual: ${actualScore}/100 (${result.category})`);
  console.log(`   NOVA Group: ${result.novaGroup}`);
  console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!passed) {
    console.log(`   📊 Component Breakdown:`);
    console.log(`      Sugar: ${result.breakdown.sugarScore}`);
    console.log(`      Sat Fat: ${result.breakdown.saturatedFatScore}`);
    console.log(`      Trans Fat: ${result.breakdown.transFatScore}`);
    console.log(`      Sodium: ${result.breakdown.sodiumScore}`);
    console.log(`      Calories: ${result.breakdown.calorieScore}`);
    console.log(`      Protein: ${result.breakdown.proteinScore}`);
    console.log(`      Fiber: ${result.breakdown.fiberScore}`);
    console.log(`      Micronutrients: ${result.breakdown.micronutrientScore}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n📊 FINAL RESULTS:\n');
console.log(`✅ Pass Rate: ${passCount}/${testFoods.length} (${Math.round(passCount/testFoods.length*100)}%)\n`);

console.log('Detailed Summary:');
console.log('-'.repeat(80));
results.forEach((r, i) => {
  const foodName = r.name.includes('.') ? r.name.split('.')[1].trim() : r.name;
  console.log(`${i+1}. ${foodName}`);
  console.log(`   Expected: ${r.expected} | Actual: ${r.actual}/100 | NOVA: ${r.novaGroup} | ${r.passed ? '✅' : '❌'}`);
});

console.log('\n' + '='.repeat(80));
console.log('\n📈 ACCURACY ANALYSIS:\n');

// Categorize by food type
const wholeFoods = results.filter(r => 
  r.name.includes('Avocado') || r.name.includes('Blueberries') || 
  r.name.includes('Broccoli') || r.name.includes('Almonds')
);
const ultraProcessed = results.filter(r => 
  r.name.includes('Ramen') || r.name.includes('Doritos') || 
  r.name.includes('Ice Cream') || r.name.includes('Frosted')
);

console.log('🌱 Whole Foods (should score 80-100):');
wholeFoods.forEach(f => {
  const status = f.actual >= 80 ? '✅' : '❌';
  const foodName = f.name.includes('.') ? f.name.split('.')[1].trim() : f.name;
  console.log(`   ${status} ${foodName}: ${f.actual}/100 (NOVA ${f.novaGroup})`);
});

console.log('\n🚨 Ultra-Processed (should score 0-30):');
ultraProcessed.forEach(f => {
  const status = f.actual <= 30 ? '✅' : '❌';
  const foodName = f.name.includes('.') ? f.name.split('.')[1].trim() : f.name;
  console.log(`   ${status} ${foodName}: ${f.actual}/100 (NOVA ${f.novaGroup})`);
});

// Overall assessment
console.log('\n💡 OVERALL ASSESSMENT:\n');

if (passCount === testFoods.length) {
  console.log('🎉 PERFECT! All foods scored within expected ranges!');
  console.log('   ✅ The NOVA-based optimized formula is working accurately.');
  console.log('   ✅ Category-specific scoring is functioning correctly.');
  console.log('   ✅ Smart weights are properly adjusted by NOVA groups.');
} else if (passCount >= testFoods.length * 0.8) {
  console.log('✅ GOOD: Formula is mostly accurate (>80% pass rate)');
  console.log('   The core NOVA logic is sound.');
  console.log('   Minor adjustments may be needed for edge cases.');
} else if (passCount >= testFoods.length * 0.6) {
  console.log('⚠️  NEEDS WORK: Formula accuracy is moderate (60-80% pass rate)');
  console.log('   Review failed test cases and adjust weights/penalties.');
} else {
  console.log('❌ CRITICAL: Formula needs revision (<60% pass rate)');
  console.log('   Check NOVA classification and component scoring logic.');
}

// Detailed failure analysis
const failures = results.filter(r => !r.passed);
if (failures.length > 0) {
  console.log('\n❌ Failed Test Cases Analysis:');
  failures.forEach(f => {
    const foodName = f.name.includes('.') ? f.name.split('.')[1].trim() : f.name;
    const expectedRange = f.expected.split('-').map(n => parseInt(n));
    const expectedAvg = (expectedRange[0] + expectedRange[1]) / 2;
    const diff = f.actual - expectedAvg;
    
    console.log(`\n   ${foodName}:`);
    console.log(`     Score: ${f.actual}/100 (expected ${f.expected})`);
    console.log(`     Deviation: ${diff > 0 ? '+' : ''}${diff.toFixed(0)} points`);
    console.log(`     NOVA Group: ${f.novaGroup}`);
    console.log(`     Category: ${f.category}`);
    
    // Identify likely issues
    if (f.actual > expectedRange[1]) {
      console.log(`     ⚠️  Scored too HIGH - may need stricter penalties`);
    } else if (f.actual < expectedRange[0]) {
      console.log(`     ⚠️  Scored too LOW - may need reduced penalties or increased rewards`);
    }
  });
}

console.log('\n✅ Test Complete!\n');
