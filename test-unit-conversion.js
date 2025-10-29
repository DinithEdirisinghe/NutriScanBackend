const { AdvancedScoringService } = require('./dist/services/advancedScoring.service');

console.log('\n🧪 UNIT CONVERSION TEST\n');
console.log('='.repeat(70));

// Mock user
const user = {
  id: 1,
  ldl: 100,
  glucose: 93,
  height: 175,
  weight: 55,
  scoringMode: 'portion-aware'
};

// Test 1: Pepsi in milliliters
console.log('\n📦 TEST 1: Pepsi (266ml)');
const pepsiML = {
  servingSize: '266ml', // String with ml unit
  calories: 88,
  totalFat: 0,
  saturatedFat: 0,
  transFat: 0,
  cholesterol: 105,
  sodium: 166,
  totalCarbohydrates: 21.5,
  sugars: 21.5,
  dietaryFiber: 0,
  protein: 0,
};

const service = new AdvancedScoringService();
const result1 = service.calculateAdvancedScore(pepsiML, user);
console.log(`\n✅ Score: ${result1.score}/100`);

// Test 2: Yogurt in grams
console.log('\n\n📦 TEST 2: Yogurt (15g)');
const yogurtG = {
  servingSize: '15g', // String with g unit
  calories: 20,
  totalFat: 0.5,
  saturatedFat: 0.3,
  transFat: 0,
  cholesterol: 2,
  sodium: 15,
  totalCarbohydrates: 3.5,
  sugars: 2.5,
  dietaryFiber: 0,
  protein: 0.8,
};

const result2 = service.calculateAdvancedScore(yogurtG, user);
console.log(`\n✅ Score: ${result2.score}/100`);

// Test 3: Juice in fluid ounces
console.log('\n\n📦 TEST 3: Orange Juice (8 fl oz)');
const juiceFlOz = {
  servingSize: '8 fl oz', // String with fl oz unit
  calories: 110,
  totalFat: 0,
  saturatedFat: 0,
  transFat: 0,
  cholesterol: 0,
  sodium: 0,
  totalCarbohydrates: 26,
  sugars: 22,
  dietaryFiber: 0,
  protein: 2,
};

const result3 = service.calculateAdvancedScore(juiceFlOz, user);
console.log(`\n✅ Score: ${result3.score}/100`);

console.log('\n' + '='.repeat(70));
console.log('✅ Unit conversion test complete!\n');
