const { computeFoodSuitability } = require('./dist/services/dietRisk');

// User with high LDL and low HDL
const person = {
  ldl: 180,      // HIGH (very high risk)
  hdl: 35,       // LOW (poor)
  glucose: 95,   // normal
  height: 175,
  weight: 70,
  bmi: 23,       // normal
  systolic: 120,
  diastolic: 80,
};

const foods = [
  {
    name: '1. Butter (WORST)',
    expected: '0-5',
    data: {
      servingSize: 14,
      calories: 100,
      sfa: 7,
      transFat: 0.5,
      cholesterol: 30,
      sodium: 90,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      protein: 0,
    }
  },
  {
    name: '2. Fried Chicken',
    expected: '5-15',
    data: {
      servingSize: 100,
      calories: 450,
      sfa: 8,           // VERY HIGH saturated fat
      transFat: 0.3,    // Has trans fat too!
      cholesterol: 135, // VERY HIGH
      sodium: 900,      // HIGH
      carbs: 18,
      fiber: 1,
      sugar: 1,
      protein: 30,
    }
  },
  {
    name: '3. Pepsi',
    expected: '15-25',
    data: {
      servingSize: 330,
      calories: 140,
      sfa: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 15,
      carbs: 39,
      fiber: 0,
      sugar: 39,
      protein: 0,
    }
  },
  {
    name: '4. Chocolate Cookies',
    expected: '25-35',
    data: {
      servingSize: 30,
      calories: 150,
      sfa: 5,
      transFat: 0,
      cholesterol: 10,
      sodium: 100,
      carbs: 18,
      fiber: 0.6,
      sugar: 10,
      protein: 2,
    }
  },
  {
    name: '5. Full-Fat Yogurt',
    expected: '35-45',
    data: {
      servingSize: 150,
      calories: 110,
      sfa: 3.5,
      transFat: 0,
      cholesterol: undefined,
      sodium: 55,
      carbs: 11.44,
      fiber: undefined,
      sugar: 11.44,
      protein: 5,
    }
  },
  {
    name: '6. White Bread',
    expected: '45-55',
    data: {
      servingSize: 50,
      calories: 130,
      sfa: 0.3,
      transFat: 0,
      cholesterol: 0,
      sodium: 260,
      carbs: 24,
      fiber: 1,
      sugar: 3,
      protein: 4,
    }
  },
  {
    name: '7. Grilled Chicken Breast',
    expected: '55-65',
    data: {
      servingSize: 100,
      calories: 165,
      sfa: 1,           // LOW saturated fat (good!)
      transFat: 0,
      cholesterol: 85,
      sodium: 74,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      protein: 31,      // HIGH protein
    }
  },
  {
    name: '8. Low-Fat Greek Yogurt',
    expected: '65-75',
    data: {
      servingSize: 150,
      calories: 100,
      sfa: 1,
      transFat: 0,
      cholesterol: 10,
      sodium: 60,
      carbs: 7,
      fiber: undefined,
      sugar: 6,
      protein: 17,
    }
  },
  {
    name: '9. Oatmeal',
    expected: '75-85',
    data: {
      servingSize: 40,
      calories: 150,
      sfa: 0.5,
      transFat: 0,
      cholesterol: 0,
      sodium: 0,
      carbs: 27,
      fiber: 4,
      sugar: 1,
      protein: 5,
    }
  },
  {
    name: '10. Salmon',
    expected: '85-95',
    data: {
      servingSize: 100,
      calories: 206,
      sfa: 2.5,
      transFat: 0,
      cholesterol: 63,
      sodium: 59,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      protein: 22,
    }
  },
  {
    name: '11. Spinach Salad (BEST)',
    expected: '90-100',
    data: {
      servingSize: 115,
      calories: 150,
      sfa: 2,
      transFat: 0,
      cholesterol: 0,
      sodium: 90,
      carbs: 5,
      fiber: 3,
      sugar: 1,
      protein: 3,
    }
  },
];

console.log('\n🧪 COMPREHENSIVE SCORING TEST');
console.log('='.repeat(80));
console.log('\n👤 User Profile:');
console.log(`   LDL: ${person.ldl} mg/dL (HIGH - target < 100)`);
console.log(`   HDL: ${person.hdl} mg/dL (LOW - target > 60)`);
console.log(`   Glucose: ${person.glucose} mg/dL (normal)`);
console.log(`   BMI: ${person.bmi} (normal)`);
console.log('\n' + '='.repeat(80));

const results = [];

foods.forEach((food, index) => {
  // Use per-100g mode for fair comparison (no serving size amplification)
  const result = computeFoodSuitability(person, food.data, undefined, 'per-100g');
  const score = Math.round(result.score * 100);
  
  results.push({
    rank: index + 1,
    name: food.name,
    expected: food.expected,
    actual: score,
  });
  
  console.log(`\n${food.name}`);
  console.log(`   Expected: ${food.expected}/100`);
  console.log(`   Actual: ${score}/100`);
  console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  
  // Check if in expected range
  const [min, max] = food.expected.split('-').map(Number);
  const inRange = score >= min && score <= max;
  console.log(`   ${inRange ? '✅ PASS' : '❌ FAIL'}`);
});

console.log('\n' + '='.repeat(80));
console.log('\n📊 SUMMARY:\n');
console.log('Rank | Food                     | Expected  | Actual | Status');
console.log('-----|--------------------------|-----------|--------|--------');
results.forEach(r => {
  const [min, max] = r.expected.split('-').map(Number);
  const inRange = r.actual >= min && r.actual <= max;
  const status = inRange ? '✅ PASS' : '❌ FAIL';
  console.log(`${r.rank.toString().padStart(4)} | ${r.name.padEnd(24)} | ${r.expected.padEnd(9)} | ${r.actual.toString().padStart(6)} | ${status}`);
});

console.log('\n' + '='.repeat(80));

// Calculate pass rate
const passCount = results.filter(r => {
  const [min, max] = r.expected.split('-').map(Number);
  return r.actual >= min && r.actual <= max;
}).length;

const passRate = (passCount / results.length * 100).toFixed(0);
console.log(`\n✅ Pass Rate: ${passCount}/${results.length} (${passRate}%)\n`);

// Check if order is preserved (monotonically increasing)
let orderCorrect = true;
for (let i = 1; i < results.length; i++) {
  if (results[i].actual < results[i-1].actual) {
    console.log(`❌ ORDER VIOLATION: "${results[i-1].name}" (${results[i-1].actual}) > "${results[i].name}" (${results[i].actual})`);
    orderCorrect = false;
  }
}

if (orderCorrect) {
  console.log('✅ Order is correct (scores are monotonically increasing)\n');
} else {
  console.log('\n⚠️  Order is NOT correct - algorithm needs adjustment\n');
}
