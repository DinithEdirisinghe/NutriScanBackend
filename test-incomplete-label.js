/**
 * Test script to check how the formula handles INCOMPLETE nutrition labels
 * 
 * This test demonstrates what happens when a food label has only a few nutrients
 * (e.g., only SFA is present, but sugar, sodium, etc. are missing/null)
 */

const { computeFoodSuitability } = require('./dist/services/dietRisk');

// Test person with high cholesterol
const personHighCholesterol = {
  ldl: 180,        // Very high LDL cholesterol
  hdl: 35,         // Low HDL (bad)
  glucose: 100,    // Normal blood sugar
  bmi: 28,         // Overweight
  systolic: 140,   // High blood pressure
  diastolic: 90,   // High blood pressure
};

console.log('🧪 INCOMPLETE NUTRITION LABEL TEST\n');
console.log('Testing person with HIGH LDL cholesterol (180 mg/dL)\n');
console.log('=' .repeat(70));

// Test 1: Food with ONLY SFA (extreme case)
console.log('\n📦 TEST 1: Label with ONLY Saturated Fat');
console.log('-'.repeat(70));
const foodOnlySFA = {
  servingSize: 100,
  sfa: 25,              // Extremely high SFA (25g per 100g = 25% density)
  // Everything else is missing/null
  sugar: null,
  sodium: null,
  cholesterol: null,
  transFat: null,
  protein: null,
  fiber: null,
  calories: null,
};

console.log('Food: 100g serving with 25g saturated fat (everything else missing)');
console.log(`  → Only 1 nutrient present: SFA = 25g (25% density)`);

const resultOnlySFA = computeFoodSuitability(personHighCholesterol, foodOnlySFA);
console.log(`\n✅ Score: ${Math.round(resultOnlySFA.score * 100)}/100`);
console.log(`   Confidence: ${(resultOnlySFA.confidence * 100).toFixed(0)}%`);

// Test 2: Same SFA but with other nutrients present (complete label)
console.log('\n📦 TEST 2: Complete Label with Same SFA');
console.log('-'.repeat(70));
const foodCompleteSFA = {
  servingSize: 100,
  sfa: 25,              // Same high SFA
  sugar: 5,             // Also has sugar
  sodium: 500,          // Also has sodium
  cholesterol: 80,      // Also has cholesterol
  transFat: 0,
  protein: 3,
  fiber: 0,
  calories: 300,
};

console.log('Food: 100g serving with 25g saturated fat (complete nutrition info)');
console.log(`  → All nutrients present: SFA=25g, sugar=5g, sodium=500mg, etc.`);

const resultCompleteSFA = computeFoodSuitability(personHighCholesterol, foodCompleteSFA);
console.log(`\n✅ Score: ${Math.round(resultCompleteSFA.score * 100)}/100`);
console.log(`   Confidence: ${(resultCompleteSFA.confidence * 100).toFixed(0)}%`);

// Results comparison
console.log('\n' + '='.repeat(70));
console.log('📊 RESULTS COMPARISON');
console.log('='.repeat(70));

const scoreOnlySFA = Math.round(resultOnlySFA.score * 100);
const scoreCompleteSFA = Math.round(resultCompleteSFA.score * 100);

console.log(`\nIncomplete Label (only SFA): ${scoreOnlySFA}/100`);
console.log(`Complete Label (SFA + others): ${scoreCompleteSFA}/100`);

console.log('\n🎯 QUESTION:');
console.log('  Does the formula give a HIGH score to incomplete labels?');
console.log('  Or does it only calculate risk for the nutrients that ARE present?');

console.log('\n📈 ANALYSIS:');
if (scoreOnlySFA > 70) {
  console.log(`  ⚠️  PROBLEM DETECTED: Incomplete label scored ${scoreOnlySFA}/100`);
  console.log(`  ⚠️  This is TOO HIGH for a food with 25g saturated fat!`);
  console.log(`  ⚠️  Missing nutrients are being treated as "safe" (zero impact)`);
  console.log(`  ⚠️  This is the FIRST case you mentioned - it's an ISSUE`);
} else {
  console.log(`  ✅ Incomplete label scored ${scoreOnlySFA}/100`);
  console.log(`  ✅ Formula correctly penalizes based on present nutrients only`);
  console.log(`  ✅ This is the SECOND case you mentioned - it's FINE`);
}

if (Math.abs(scoreOnlySFA - scoreCompleteSFA) < 5) {
  console.log(`  ℹ️  Scores are very similar (difference: ${Math.abs(scoreOnlySFA - scoreCompleteSFA)} points)`);
  console.log(`  ℹ️  This suggests missing nutrients have minimal impact`);
} else {
  console.log(`  ℹ️  Scores differ significantly (difference: ${Math.abs(scoreOnlySFA - scoreCompleteSFA)} points)`);
  console.log(`  ℹ️  Complete label captures more risk from additional nutrients`);
}

// Test 3: Very incomplete label (only 2 nutrients)
console.log('\n' + '='.repeat(70));
console.log('📦 TEST 3: Partially Complete Label (SFA + Sugar only)');
console.log('='.repeat(70));

const foodPartial = {
  servingSize: 100,
  sfa: 15,              // High SFA
  sugar: 40,            // Very high sugar
  // Everything else missing
  sodium: null,
  cholesterol: null,
  transFat: null,
  protein: null,
  fiber: null,
  calories: null,
};

console.log('Food: 100g serving with 15g SFA + 40g sugar (other nutrients missing)');
console.log(`  → 2 nutrients present: SFA=15g, sugar=40g`);

const resultPartial = computeFoodSuitability(personHighCholesterol, foodPartial);
const scorePartial = Math.round(resultPartial.score * 100);
console.log(`\n✅ Score: ${scorePartial}/100`);
console.log(`   Confidence: ${(resultPartial.confidence * 100).toFixed(0)}%`);

console.log('\n📊 THREE-WAY COMPARISON:');
console.log(`  Only SFA (1 nutrient):       ${scoreOnlySFA}/100`);
console.log(`  SFA + Sugar (2 nutrients):   ${scorePartial}/100`);
console.log(`  Complete (all nutrients):    ${scoreCompleteSFA}/100`);

console.log('\n🎯 EXPECTED BEHAVIOR:');
console.log('  For person with high LDL (180), foods with high SFA should score LOW');
console.log('  Incomplete labels should either:');
console.log('    A) Get penalized for missing data (confidence penalty), OR');
console.log('    B) Only calculate risk for present nutrients (no false "good" score)');

console.log('\n' + '='.repeat(70));
console.log('✅ Incomplete Label Test Complete!');
console.log('='.repeat(70));
