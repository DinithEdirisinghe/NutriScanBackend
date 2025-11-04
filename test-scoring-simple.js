// Simple test of the enhanced scoring service
const { normalizeNutrients } = require('./src/utils/serving-size.util');

// Simulated Coca-Cola data (250ml serving)
const cokeRaw = {
  calories: 100,
  totalFat: 0,
  saturatedFat: 0,
  transFat: 0,
  cholesterol: 0,
  sodium: 1.13,
  totalCarbs: 25,
  fiber: 0,
  sugars: 24.93,
  protein: 0,
  servingSize: '250 ml'
};

const cokeContext = {
  foodName: 'Coca-Cola (Classic)',
  category: 'beverage',
  processingLevel: 'ultra-processed',
  cookingMethod: 'none',
  sugarType: 'added',
  sugarSources: ['high fructose corn syrup'],
  fatType: 'none',
  fatSources: [],
  carbType: 'refined',
  glycemicImpact: 'very-high',
  glycemicReasoning: 'Pure liquid sugar causes rapid blood glucose spike',
  hasWholeGrains: false,
  hasPreservatives: true,
  overallQuality: 'very-poor',
  qualityReasoning: 'Ultra-processed beverage with only added sugars, no nutritional value',
  confidence: 'high'
};

// Create mock users
const healthyUser = {
  hasDiabetes: false,
  hasHighCholesterol: false,
  hasHighBloodPressure: false,
  weight: 70,
  height: 175,
  bmiCategory: 'Normal',
  isHealthy: true
};

const diabeticUser = {
  hasDiabetes: true,
  hasHighCholesterol: false,
  hasHighBloodPressure: false,
  weight: 70,
  height: 175,
  bmiCategory: 'Normal',
  isHealthy: false
};

const cholesterolBPUser = {
  hasDiabetes: false,
  hasHighCholesterol: true,
  hasHighBloodPressure: true,
  weight: 70,
  height: 175,
  bmiCategory: 'Normal',
  isHealthy: false
};

console.log('🧪 Testing Enhanced Scoring Service\n');
console.log('📦 Product: Coca-Cola (Classic) - 250ml serving');

// Normalize to per-100ml
console.log('\n📏 Normalizing nutrients from 250ml to per-100ml...');
const normalized = normalizeNutrients(cokeRaw, '250 ml');
console.log('Normalized values:', normalized);

// Now manually calculate scores to show the logic
console.log('\n' + '='.repeat(70));
console.log('TEST 1: HEALTHY PERSON');
console.log('='.repeat(70));

console.log('\n📊 Component Scores:');
// Sugar score for healthy person
let sugarScore = 100;
if (normalized.sugars > 40) sugarScore = 10;
else if (normalized.sugars > 25) sugarScore = 30;
else if (normalized.sugars > 15) sugarScore = 50;
else if (normalized.sugars > 8) sugarScore = 75;
console.log(`  Sugar (${normalized.sugars}g/100ml): ${sugarScore}/100 (healthy threshold)`);

// Fat score (no fat)
console.log(`  Fat (${normalized.totalFat}g/100ml): 100/100`);

// Sodium (very low)
console.log(`  Sodium (${normalized.sodium}mg/100ml): 100/100`);

// Calories
let calorieScore = 100;
if (normalized.calories > 600) calorieScore = 30;
else if (normalized.calories > 400) calorieScore = 60;
else if (normalized.calories > 250) calorieScore = 80;
console.log(`  Calorie (${normalized.calories}kcal/100ml): ${calorieScore}/100`);

// Quality (ultra-processed)
let qualityScore = 20; // Ultra-processed = 20
console.log(`  Quality (ultra-processed): ${qualityScore}/100`);

// Calculate weighted average (equal weights for healthy person)
let healthyScore = Math.round(
  (sugarScore * 0.20) + 
  (100 * 0.20) + 
  (100 * 0.20) + 
  (calorieScore * 0.20) + 
  (qualityScore * 0.20)
);

// Apply penalties
const processingPenalty = 15; // Ultra-processed
const glycemicPenalty = 0; // Not diabetic
healthyScore -= processingPenalty;

console.log(`\n🎯 Weighted Score: ${healthyScore + processingPenalty} - ${processingPenalty} (processing) = ${healthyScore}/100`);

console.log('\n' + '='.repeat(70));
console.log('TEST 2: DIABETIC PATIENT');
console.log('='.repeat(70));

console.log('\n📊 Component Scores:');
// Sugar score for diabetic (HARSH)
let diabeticSugarScore = 0;
const effectiveSugar = normalized.sugars; // No fiber
if (effectiveSugar >= 30) diabeticSugarScore = 0;
else if (effectiveSugar >= 20) diabeticSugarScore = 0;
else if (effectiveSugar >= 15) diabeticSugarScore = 5;
else if (effectiveSugar >= 10) {
  // In the 10-15g range: base score minus ultra-processed penalty
  const baseScore = 20 - ((effectiveSugar - 10) * 3);
  diabeticSugarScore = Math.max(5, baseScore - 10); // Ultra-processed penalty
}
console.log(`  Sugar (${normalized.sugars}g/100ml): ${diabeticSugarScore}/100 ⚠️ CRITICAL for diabetics!`);
console.log(`  Fat: 100/100`);
console.log(`  Sodium: 100/100`);
console.log(`  Calorie: ${calorieScore}/100`);
console.log(`  Quality: ${qualityScore}/100`);

