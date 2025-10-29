const { computeFoodSuitability } = require('./dist/services/dietRisk');

const person = {
  ldl: 160,
  hdl: 45,
  glucose: 95,
  bmi: 28,
  systolic: 130,
  diastolic: 80,
};

const smallCookie = {
  servingSize: 15,
  calories: 75,
  sfa: 2.5,
  sugar: 5,
  sodium: 50,
  protein: 1,
  carbs: 9,
  fiber: 0.3
};

const largeCookie = {
  servingSize: 100,
  calories: 500,
  sfa: 16.7,
  sugar: 33.3,
  sodium: 333,
  protein: 6.7,
  carbs: 60,
  fiber: 2
};

console.log('\n🧪 SCORING MODE TEST\n');
console.log('='.repeat(70));

// Test Portion-Aware Mode (default)
console.log('\n📊 MODE: PORTION-AWARE (Penalizes small servings)\n');

console.log('Small Cookie (15g):');
const resultSmallPA = computeFoodSuitability(person, smallCookie, undefined, 'portion-aware');
console.log(`Score: ${Math.round(resultSmallPA.score * 100)}/100\n`);

console.log('Large Cookie (100g):');
const resultLargePA = computeFoodSuitability(person, largeCookie, undefined, 'portion-aware');
console.log(`Score: ${Math.round(resultLargePA.score * 100)}/100\n`);

console.log('='.repeat(70));

// Test Per-100g Mode
console.log('\n📊 MODE: PER-100G (Same recipe = same score)\n');

console.log('Small Cookie (15g):');
const resultSmallPer100 = computeFoodSuitability(person, smallCookie, undefined, 'per-100g');
console.log(`Score: ${Math.round(resultSmallPer100.score * 100)}/100\n`);

console.log('Large Cookie (100g):');
const resultLargePer100 = computeFoodSuitability(person, largeCookie, undefined, 'per-100g');
console.log(`Score: ${Math.round(resultLargePer100.score * 100)}/100\n`);

console.log('='.repeat(70));

console.log('\n📈 RESULTS SUMMARY:\n');

const scoreSmallPA = Math.round(resultSmallPA.score * 100);
const scoreLargePA = Math.round(resultLargePA.score * 100);
const scoreSmallPer100 = Math.round(resultSmallPer100.score * 100);
const scoreLargePer100 = Math.round(resultLargePer100.score * 100);

console.log('PORTION-AWARE MODE:');
console.log(`  Small (15g):  ${scoreSmallPA}/100`);
console.log(`  Large (100g): ${scoreLargePA}/100`);
console.log(`  Difference:   ${Math.abs(scoreSmallPA - scoreLargePA)} points`);
console.log(`  ${scoreSmallPA < scoreLargePA ? '✅ Small penalized' : '❌ Small NOT penalized'}\n`);

console.log('PER-100G MODE:');
console.log(`  Small (15g):  ${scoreSmallPer100}/100`);
console.log(`  Large (100g): ${scoreLargePer100}/100`);
console.log(`  Difference:   ${Math.abs(scoreSmallPer100 - scoreLargePer100)} points`);
console.log(`  ${Math.abs(scoreSmallPer100 - scoreLargePer100) <= 1 ? '✅ Same score' : '❌ Different scores'}\n`);

console.log('='.repeat(70));
console.log('\n✅ Scoring Mode Test Complete!\n');
