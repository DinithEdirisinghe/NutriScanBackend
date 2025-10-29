const { computeFoodSuitability } = require('./dist/services/dietRisk');

const person = {
  ldl: 160,
  hdl: 45,
  glucose: 95,
  bmi: 28,
  systolic: 130,
  diastolic: 80,
};

// Yogurt - moderate food
const smallYogurt = {
  servingSize: 20,  // Small individual cup
  calories: 15,
  sfa: 0.5,
  sugar: 2,
  sodium: 10,
  protein: 1.5,
  carbs: 2,
  fiber: 0
};

const largeYogurt = {
  servingSize: 100,  // Standard serving
  calories: 75,
  sfa: 2.5,
  sugar: 10,
  sodium: 50,
  protein: 7.5,
  carbs: 10,
  fiber: 0
};

console.log('\n🧪 SCORING MODE TEST - YOGURT\n');
console.log('='.repeat(70));

// Test Portion-Aware Mode
console.log('\n📊 MODE: PORTION-AWARE (Penalizes small servings)\n');

console.log('Small Yogurt (20g):');
const resultSmallPA = computeFoodSuitability(person, smallYogurt, undefined, 'portion-aware');
console.log(`Score: ${Math.round(resultSmallPA.score * 100)}/100\n`);

console.log('Large Yogurt (100g):');
const resultLargePA = computeFoodSuitability(person, largeYogurt, undefined, 'portion-aware');
console.log(`Score: ${Math.round(resultLargePA.score * 100)}/100\n`);

console.log('='.repeat(70));

// Test Per-100g Mode
console.log('\n📊 MODE: PER-100G (Same recipe = same score)\n');

console.log('Small Yogurt (20g):');
const resultSmallPer100 = computeFoodSuitability(person, smallYogurt, undefined, 'per-100g');
console.log(`Score: ${Math.round(resultSmallPer100.score * 100)}/100\n`);

console.log('Large Yogurt (100g):');
const resultLargePer100 = computeFoodSuitability(person, largeYogurt, undefined, 'per-100g');
console.log(`Score: ${Math.round(resultLargePer100.score * 100)}/100\n`);

console.log('='.repeat(70));

console.log('\n📈 RESULTS SUMMARY:\n');

const scoreSmallPA = Math.round(resultSmallPA.score * 100);
const scoreLargePA = Math.round(resultLargePA.score * 100);
const scoreSmallPer100 = Math.round(resultSmallPer100.score * 100);
const scoreLargePer100 = Math.round(resultLargePer100.score * 100);

console.log('PORTION-AWARE MODE:');
console.log(`  Small (20g):  ${scoreSmallPA}/100`);
console.log(`  Large (100g): ${scoreLargePA}/100`);
console.log(`  Difference:   ${Math.abs(scoreSmallPA - scoreLargePA)} points`);
console.log(`  ${scoreSmallPA < scoreLargePA ? '✅ Small penalized (lower score)' : '❌ Small NOT penalized'}\n`);

console.log('PER-100G MODE:');
console.log(`  Small (20g):  ${scoreSmallPer100}/100`);
console.log(`  Large (100g): ${scoreLargePer100}/100`);
console.log(`  Difference:   ${Math.abs(scoreSmallPer100 - scoreLargePer100)} points`);
console.log(`  ${Math.abs(scoreSmallPer100 - scoreLargePer100) <= 1 ? '✅ Same score (as expected)' : '❌ Different scores'}\n`);

console.log('='.repeat(70));
console.log('\n✅ Test Complete!\n');
console.log('Expected behavior:');
console.log('  • Portion-aware: Small < Large (small servings penalized)');
console.log('  • Per-100g: Small ≈ Large (same recipe, same score)\n');
