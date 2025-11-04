// Test Coca-Cola scoring across different health profiles
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
let authToken = '';
let userId = '';

// Simulated Coca-Cola nutrition data (normalized to per 100ml)
const cokeData = {
  calories: 42,        // 42 kcal per 100ml
  totalFat: 0,
  saturatedFat: 0,
  transFat: 0,
  cholesterol: 0,
  sodium: 11,          // 11mg per 100ml (very low)
  carbohydrates: 10.6, // 10.6g per 100ml
  dietaryFiber: 0,
  sugars: 10.6,        // 10.6g per 100ml (VERY HIGH for a beverage)
  protein: 0,
  servingSize: '100 ml'
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

async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@test.com',
      password: 'test123'
    });
    authToken = response.data.token;
    userId = response.data.userId;
    console.log('✅ Logged in successfully\n');
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function updateHealthProfile(profile) {
  try {
    await axios.put(
      `${API_BASE}/user/health`,
      profile,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Health profile updated:', profile);
  } catch (error) {
    console.error('❌ Failed to update profile:', error.response?.data || error.message);
  }
}

async function testScoring(profileName, healthData) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TEST: ${profileName}`);
  console.log('='.repeat(60));
  
  // Update health profile
  await updateHealthProfile(healthData);
  
  // Calculate score
  try {
    // For testing, we'll manually call the enhanced scoring
    // In production, this would be done via the scan endpoint
    const EnhancedScoringService = require('./src/services/enhanced-scoring.service').default;
    const { AppDataSource } = require('./src/config/database');
    const { User } = require('./src/entities/User.entity');
    
    // Initialize database if needed
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    // Get user
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    
    // Prepare enhanced data
    const enhancedData = {
      ...cokeData,
      foodContext: cokeContext
    };
    
    // Calculate score
    const score = EnhancedScoringService.calculateEnhancedScore(enhancedData, user);
    
    console.log('\n📊 RESULTS:');
    console.log(`Overall Score: ${score.overallScore}/100 (${score.category})`);
    console.log('\n📈 Breakdown:');
    console.log(`  Sugar:   ${score.breakdown.sugarScore}/100`);
    console.log(`  Fat:     ${score.breakdown.fatScore}/100`);
    console.log(`  Sodium:  ${score.breakdown.sodiumScore}/100`);
    console.log(`  Calorie: ${score.breakdown.calorieScore}/100`);
    console.log(`  Quality: ${score.breakdown.qualityScore}/100`);
    
    console.log('\n⚖️  Adjustments:');
    console.log(`  Sugar Type Bonus:     +${score.adjustments.sugarTypeBonus}`);
    console.log(`  Fat Type Bonus:       +${score.adjustments.fatTypeBonus}`);
    console.log(`  Processing Penalty:   -${score.adjustments.processingPenalty}`);
    console.log(`  Glycemic Penalty:     -${score.adjustments.glycemicPenalty}`);
    console.log(`  Cooking Penalty:      -${score.adjustments.cookingPenalty}`);
    
    if (score.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      score.warnings.forEach(w => console.log(`  ${w}`));
    }
    
    return score.overallScore;
  } catch (error) {
    console.error('❌ Scoring failed:', error.message);
    return null;
  }
}

async function runTests() {
  await login();
  
  const results = {};
  
  // Test 1: Healthy person
  results.healthy = await testScoring('Healthy Person (No Conditions)', {
    hasDiabetes: false,
    hasHighCholesterol: false,
    hasHighBloodPressure: false,
    weight: 70,
    height: 175
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Diabetic only
  results.diabetic = await testScoring('Diabetic Patient', {
    hasDiabetes: true,
    hasHighCholesterol: false,
    hasHighBloodPressure: false,
    weight: 70,
    height: 175
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: High cholesterol + high blood pressure
  results.cholesterolBP = await testScoring('High Cholesterol + High Blood Pressure', {
    hasDiabetes: false,
    hasHighCholesterol: true,
    hasHighBloodPressure: true,
    weight: 70,
    height: 175
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 4: All conditions
  results.allConditions = await testScoring('All Conditions (Diabetic + Cholesterol + BP)', {
    hasDiabetes: true,
    hasHighCholesterol: true,
    hasHighBloodPressure: true,
    weight: 70,
    height: 175
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY: Coca-Cola Scores Across Health Profiles');
  console.log('='.repeat(60));
  console.log(`Healthy Person:              ${results.healthy}/100`);
  console.log(`Diabetic Patient:            ${results.diabetic}/100`);
  console.log(`Cholesterol + BP:            ${results.cholesterolBP}/100`);
  console.log(`All Conditions:              ${results.allConditions}/100`);
  
  console.log('\n🎯 EXPECTED BEHAVIOR:');
  console.log('  - Healthy person: ~30-40 (ultra-processed sugary drink)');
  console.log('  - Diabetic: <20 (extremely dangerous for diabetes)');
  console.log('  - Cholesterol + BP: ~30-40 (not directly harmful but unhealthy)');
  console.log('  - All conditions: <15 (dangerous for diabetics, unhealthy overall)');
  
  process.exit(0);
}

runTests().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
