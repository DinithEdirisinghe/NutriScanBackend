/**
 * Test script to verify nutrient density fix
 * 
 * This test demonstrates that the updated formula properly handles
 * nutrient density by comparing:
 * - 20g food with 5g SFA (25% density) - should be WORSE
 * - 100g food with 10g SFA (10% density) - should be BETTER
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

console.log('🧪 NUTRIENT DENSITY TEST\n');
console.log('Testing person with HIGH LDL cholesterol (180 mg/dL)\n');
console.log('=' .repeat(70));

// Test 1: Small serving with concentrated fat (e.g., chips)
console.log('\n📦 TEST 1: Small Serving, High Density (Chips/Candy)');
console.log('-'.repeat(70));
const foodA = {
  servingSize: 20,      // Small 20g serving
  calories: 100,        // 100 calories
  sfa: 5,               // 5g saturated fat
  sugar: 2,             // 2g sugar
  sodium: 150,          // 150mg sodium
};

console.log('Food A: 20g serving with 5g saturated fat');
console.log(`  → Nutrient Density: ${(5/20*100).toFixed(1)}% saturated fat`);
console.log(`  → Per 100g: ${(5/20*100).toFixed(1)}g saturated fat`);

const resultA = computeFoodSuitability(personHighCholesterol, foodA);
console.log(`\n✅ Score: ${Math.round(resultA.score * 100)}/100`);
console.log(`   Confidence: ${(resultA.confidence * 100).toFixed(0)}%`);

// Test 2: Large serving with diluted fat (e.g., soup, salad)
console.log('\n📦 TEST 2: Large Serving, Low Density (Soup/Salad)');
console.log('-'.repeat(70));
const foodB = {
  servingSize: 100,     // Standard 100g serving
  calories: 200,        // 200 calories
  sfa: 10,              // 10g saturated fat (more absolute fat!)
  sugar: 5,             // 5g sugar
  sodium: 300,          // 300mg sodium
};

console.log('Food B: 100g serving with 10g saturated fat');
console.log(`  → Nutrient Density: ${(10/100*100).toFixed(1)}% saturated fat`);
console.log(`  → Per 100g: ${(10/100*100).toFixed(1)}g saturated fat`);

const resultB = computeFoodSuitability(personHighCholesterol, foodB);
console.log(`\n✅ Score: ${Math.round(resultB.score * 100)}/100`);
console.log(`   Confidence: ${(resultB.confidence * 100).toFixed(0)}%`);

// Results comparison
console.log('\n' + '='.repeat(70));
console.log('📊 RESULTS COMPARISON');
console.log('='.repeat(70));

const scoreA = Math.round(resultA.score * 100);
const scoreB = Math.round(resultB.score * 100);

console.log(`\nFood A (20g, 5g SFA, 25% density): ${scoreA}/100`);
console.log(`Food B (100g, 10g SFA, 10% density): ${scoreB}/100`);

console.log('\n🎯 EXPECTED BEHAVIOR:');
console.log('  ✅ Food A should score LOWER (worse) despite having less absolute fat');
console.log('  ✅ Food B should score HIGHER (better) despite having more absolute fat');
console.log('  ✅ This is because Food A is 2.5× more concentrated (25% vs 10%)');

console.log('\n📈 ACTUAL RESULTS:');
if (scoreA < scoreB) {
  console.log('  ✅ PASS: Food A scored lower than Food B');
  console.log(`  ✅ Food A is properly penalized for high density`);
  console.log(`  ✅ Difference: ${scoreB - scoreA} points`);
} else {
  console.log('  ❌ FAIL: Food A scored higher than or equal to Food B');
  console.log(`  ❌ Formula is NOT properly accounting for nutrient density`);
}

// Test 3: Extreme case - pure butter vs diluted soup
console.log('\n' + '='.repeat(70));
console.log('📦 TEST 3: Extreme Case - Butter vs Vegetable Soup');
console.log('='.repeat(70));

const butter = {
  servingSize: 14,      // 1 tablespoon
  calories: 100,
  sfa: 7,               // 7g saturated fat
  cholesterol: 30,
};

console.log('\nButter: 14g (1 tbsp) with 7g saturated fat');
console.log(`  → Density: ${(7/14*100).toFixed(1)}% saturated fat`);
console.log(`  → Per 100g: ${(7/14*100).toFixed(1)}g saturated fat`);

const resultButter = computeFoodSuitability(personHighCholesterol, butter);
console.log(`✅ Score: ${Math.round(resultButter.score * 100)}/100`);

const soup = {
  servingSize: 200,     // Large bowl
  calories: 150,
  sfa: 3,               // Only 3g saturated fat (less than butter!)
  sodium: 800,
  protein: 8,
};

console.log('\nVegetable Soup: 200g with 3g saturated fat');
console.log(`  → Density: ${(3/200*100).toFixed(1)}% saturated fat`);
console.log(`  → Per 100g: ${(3/200*100).toFixed(1)}g saturated fat`);

const resultSoup = computeFoodSuitability(personHighCholesterol, soup);
console.log(`✅ Score: ${Math.round(resultSoup.score * 100)}/100`);

const scoreButter = Math.round(resultButter.score * 100);
const scoreSoup = Math.round(resultSoup.score * 100);

console.log('\n📊 EXTREME CASE COMPARISON:');
console.log(`  Butter (14g, 50% SFA density): ${scoreButter}/100`);
console.log(`  Soup (200g, 1.5% SFA density): ${scoreSoup}/100`);

if (scoreButter < scoreSoup) {
  console.log('\n  ✅ PASS: Butter scored MUCH lower than soup');
  console.log(`  ✅ Butter is ${((scoreSoup - scoreButter)/scoreButter*100).toFixed(0)}% worse (correct!)`);
} else {
  console.log('\n  ❌ FAIL: Butter did not score lower than soup');
}

console.log('\n' + '='.repeat(70));
console.log('✅ Nutrient Density Test Complete!');
console.log('='.repeat(70));
