const { computeFoodSuitability } = require('./dist/services/dietRisk');

// User profile from screenshot (LDL = 100, underweight)
const person = {
  ldl: 100,
  glucose: 93,
  height: 175,
  weight: 55,
  bmi: 18.0, // Underweight
};

// Pepsi from screenshot
const pepsi = {
  servingSize: 266, // ml
  calories: 88,
  totalFat: 0,
  sfa: 0,
  transFat: 0,
  cholesterol: 105,
  sodium: 166,
  carbs: 21.5,
  sugar: 21.5, // VERY HIGH - almost pure sugar!
  fiber: 0,
  protein: 0,
};

console.log('\n🥤 PEPSI SCORING TEST\n');
console.log('='.repeat(70));

console.log('\n📊 Nutrition Facts:');
console.log(`  Serving: ${pepsi.servingSize}ml`);
console.log(`  Sugar: ${pepsi.sugar}g (in ${pepsi.servingSize}ml)`);
console.log(`  Sugar per 100ml: ${(pepsi.sugar / pepsi.servingSize * 100).toFixed(2)}g`);
console.log(`  Sugar density: ${(pepsi.sugar / pepsi.servingSize * 100).toFixed(1)}%`);

const result = computeFoodSuitability(person, pepsi, undefined, 'portion-aware');
const score = Math.round(result.score * 100);

console.log('\n📈 SCORING RESULT:');
console.log(`  Overall Score: ${score}/100`);
console.log(`  Category: ${score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : score >= 20 ? 'Poor' : 'Very Poor'}`);

console.log('\n🔍 ANALYSIS:');
if (score >= 70) {
  console.log('  ❌ PROBLEM: Pepsi scored TOO HIGH!');
  console.log('  ❌ A drink with 21.5g sugar should NOT score 70+');
  console.log('  ❌ This is essentially liquid sugar (97% of carbs are sugar)');
} else if (score >= 40) {
  console.log('  ⚠️  Score is moderate but still too high for pure sugar water');
} else {
  console.log('  ✅ Score correctly reflects unhealthy nature');
}

console.log('\n💡 EXPECTED BEHAVIOR:');
console.log('  • Pepsi should score < 30/100 (Poor/Very Poor)');
console.log('  • 21.5g sugar in 266ml is VERY unhealthy');
console.log('  • Almost no nutritional value (no protein, fiber, vitamins)');
console.log('  • Just empty calories from sugar');

console.log('\n='.repeat(70));

// Test with a healthy drink for comparison
const unsweetenedTeaWithLemon = {
  servingSize: 266,
  calories: 5,
  totalFat: 0,
  sfa: 0,
  sodium: 10,
  carbs: 1,
  sugar: 0,
  fiber: 0,
  protein: 0,
};

console.log('\n🍵 COMPARISON: Unsweetened Tea (266ml)\n');
const teaResult = computeFoodSuitability(person, unsweetenedTeaWithLemon, undefined, 'portion-aware');
const teaScore = Math.round(teaResult.score * 100);

console.log(`  Tea Score: ${teaScore}/100`);
console.log(`  Pepsi Score: ${score}/100`);
console.log(`  Difference: ${teaScore - score} points`);

if (teaScore <= score) {
  console.log('\n  ❌ CRITICAL BUG: Tea should score MUCH higher than Pepsi!');
} else {
  console.log('\n  ✅ Tea correctly scores higher than Pepsi');
}

console.log('\n='.repeat(70));
console.log('\n✅ Test Complete!\n');
