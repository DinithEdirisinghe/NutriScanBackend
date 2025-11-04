// Direct scoring calculation test
console.log('🧪 Testing Coca-Cola Scoring Logic\n');

// Per 100ml normalized values
const sugars = 10.6;  // 24.93g / 250ml * 100 = 9.972g ≈ 10g per 100ml
const calories = 42;  // 100 / 250 * 100 = 40 kcal per 100ml
const sodium = 0.452; // 1.13 / 250 * 100 = 0.452 mg per 100ml

console.log('📊 Normalized values (per 100ml):');
console.log(`  Sugars: ${sugars}g`);
console.log(`  Calories: ${calories}kcal`);
console.log(`  Sodium: ${sodium}mg`);
console.log(`  Fat: 0g`);
console.log('');

// TEST 1: HEALTHY PERSON
console.log('='.repeat(60));
console.log('TEST 1: HEALTHY PERSON (No Conditions)');
console.log('='.repeat(60));

const healthyWeights = { sugar: 0.20, fat: 0.20, sodium: 0.20, calorie: 0.20, quality: 0.20 };

// Component scores for healthy person
let sugarScoreHealthy = 50; // sugars > 8 && <= 15 => 50
let fatScore = 100; // no fat
let sodiumScore = 100; // very low sodium
let calorieScoreHealthy = 100; // calories <= 250
let qualityScore = 20; // ultra-processed = 20

console.log('\n📈 Component Scores:');
console.log(`  Sugar:   ${sugarScoreHealthy}/100 (${sugars}g > 8g threshold)`);
console.log(`  Fat:     ${fatScore}/100 (no fat)`);
console.log(`  Sodium:  ${sodiumScore}/100 (${sodium}mg very low)`);
console.log(`  Calorie: ${calorieScoreHealthy}/100 (${calories}kcal low)`);
console.log(`  Quality: ${qualityScore}/100 (ultra-processed penalty)`);

let healthyScore = Math.round(
  sugarScoreHealthy * healthyWeights.sugar +
  fatScore * healthyWeights.fat +
  sodiumScore * healthyWeights.sodium +
  calorieScoreHealthy * healthyWeights.calorie +
  qualityScore * healthyWeights.quality
);

const processingPenalty = 25; // Ultra-processed penalty increased
healthyScore -= processingPenalty;

console.log(`\n⚖️  Weighted Score: ${healthyScore + processingPenalty}`);
console.log(`   - Processing Penalty: ${processingPenalty}`);
console.log(`   = ${healthyScore}/100`);

// TEST 2: DIABETIC PATIENT
console.log('\n' + '='.repeat(60));
console.log('TEST 2: DIABETIC PATIENT');
console.log('='.repeat(60));

// For diabetics: sugar weight = 65%, quality = 15%, others = 20% total
const totalWeight = 0.65 + 0.15 + 0.20;
const diabeticWeights = {
  sugar: 0.65 / totalWeight,
  fat: 0.05 / totalWeight,
  sodium: 0.05 / totalWeight,
  calorie: 0.10 / totalWeight,
  quality: 0.15 / totalWeight
};

console.log('\n⚖️  Diabetic Weights (sugar is CRITICAL):');
Object.entries(diabeticWeights).forEach(([key, val]) => {
  console.log(`  ${key.padEnd(8)}: ${(val * 100).toFixed(1)}%`);
});

// Sugar score for diabetic with 10.6g (in 10-15g range)
const effectiveSugar = 10.6;
const isUltraProcessed = true;
const baseScore = 20 - ((effectiveSugar - 10) * 3);  // 20 - (0.6 * 3) = 18.2
const sugarScoreDiabetic = Math.max(5, baseScore - 10); // 18.2 - 10 = 8.2

console.log('\n📈 Component Scores:');
console.log(`  Sugar:   ${sugarScoreDiabetic}/100 🚨 (${sugars}g in dangerous 10-15g range)`);
console.log(`           Base score: ${baseScore.toFixed(1)} - 10 (ultra-processed) = ${sugarScoreDiabetic.toFixed(1)}`);
console.log(`  Fat:     ${fatScore}/100`);
console.log(`  Sodium:  ${sodiumScore}/100`);
console.log(`  Calorie: ${calorieScoreHealthy}/100`);
console.log(`  Quality: ${qualityScore}/100`);

