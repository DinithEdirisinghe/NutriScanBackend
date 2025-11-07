const OptimizedScoringService = require('./dist/services/optimized-scoring.service').default;

console.log('\n🍫 SNICKERS BAR COMPARISON TEST\n');
console.log('Testing with EXACT nutrition values from a real Snickers bar');
console.log('Compare this score with your mobile app scan!\n');
console.log('=' .repeat(80));

// EXACT nutrition data from Snickers bar (52.7g serving)
const snickersData = {
  calories: 250,
  totalFat: 12,
  saturatedFat: 4.5,
  transFat: 0,
  cholesterol: 5,
  sodium: 120,
  totalCarbohydrates: 33,
  dietaryFiber: 1,
  sugars: 27,
  protein: 4,
  servingSize: '1 bar (52.7g)',
  
  foodContext: {
    foodName: 'Snickers Chocolate Bar',
    confidence: 'high',
    category: 'dessert',
    processingLevel: 'ultra-processed',
    cookingMethod: 'none',
    sugarType: 'added',
    sugarSources: ['corn syrup', 'sugar', 'milk chocolate'],
    fatType: 'mixed',
    fatSources: ['milk fat', 'palm oil', 'peanuts'],
    carbType: 'refined',
    hasWholeGrains: false,
    isOrganic: false,
    hasFortification: false,
    hasPreservatives: true,
    hasArtificialSweeteners: false,
    glycemicImpact: 'very-high',
    glycemicReasoning: '27g added sugar with minimal fiber (1g), causes rapid blood sugar spike',
    overallQuality: 'poor',
    qualityReasoning: 'Ultra-processed candy bar with high sugar, moderate fat, minimal nutrients'
  }
};

console.log('\n📋 NUTRITION FACTS (from package):');
console.log('   Serving Size: 1 bar (52.7g)');
console.log('   Calories:     250');
console.log('   Total Fat:    12g');
console.log('   - Saturated:  4.5g');
console.log('   - Trans:      0g');
console.log('   Cholesterol:  5mg');
console.log('   Sodium:       120mg');
console.log('   Total Carbs:  33g');
console.log('   - Fiber:      1g');
console.log('   - Sugars:     27g');
console.log('   Protein:      4g\n');

console.log('🏷️  FOOD CLASSIFICATION:');
console.log('   Food Name:     Snickers Chocolate Bar');
console.log('   Category:      Dessert');
console.log('   Processing:    Ultra-processed');
console.log('   Sugar Type:    Added (corn syrup, sugar)');
console.log('   Fat Type:      Mixed (milk fat, palm oil, peanuts)');
console.log('   Quality:       Poor\n');

console.log('=' .repeat(80));
console.log('\n🧮 CALCULATING SCORE (NO USER PROFILE - HEALTHY BASELINE)...\n');

const scoringService = OptimizedScoringService;
const result = scoringService.calculateOptimizedScore(snickersData);

console.log('=' .repeat(80));
console.log('\n🏆 FINAL SCORE RESULTS:\n');
console.log('   Overall Score:      ' + result.overallScore + '/100');
console.log('   Category:           ' + result.category);
console.log('   NOVA Group:         ' + result.novaGroup + ' (Ultra-processed)');
console.log('');

console.log('📊 COMPONENT BREAKDOWN:');
console.log('   🍬 Sugar Score:          ' + result.breakdown.sugarScore + '/100');
console.log('   🧈 Saturated Fat Score:  ' + result.breakdown.saturatedFatScore + '/100');
console.log('   ⚠️  Trans Fat Score:      ' + result.breakdown.transFatScore + '/100');
console.log('   🧂 Sodium Score:         ' + result.breakdown.sodiumScore + '/100');
console.log('   🔥 Calorie Score:        ' + result.breakdown.calorieScore + '/100');
console.log('   💪 Protein Score:        ' + result.breakdown.proteinScore + '/100');
console.log('   🌾 Fiber Score:          ' + result.breakdown.fiberScore + '/100');
console.log('   💎 Micronutrient Score:  ' + result.breakdown.micronutrientScore + '/100');
console.log('');

console.log('⚖️  SMART WEIGHTS (NOVA-based):');
console.log('   Sugar:          ' + (result.smartWeights.sugar * 100).toFixed(0) + '%');
console.log('   Saturated Fat:  ' + (result.smartWeights.saturatedFat * 100).toFixed(0) + '%');
console.log('   Trans Fat:      ' + (result.smartWeights.transFat * 100).toFixed(0) + '%');
console.log('   Sodium:         ' + (result.smartWeights.sodium * 100).toFixed(0) + '%');
console.log('   Calorie:        ' + (result.smartWeights.calorie * 100).toFixed(0) + '%');
console.log('   Protein:        ' + (result.smartWeights.protein * 100).toFixed(0) + '%');
console.log('   Fiber:          ' + (result.smartWeights.fiber * 100).toFixed(0) + '%');
console.log('   Micronutrient:  ' + (result.smartWeights.micronutrient * 100).toFixed(0) + '%');
console.log('');

console.log('💡 AI INSIGHTS:');
result.aiInsights.forEach(insight => console.log('   • ' + insight));
console.log('');

if (result.warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  result.warnings.forEach(warning => console.log('   ⚠️  ' + warning));
  console.log('');
}

if (result.recommendations.length > 0) {
  console.log('✅ RECOMMENDATIONS:');
  result.recommendations.forEach(rec => console.log('   ✅ ' + rec));
  console.log('');
}

console.log('=' .repeat(80));
console.log('\n📱 NOW SCAN A SNICKERS BAR WITH YOUR MOBILE APP!\n');
console.log('Expected score range: 15-25/100');
console.log('Make sure your user profile is set to:');
console.log('   ✅ Healthy (no diabetes, cholesterol, blood pressure issues)');
console.log('   ✅ Normal BMI');
console.log('');
console.log('If the mobile score matches ' + result.overallScore + '/100, the formula is working correctly!');
console.log('If it\'s very different, there might be:');
console.log('   1. User health condition multipliers active');
console.log('   2. AI extracting different nutrition values');
console.log('   3. Different serving size normalization');
console.log('');
console.log('Check your backend console logs to see the extracted values!\n');