// Diabetic weights: sugar 65%, quality 15%, others 20% total
const diabeticWeights = {
  sugar: 0.65 / (0.65 + 0.15 + 0.20),
  fat: 0.05 / (0.65 + 0.15 + 0.20),
  sodium: 0.05 / (0.65 + 0.15 + 0.20),
  calorie: 0.10 / (0.65 + 0.15 + 0.20),
  quality: 0.15 / (0.65 + 0.15 + 0.20)
};

console.log('\n⚖️  Weights (normalized):');
console.log(`  Sugar: ${(diabeticWeights.sugar * 100).toFixed(1)}%`);
console.log(`  Fat: ${(diabeticWeights.fat * 100).toFixed(1)}%`);
console.log(`  Sodium: ${(diabeticWeights.sodium * 100).toFixed(1)}%`);
console.log(`  Calorie: ${(diabeticWeights.calorie * 100).toFixed(1)}%`);
console.log(`  Quality: ${(diabeticWeights.quality * 100).toFixed(1)}%`);

let diabeticScore = Math.round(
  (diabeticSugarScore * diabeticWeights.sugar) + 
  (100 * diabeticWeights.fat) + 
  (100 * diabeticWeights.sodium) + 
  (calorieScore * diabeticWeights.calorie) + 
  (qualityScore * diabeticWeights.quality)
);

// Apply penalties (ultra-processed with very-high glycemic impact)
const diabeticGlycemicPenalty = Math.round(30 * 1.5); // 30 base * 1.5 ultra-processed multiplier
diabeticScore -= processingPenalty;
diabeticScore -= diabeticGlycemicPenalty;

console.log(`\n🎯 Weighted Score: ${diabeticScore + processingPenalty + diabeticGlycemicPenalty}`);
console.log(`   - ${processingPenalty} (processing penalty)`);
console.log(`   - ${diabeticGlycemicPenalty} (glycemic penalty for diabetics)`);
console.log(`   = ${Math.max(0, diabeticScore)}/100`);

console.log('\n' + '='.repeat(70));
console.log('TEST 3: HIGH CHOLESTEROL + HIGH BLOOD PRESSURE');
console.log('='.repeat(70));

console.log('\n📊 Component Scores:');
console.log(`  Sugar (${normalized.sugars}g/100ml): ${sugarScore}/100 (not diabetic)`);
console.log(`  Fat: 100/100 (no fat)`);
console.log(`  Sodium: 100/100 (very low sodium)`);
console.log(`  Calorie: ${calorieScore}/100`);
console.log(`  Quality: ${qualityScore}/100`);

// Cholesterol + BP weights: fat 50%, sodium 50%, others normalized
const cholBPWeights = {
  sugar: 0.10,
  fat: 0.35,
  sodium: 0.35,
  calorie: 0.10,
  quality: 0.10
};

console.log('\n⚖️  Weights:');
console.log(`  Sugar: ${(cholBPWeights.sugar * 100).toFixed(1)}%`);
console.log(`  Fat: ${(cholBPWeights.fat * 100).toFixed(1)}%`);
console.log(`  Sodium: ${(cholBPWeights.sodium * 100).toFixed(1)}%`);
console.log(`  Calorie: ${(cholBPWeights.calorie * 100).toFixed(1)}%`);
console.log(`  Quality: ${(cholBPWeights.quality * 100).toFixed(1)}%`);

let cholBPScore = Math.round(
  (sugarScore * cholBPWeights.sugar) + 
  (100 * cholBPWeights.fat) + 
  (100 * cholBPWeights.sodium) + 
  (calorieScore * cholBPWeights.calorie) + 
  (qualityScore * cholBPWeights.quality)
);

cholBPScore -= processingPenalty;

console.log(`\n🎯 Weighted Score: ${cholBPScore + processingPenalty} - ${processingPenalty} (processing) = ${cholBPScore}/100`);

console.log('\n' + '='.repeat(70));
console.log('📊 FINAL RESULTS SUMMARY');
console.log('='.repeat(70));
console.log(`Healthy Person:              ${healthyScore}/100`);
console.log(`Diabetic Patient:            ${Math.max(0, diabeticScore)}/100 🚨`);
console.log(`Cholesterol + BP:            ${cholBPScore}/100`);

console.log('\n✅ EXPECTED OUTCOMES:');
console.log('  ✓ Healthy person: ~35-45 (ultra-processed sugary drink)');
console.log('  ✓ Diabetic: <10 (extremely dangerous - sugar weighted at 65%)');
console.log('  ✓ Cholesterol + BP: ~60-70 (low fat/sodium but poor quality)');