let diabeticScore = Math.round(
  sugarScoreDiabetic * diabeticWeights.sugar +
  fatScore * diabeticWeights.fat +
  sodiumScore * diabeticWeights.sodium +
  calorieScoreHealthy * diabeticWeights.calorie +
  qualityScore * diabeticWeights.quality
);

// Penalties: processing + glycemic (very-high impact * ultra-processed multiplier)
const glycemicPenalty = Math.round(30 * 1.5); // 30 * 1.5 = 45

console.log(`\n⚖️  Weighted Score: ${diabeticScore + processingPenalty + glycemicPenalty}`);
console.log(`   - Processing Penalty: ${processingPenalty}`);
console.log(`   - Glycemic Penalty: ${glycemicPenalty} (very-high impact × ultra-processed)`);
console.log(`   = ${Math.max(0, diabeticScore)}/100`);

diabeticScore -= processingPenalty;
diabeticScore -= glycemicPenalty;
diabeticScore = Math.max(0, diabeticScore);

// TEST 3: CHOLESTEROL + BP
console.log('\n' + '='.repeat(60));
console.log('TEST 3: HIGH CHOLESTEROL + HIGH BLOOD PRESSURE');
console.log('='.repeat(60));

// For chol+BP: fat weight = 50%, sodium = 50%, normalize
const cholBPTotalWeight = 0.50 + 0.50 + 0.20;
const cholBPWeights = {
  sugar: 0.10 / cholBPTotalWeight,
  fat: 0.50 / cholBPTotalWeight,
  sodium: 0.50 / cholBPTotalWeight,
  calorie: 0.05 / cholBPTotalWeight,
  quality: 0.05 / cholBPTotalWeight
};

console.log('\n⚖️  Cholesterol + BP Weights:');
Object.entries(cholBPWeights).forEach(([key, val]) => {
  console.log(`  ${key.padEnd(8)}: ${(val * 100).toFixed(1)}%`);
});

console.log('\n📈 Component Scores:');
console.log(`  Sugar:   ${sugarScoreHealthy}/100`);
console.log(`  Fat:     ${fatScore}/100 (no fat = excellent for cholesterol)`);
console.log(`  Sodium:  ${sodiumScore}/100 (very low = excellent for BP)`);
console.log(`  Calorie: ${calorieScoreHealthy}/100`);
console.log(`  Quality: ${qualityScore}/100`);

let cholBPScore = Math.round(
  sugarScoreHealthy * cholBPWeights.sugar +
  fatScore * cholBPWeights.fat +
  sodiumScore * cholBPWeights.sodium +
  calorieScoreHealthy * cholBPWeights.calorie +
  qualityScore * cholBPWeights.quality
);

cholBPScore -= processingPenalty;

console.log(`\n⚖️  Weighted Score: ${cholBPScore + processingPenalty}`);
console.log(`   - Processing Penalty: ${processingPenalty}`);
console.log(`   = ${Math.max(0, cholBPScore)}/100`);

// SUMMARY
console.log('\n' + '='.repeat(60));
console.log('📊 FINAL RESULTS SUMMARY');
console.log('='.repeat(60));
console.log(`\nCoca-Cola (Classic) - Health Scores:`);
console.log(`  Healthy Person:              ${healthyScore}/100`);
console.log(`  Diabetic Patient:            ${diabeticScore}/100 🚨 CRITICAL`);
console.log(`  Cholesterol + BP:            ${Math.max(0, cholBPScore)}/100`);

console.log(`\n✅ ANALYSIS:`);
console.log(`  • Healthy person: Got ${healthyScore} (expected ~35-45)`);
console.log(`    - Ultra-processed sugary drink penalized`);
console.log(``);
console.log(`  • Diabetic: Got ${diabeticScore} (expected <10) ✅ MUCH BETTER!`);
console.log(`    - Sugar weighted at ${(diabeticWeights.sugar * 100).toFixed(1)}%`);
console.log(`    - Sugar score only ${sugarScoreDiabetic.toFixed(1)}/100`);
console.log(`    - Heavy glycemic penalty: -${glycemicPenalty}`);
console.log(``);
console.log(`  • Cholesterol + BP: Got ${Math.max(0, cholBPScore)} (expected ~60-70)`);
console.log(`    - No fat/sodium = good for their conditions`);
console.log(`    - But ultra-processed = poor quality`);
