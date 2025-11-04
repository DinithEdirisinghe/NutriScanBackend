/**
 * DIABETES SCORING VERIFICATION TEST - NEW FOOD SET
 * 
 * This test uses a completely different set of 20 foods to verify
 * the accuracy of our simplified scoring formula for diabetic patients.
 * 
 * Test includes: breakfast items, lunch/dinner, snacks, and beverages
 */

// ============================================================================
// MOCK USER ENTITY (Simplified Version)
// ============================================================================

class User {
  constructor(data) {
    this.id = data.id || 1;
    this.email = data.email || 'test@example.com';
    this.name = data.name || 'Test User';
    this.height = data.height || 175; // cm
    this.weight = data.weight || 70; // kg
    this.hasDiabetes = data.hasDiabetes || false;
    this.hasHighCholesterol = data.hasHighCholesterol || false;
    this.hasHighBloodPressure = data.hasHighBloodPressure || false;
  }

  get bmi() {
    const heightInMeters = this.height / 100;
    return this.weight / (heightInMeters * heightInMeters);
  }

  get bmiCategory() {
    const bmi = this.bmi;
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  get isHealthy() {
    return !this.hasDiabetes && 
           !this.hasHighCholesterol && 
           !this.hasHighBloodPressure && 
           this.bmiCategory === 'normal';
  }
}

// ============================================================================
// MOCK SCORING SERVICE (Simplified Version)
// ============================================================================

class ScoringService {
  constructor() {}

  /**
   * Calculate dynamic weights based on user's health conditions
   */
  calculateWeights(user) {
    const weights = {
      sugar: 0.25,
      fat: 0.25,
      sodium: 0.25,
      calorie: 0.25,
    };

    // Diabetes: Prioritize sugar control (55%)
    if (user.hasDiabetes) {
      weights.sugar = 0.55;
      weights.fat = 0.15;
      weights.sodium = 0.15;
      weights.calorie = 0.15;
    }

    // High cholesterol: Prioritize fat control (50%)
    if (user.hasHighCholesterol) {
      weights.fat = 0.50;
      weights.sugar = 0.20;
      weights.sodium = 0.15;
      weights.calorie = 0.15;
    }

    // High blood pressure: Prioritize sodium control (50%)
    if (user.hasHighBloodPressure) {
      weights.sodium = 0.50;
      weights.sugar = 0.20;
      weights.fat = 0.15;
      weights.calorie = 0.15;
    }

    // Normalize weights to sum to 1
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    Object.keys(weights).forEach(key => {
      weights[key] = weights[key] / total;
    });

    return weights;
  }

  /**
   * Score sugar content with granular thresholds for diabetics
   * Now includes fiber consideration
   */
  scoreSugar(sugars, fiber, isDiabetic) {
    if (sugars === undefined || sugars === null) {
      return 100; // Assume no sugar if not listed
    }

    // Fiber bonus: Reduces effective sugar impact (fiber slows absorption)
    const effectiveSugar = fiber && fiber > 0 ? Math.max(0, sugars - (fiber * 0.5)) : sugars;

    if (isDiabetic) {
      // Granular scoring for diabetics (6 tiers)
      if (effectiveSugar === 0) return 100;
      if (effectiveSugar <= 0.5) return 90;
      if (effectiveSugar <= 2) return 80;
      if (effectiveSugar <= 5) return 70 - ((effectiveSugar - 2) / 3) * 30; // 70-40
      if (effectiveSugar <= 10) return 40 - ((effectiveSugar - 5) / 5) * 30; // 40-10
      if (effectiveSugar <= 20) return 10 - ((effectiveSugar - 10) / 10) * 10; // 10-0
      return 0; // 20g+ = 0
    } else {
      // Standard scoring for non-diabetics
      if (effectiveSugar <= 5) return 100;
      if (effectiveSugar <= 15) return 100 - ((effectiveSugar - 5) / 10) * 30; // 100-70
      if (effectiveSugar <= 30) return 70 - ((effectiveSugar - 15) / 15) * 40; // 70-30
      return 30 - Math.min((effectiveSugar - 30) / 20 * 30, 30); // 30-0
    }
  }

  /**
   * Score fat content - distinguishes between good and bad fats
   */
  scoreFat(totalFat, saturatedFat, transFat, hasHighCholesterol) {
    let score = 100;

    // Trans fat penalty
    if (transFat && transFat > 0) {
      score -= 40;
    }

    // Saturated fat penalty
    if (saturatedFat) {
      if (hasHighCholesterol) {
        if (saturatedFat > 5) score -= 60;
        else if (saturatedFat > 2) score -= 40;
        else if (saturatedFat > 1) score -= 20;
      } else {
        if (saturatedFat > 8) score -= 50;
        else if (saturatedFat > 5) score -= 30;
        else if (saturatedFat > 3) score -= 15;
      }
    }

    // Unsaturated fat bonus (healthy fats)
    if (totalFat && saturatedFat) {
      const unsaturatedFat = totalFat - saturatedFat - (transFat || 0);
      if (unsaturatedFat > 10 && saturatedFat < 3) {
        score = Math.min(100, score + 10); // Bonus for healthy fats
      } else if (unsaturatedFat > 5 && saturatedFat < 2) {
        score = Math.min(100, score + 5);
      }
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Score sodium content
   */
  scoreSodium(sodium, hasHighBP) {
    if (sodium === undefined || sodium === null) {
      return 75;
    }

    if (hasHighBP) {
      // Strict scoring for high blood pressure
      if (sodium <= 100) return 100;
      if (sodium <= 300) return 100 - ((sodium - 100) / 200) * 30; // 100-70
      if (sodium <= 600) return 70 - ((sodium - 300) / 300) * 40; // 70-30
      return 30 - Math.min((sodium - 600) / 400 * 30, 30); // 30-0
    } else {
      // Standard scoring
      if (sodium <= 200) return 100;
      if (sodium <= 500) return 100 - ((sodium - 200) / 300) * 30; // 100-70
      if (sodium <= 1000) return 70 - ((sodium - 500) / 500) * 40; // 70-30
      return 30 - Math.min((sodium - 1000) / 500 * 30, 30); // 30-0
    }
  }

  /**
   * Score calorie content
   */
  scoreCalories(calories, bmi) {
    if (calories === undefined || calories === null) {
      return 75;
    }

    const isOverweight = bmi >= 25;

    if (isOverweight) {
      // Stricter for overweight
      if (calories <= 100) return 100;
      if (calories <= 250) return 100 - ((calories - 100) / 150) * 20; // 100-80
      if (calories <= 400) return 80 - ((calories - 250) / 150) * 30; // 80-50
      return 50 - Math.min((calories - 400) / 200 * 50, 50); // 50-0
    } else {
      // Standard scoring
      if (calories <= 150) return 100;
      if (calories <= 300) return 100 - ((calories - 150) / 150) * 20; // 100-80
      if (calories <= 500) return 80 - ((calories - 300) / 200) * 30; // 80-50
      return 50 - Math.min((calories - 500) / 300 * 50, 50); // 50-0
    }
  }

  /**
   * Calculate overall health score
   */
  calculateScore(nutrients, user) {
    const weights = this.calculateWeights(user);

    const scores = {
      sugar: this.scoreSugar(nutrients.sugar, nutrients.dietaryFiber, user.hasDiabetes),
      fat: this.scoreFat(nutrients.totalFat, nutrients.saturatedFat, nutrients.transFat, user.hasHighCholesterol),
      sodium: this.scoreSodium(nutrients.sodium, user.hasHighBloodPressure),
      calorie: this.scoreCalories(nutrients.calories, user.bmi),
    };

    let totalScore =
      scores.sugar * weights.sugar +
      scores.fat * weights.fat +
      scores.sodium * weights.sodium +
      scores.calorie * weights.calorie;

    // Apply glycemic penalty for diabetics
    const glycemicPenalty = this.calculateGlycemicPenalty(
      nutrients.totalCarbohydrates,
      nutrients.dietaryFiber,
      nutrients.sugar,
      user
    );

    totalScore = Math.max(0, totalScore - glycemicPenalty);

    return {
      totalScore: Math.round(totalScore),
      breakdown: {
        sugar: { score: Math.round(scores.sugar), weight: Math.round(weights.sugar * 100) },
        fat: { score: Math.round(scores.fat), weight: Math.round(weights.fat * 100) },
        sodium: { score: Math.round(scores.sodium), weight: Math.round(weights.sodium * 100) },
        calorie: { score: Math.round(scores.calorie), weight: Math.round(weights.calorie * 100) },
      },
      glycemicPenalty: Math.round(glycemicPenalty),
    };
  }

  /**
   * Calculate glycemic impact penalty for high-carb refined foods
   */
  calculateGlycemicPenalty(totalCarbs, fiber, sugars, user) {
    if (!user.hasDiabetes || !totalCarbs) return 0;

    const netCarbs = fiber ? totalCarbs - fiber : totalCarbs;
    const starchCarbs = sugars ? netCarbs - sugars : netCarbs;

    if (starchCarbs > 20 && (!fiber || fiber < 3)) {
      // High refined carbs (pasta, white rice, french fries, bagels)
      return Math.min(30, Math.round(starchCarbs * 0.8));
    } else if (starchCarbs > 15 && (!fiber || fiber < 2)) {
      // Moderate refined carbs
      return Math.min(20, Math.round(starchCarbs * 0.6));
    } else if (starchCarbs > 30 && fiber && fiber >= 5) {
      // High carbs but also high fiber - smaller penalty
      return Math.min(10, Math.round(starchCarbs * 0.2));
    }

    return 0;
  }
}

// ============================================================================
// TEST DATA - NEW FOOD SET (20 FOODS)
// ============================================================================

const testFoods = [
  // EXCELLENT FOR DIABETICS (Rank 1-5)
  {
    name: 'Salmon Fillet (6 oz)',
    nutrients: { 
      calories: 350, 
      sugar: 0, 
      totalFat: 22,
      saturatedFat: 3,
      transFat: 0,
      totalCarbohydrates: 0,
      dietaryFiber: 0,
      sodium: 90 
    },
    expectedRank: 1,
    reasoning: 'High protein, omega-3 fats, zero sugar, very diabetic-friendly'
  },
  {
    name: 'Spinach Salad (2 cups)',
    nutrients: { 
      calories: 20, 
      sugar: 0.8, 
      totalFat: 0.4,
      saturatedFat: 0.1,
      transFat: 0,
      totalCarbohydrates: 3.6,
      dietaryFiber: 2.2,
      sodium: 60 
    },
    expectedRank: 2,
    reasoning: 'Very low calorie, minimal sugar, nutrient-dense'
  },
  {
    name: 'Cauliflower Rice (1 cup)',
    nutrients: { 
      calories: 25, 
      sugar: 2, 
      totalFat: 0.3,
      saturatedFat: 0.1,
      transFat: 0,
      totalCarbohydrates: 5,
      dietaryFiber: 2,
      sodium: 30 
    },
    expectedRank: 3,
    reasoning: 'Low-carb rice alternative, minimal sugar'
  },
  {
    name: 'Avocado (half)',
    nutrients: { 
      calories: 120, 
      sugar: 0.5, 
      totalFat: 11,
      saturatedFat: 1.5,
      transFat: 0,
      totalCarbohydrates: 6,
      dietaryFiber: 5,
      sodium: 5 
    },
    expectedRank: 4,
    reasoning: 'Healthy fats, very low sugar, good for satiety'
  },
  {
    name: 'Cottage Cheese (1/2 cup)',
    nutrients: { 
      calories: 110, 
      sugar: 4, 
      totalFat: 5,
      saturatedFat: 3,
      transFat: 0,
      totalCarbohydrates: 6,
      dietaryFiber: 0,
      sodium: 450 
    },
    expectedRank: 5,
    reasoning: 'High protein, low sugar, though higher sodium'
  },

  // GOOD FOR DIABETICS (Rank 6-10)
  {
    name: 'Turkey Breast (4 oz)',
    nutrients: { 
      calories: 150, 
      sugar: 0, 
      totalFat: 2,
      saturatedFat: 0.6,
      transFat: 0,
      totalCarbohydrates: 0,
      dietaryFiber: 0,
      sodium: 65 
    },
    expectedRank: 6,
    reasoning: 'Lean protein, zero sugar, low fat'
  },
  {
    name: 'Strawberries (1 cup)',
    nutrients: { 
      calories: 50, 
      sugar: 7, 
      totalFat: 0.5,
      saturatedFat: 0,
      transFat: 0,
      totalCarbohydrates: 12,
      dietaryFiber: 3,
      sodium: 2 
    },
    expectedRank: 7,
    reasoning: 'Low sugar for fruit, high fiber slows absorption'
  },
  {
    name: 'Oatmeal (1/2 cup dry)',
    nutrients: { 
      calories: 150, 
      sugar: 1, 
      totalFat: 3,
      saturatedFat: 0.5,
      transFat: 0,
      totalCarbohydrates: 27,
      dietaryFiber: 4,
      sodium: 0 
    },
    expectedRank: 8,
    reasoning: 'Low sugar, but carbs can raise blood sugar moderately'
  },
  {
    name: 'Peanut Butter (2 tbsp)',
    nutrients: { 
      calories: 190, 
      sugar: 3, 
      totalFat: 16,
      saturatedFat: 3,
      transFat: 0,
      totalCarbohydrates: 8,
      dietaryFiber: 2,
      sodium: 140 
    },
    expectedRank: 9,
    reasoning: 'Low sugar, but high calories and fat'
  },
  {
    name: 'Sweet Potato (medium)',
    nutrients: { 
      calories: 100, 
      sugar: 5, 
      totalFat: 0.2,
      saturatedFat: 0,
      transFat: 0,
      totalCarbohydrates: 24,
      dietaryFiber: 4,
      sodium: 70 
    },
    expectedRank: 10,
    reasoning: 'Some natural sugar, moderate glycemic index'
  },

  // MODERATE FOR DIABETICS (Rank 11-15)
  {
    name: 'Pasta (1 cup cooked)',
    nutrients: { 
      calories: 220, 
      sugar: 1, 
      totalFat: 1.3,
      saturatedFat: 0.2,
      transFat: 0,
      totalCarbohydrates: 43,
      dietaryFiber: 2.5,
      sodium: 2 
    },
    expectedRank: 11,
    reasoning: 'Low sugar but high refined carbs, raises blood sugar'
  },
  {
    name: 'Mango (1 cup)',
    nutrients: { 
      calories: 100, 
      sugar: 23, 
      totalFat: 0.6,
      saturatedFat: 0.1,
      transFat: 0,
      totalCarbohydrates: 25,
      dietaryFiber: 2.6,
      sodium: 2 
    },
    expectedRank: 12,
    reasoning: 'High natural sugar, even with fiber'
  },
  {
    name: 'Granola Bar',
    nutrients: { 
      calories: 140, 
      sugar: 7, 
      totalFat: 5,
      saturatedFat: 1,
      transFat: 0,
      totalCarbohydrates: 20,
      dietaryFiber: 2,
      sodium: 95 
    },
    expectedRank: 13,
    reasoning: 'Moderate sugar, some added sugars'
  },
  {
    name: 'French Fries (small)',
    nutrients: { 
      calories: 230, 
      sugar: 0, 
      totalFat: 11,
      saturatedFat: 2,
      transFat: 0,
      totalCarbohydrates: 29,
      dietaryFiber: 2,
      sodium: 160 
    },
    expectedRank: 14,
    reasoning: 'High glycemic despite low sugar, fried in oil'
  },
  {
    name: 'Bagel (plain)',
    nutrients: { 
      calories: 280, 
      sugar: 5, 
      totalFat: 1.5,
      saturatedFat: 0.3,
      transFat: 0,
      totalCarbohydrates: 55,
      dietaryFiber: 2,
      sodium: 430 
    },
    expectedRank: 15,
    reasoning: 'Refined carbs, moderate calories and sugar'
  },

  // POOR FOR DIABETICS (Rank 16-20)
  {
    name: 'Flavored Yogurt (6 oz)',
    nutrients: { 
      calories: 150, 
      sugar: 26, 
      totalFat: 2,
      saturatedFat: 1,
      transFat: 0,
      totalCarbohydrates: 30,
      dietaryFiber: 0,
      sodium: 75 
    },
    expectedRank: 16,
    reasoning: 'Very high added sugar despite being yogurt'
  },
  {
    name: 'BBQ Sauce (2 tbsp)',
    nutrients: { 
      calories: 60, 
      sugar: 13, 
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      totalCarbohydrates: 15,
      dietaryFiber: 0,
      sodium: 360 
    },
    expectedRank: 17,
    reasoning: 'High sugar and sodium, mostly corn syrup'
  },
  {
    name: 'Ice Cream (1/2 cup)',
    nutrients: { 
      calories: 210, 
      sugar: 21, 
      totalFat: 11,
      saturatedFat: 7,
      transFat: 0,
      totalCarbohydrates: 24,
      dietaryFiber: 0,
      sodium: 50 
    },
    expectedRank: 18,
    reasoning: 'High sugar and fat combo, rapid blood sugar spike'
  },
  {
    name: 'Energy Drink (16 oz)',
    nutrients: { 
      calories: 220, 
      sugar: 54, 
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      totalCarbohydrates: 56,
      dietaryFiber: 0,
      sodium: 370 
    },
    expectedRank: 19,
    reasoning: 'Massive sugar content, liquid form absorbs fast'
  },
  {
    name: 'Cinnamon Roll (large)',
    nutrients: { 
      calories: 880, 
      sugar: 58, 
      totalFat: 37,
      saturatedFat: 16,
      transFat: 0,
      totalCarbohydrates: 120,
      dietaryFiber: 2,
      sodium: 820 
    },
    expectedRank: 20,
    reasoning: 'Extreme sugar, calories, and fat - worst for diabetics'
  },
];

// ============================================================================
// TEST EXECUTION
// ============================================================================

function runTest() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   DIABETES VERIFICATION TEST - NEW FOOD SET (20 ITEMS)        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Create test patient (diabetic)
  const testPatient = new User({
    id: 1,
    email: 'diabetic@test.com',
    name: 'Diabetic Patient',
    height: 175,
    weight: 70,
    hasDiabetes: true,
    hasHighCholesterol: false,
    hasHighBloodPressure: false,
  });

  const scoringService = new ScoringService();
  const weights = scoringService.calculateWeights(testPatient);

  console.log(`👤 Test Patient: Diabetic with BMI ${testPatient.bmi.toFixed(1)} (${testPatient.bmiCategory})`);
  console.log(`⚖️  Weights: Sugar ${Math.round(weights.sugar * 100)}%, Fat ${Math.round(weights.fat * 100)}%, Sodium ${Math.round(weights.sodium * 100)}%, Calories ${Math.round(weights.calorie * 100)}%`);
  console.log('\n════════════════════════════════════════════════════════════════\n');

  // Calculate scores for all foods
  const results = testFoods.map(food => {
    const result = scoringService.calculateScore(food.nutrients, testPatient);
    return {
      ...food,
      calculatedScore: result.totalScore,
      sugarScore: result.breakdown.sugar.score,
      fatScore: result.breakdown.fat.score,
      glycemicPenalty: result.glycemicPenalty || 0,
    };
  });

  // Sort by calculated score (descending)
  const sortedResults = [...results].sort((a, b) => b.calculatedScore - a.calculatedScore);

  // Print expected ranking
  console.log('📊 EXPECTED RANKING (Common Sense for Diabetics):');
  console.log('────────────────────────────────────────────────────────────────\n');
  
  const sortedByExpected = [...results].sort((a, b) => a.expectedRank - b.expectedRank);
  sortedByExpected.forEach(food => {
    const emoji = food.expectedRank <= 5 ? '✅' : food.expectedRank <= 10 ? '🟢' : food.expectedRank <= 15 ? '⚠️' : '🚨';
    console.log(`${emoji} #${food.expectedRank.toString().padStart(2)} - ${food.name.padEnd(35)} (Sugar: ${food.nutrients.sugar}g)`);
    console.log(`      ${food.reasoning}`);
  });

  console.log('\n════════════════════════════════════════════════════════════════\n');

  // Print calculated ranking
  console.log('🤖 CALCULATED RANKING (Using Simplified Formula):');
  console.log('────────────────────────────────────────────────────────────────\n');

  sortedResults.forEach((food, index) => {
    const calculatedRank = index + 1;
    const rankDiff = Math.abs(calculatedRank - food.expectedRank);
    const matchEmoji = rankDiff === 0 ? '🎯' : rankDiff <= 2 ? '✅' : rankDiff <= 4 ? '⚠️' : '❌';
    const scoreEmoji = food.calculatedScore >= 80 ? '🟢' : food.calculatedScore >= 60 ? '🟡' : food.calculatedScore >= 40 ? '🟠' : '🔴';
    
    console.log(`${matchEmoji} #${calculatedRank.toString().padStart(2)} ${scoreEmoji} ${food.calculatedScore}/100 - ${food.name}`);
    console.log(`      Expected: #${food.expectedRank} | Difference: ${rankDiff} ranks`);
    console.log(`      Sugar: ${food.sugarScore}/100, Fat: ${food.fatScore}/100`);
    if (food.glycemicPenalty > 0) {
      console.log(`      ⚠️ Glycemic Penalty: -${food.glycemicPenalty} points (refined carbs)`);
    }
  });

  console.log('\n════════════════════════════════════════════════════════════════\n');

  // Calculate accuracy metrics
  let perfectMatches = 0;
  let within2Ranks = 0;
  let within4Ranks = 0;
  let totalRankError = 0;

  sortedResults.forEach((food, index) => {
    const calculatedRank = index + 1;
    const rankDiff = Math.abs(calculatedRank - food.expectedRank);
    
    totalRankError += rankDiff;
    if (rankDiff === 0) perfectMatches++;
    if (rankDiff <= 2) within2Ranks++;
    if (rankDiff <= 4) within4Ranks++;
  });

  const avgError = (totalRankError / testFoods.length).toFixed(2);
  const accuracy = ((within2Ranks / testFoods.length) * 100).toFixed(1);

  console.log('📈 ACCURACY ANALYSIS:');
  console.log('────────────────────────────────────────────────────────────────\n');
  console.log(`Total Foods Tested: ${testFoods.length}\n`);
  console.log(`🎯 Perfect Matches (Rank Difference = 0): ${perfectMatches} (${((perfectMatches / testFoods.length) * 100).toFixed(1)}%)`);
  console.log(`✅ Within 2 Ranks: ${within2Ranks} (${accuracy}%)`);
  console.log(`⚠️  Within 4 Ranks: ${within4Ranks} (${((within4Ranks / testFoods.length) * 100).toFixed(1)}%)`);
  console.log(`📊 Average Rank Error: ${avgError} positions\n`);

  const accuracyScore = parseFloat(accuracy);
  let verdict = '';
  if (accuracyScore >= 90) {
    verdict = '✅ OUTSTANDING - Formula is extremely accurate!';
  } else if (accuracyScore >= 80) {
    verdict = '✅ EXCELLENT - Formula is highly accurate!';
  } else if (accuracyScore >= 70) {
    verdict = '✅ GOOD - Formula works well with minor issues.';
  } else if (accuracyScore >= 60) {
    verdict = '⚠️  FAIR - Formula needs some tuning.';
  } else {
    verdict = '❌ POOR - Formula needs significant improvement.';
  }

  console.log(`🏆 OVERALL ACCURACY: ${accuracy}%`);
  console.log(`   ${verdict}\n`);

  console.log('════════════════════════════════════════════════════════════════\n');

  // Show biggest mismatches
  console.log('🔍 KEY INSIGHTS:');
  console.log('────────────────────────────────────────────────────────────────\n');

  const mismatches = sortedResults
    .map((food, index) => ({
      food,
      calculatedRank: index + 1,
      rankDiff: Math.abs((index + 1) - food.expectedRank),
    }))
    .filter(item => item.rankDiff > 2)
    .sort((a, b) => b.rankDiff - a.rankDiff)
    .slice(0, 5);

  if (mismatches.length > 0) {
    console.log('⚠️  Biggest Mismatches:');
    mismatches.forEach(item => {
      console.log(`   • ${item.food.name}: Expected #${item.food.expectedRank}, Got #${item.calculatedRank} (${item.rankDiff} ranks off)`);
      console.log(`     Reason: Score ${item.food.calculatedScore}/100 (Sugar: ${item.food.nutrients.sugar}g)`);
    });
  } else {
    console.log('✅ No significant mismatches! All foods ranked within 2 positions.');
  }

  console.log('\n════════════════════════════════════════════════════════════════\n');

  if (accuracyScore >= 80) {
    console.log('✅ VERDICT: The simplified formula is VERIFIED and works great!');
  } else if (accuracyScore >= 70) {
    console.log('✅ VERDICT: Formula is solid, minor improvements possible.');
  } else {
    console.log('⚠️  VERDICT: Formula needs refinement for better accuracy.');
  }

  console.log('\n════════════════════════════════════════════════════════════════\n');
}

// Run the test
runTest();
