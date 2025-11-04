// CHOLESTEROL TEST - Normal Person vs High Cholesterol Patient
// 6 Fast Food Items - Testing fat scoring accuracy

class User {
  constructor(data) {
    this.id = data.id || 1;
    this.height = data.height || 175;
    this.weight = data.weight || 70;
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

class EnhancedScoringService {
  
  calculateWeights(user) {
    if (!user || user.isHealthy) {
      return { sugar: 0.20, fat: 0.20, sodium: 0.20, calorie: 0.20, quality: 0.20 };
    }

    const weights = { sugar: 0.20, fat: 0.20, sodium: 0.20, calorie: 0.20, quality: 0.20 };

    if (user.hasDiabetes) weights.sugar = 0.40;
    if (user.hasHighCholesterol) weights.fat = 0.35;
    if (user.hasHighBloodPressure) weights.sodium = 0.35;
    
    if (user.bmiCategory === 'obese') weights.calorie = 0.35;
    else if (user.bmiCategory === 'overweight') weights.calorie = 0.30;

    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    return {
      sugar: weights.sugar / sum,
      fat: weights.fat / sum,
      sodium: weights.sodium / sum,
      calorie: weights.calorie / sum,
      quality: weights.quality / sum,
    };
  }

  scoreSugarEnhanced(sugars, fiber, context, user) {
    if (!sugars || sugars === 0) return 100;

    const effectiveSugar = fiber && fiber > 0 ? Math.max(0, sugars - (fiber * 0.5)) : sugars;
    let score = 100;

    if (user?.hasDiabetes) {
      const isNaturalSugar = context && context.sugarType === 'natural';
      
      if (isNaturalSugar && effectiveSugar <= 15) {
        score = Math.max(40, 100 - (effectiveSugar * 4));
      } else if (effectiveSugar >= 30) {
        score = 0;
      } else if (effectiveSugar >= 20) {
        score = Math.max(0, 10 - ((effectiveSugar - 20) * 1));
      } else if (effectiveSugar >= 10) {
        score = Math.max(10, 40 - ((effectiveSugar - 10) * 3));
      } else if (effectiveSugar >= 5) {
        score = Math.max(40, 70 - ((effectiveSugar - 5) * 6));
      } else if (effectiveSugar >= 2) {
        score = 80;
      } else if (effectiveSugar >= 0.5) {
        score = 90;
      }
    } else {
      if (effectiveSugar > 40) score = 10;
      else if (effectiveSugar > 25) score = 30;
      else if (effectiveSugar > 15) score = 50;
      else if (effectiveSugar > 8) score = 75;
      else if (effectiveSugar > 3) score = 90;
    }

    return Math.round(score);
  }

  scoreFatEnhanced(totalFat, saturatedFat, transFat, context, user) {
    let score = 100;

    if (transFat && transFat > 0) score -= 40;

    const isHealthyFat = context && context.fatType === 'healthy-unsaturated';
    if (isHealthyFat) score = Math.min(100, score + 10);

    if (saturatedFat) {
      if (user?.hasHighCholesterol) {
        // Very strict for high cholesterol patients
        if (saturatedFat > 5) score -= 60;
        else if (saturatedFat > 2) score -= 40;
        else if (saturatedFat > 1) score -= 20;
      } else {
        // Normal person - more lenient
        if (saturatedFat > 8) score -= 50;
        else if (saturatedFat > 5) score -= 30;
        else if (saturatedFat > 3) score -= 15;
      }
    }

    return Math.max(0, Math.round(score));
  }

  scoreSodium(sodium, user) {
    if (!sodium) return 75;

    let score = 100;
    if (user?.hasHighBloodPressure) {
      if (sodium > 300) score = Math.max(0, 100 - ((sodium - 300) / 10));
      else if (sodium > 200) score = 70;
    } else {
      if (sodium > 600) score = 20;
      else if (sodium > 400) score = 50;
      else if (sodium > 200) score = 75;
    }
    return Math.round(score);
  }

  scoreCalories(calories, user) {
    if (!calories) return 75;

    let score = 100;
    const bmiCategory = user?.bmiCategory;

    if (bmiCategory === 'obese') {
      if (calories > 250) score = Math.max(0, 100 - ((calories - 250) / 5));
      else if (calories > 150) score = 70;
    } else if (bmiCategory === 'overweight') {
      if (calories > 350) score = Math.max(20, 100 - ((calories - 350) / 8));
      else if (calories > 250) score = 70;
    } else {
      if (calories > 600) score = 30;
      else if (calories > 400) score = 60;
      else if (calories > 250) score = 80;
    }
    return Math.round(score);
  }

  scoreQuality(context) {
    if (!context) return 75;
    
    let score = 100;

    switch (context.processingLevel) {
      case 'whole': score = 100; break;
      case 'minimally-processed': score = 90; break;
      case 'processed': score = 70; break;
      case 'ultra-processed': score = 40; break;
    }

    if (context.cookingMethod === 'fried') score -= 20;
    if (context.hasWholeGrains) score = Math.min(100, score + 10);
    if (context.hasPreservatives) score -= 5;

    return Math.max(0, Math.round(score));
  }

  calculateAdjustments(context, user) {
    if (!context) return {
      sugarTypeBonus: 0,
      fatTypeBonus: 0,
      processingPenalty: 0,
      glycemicPenalty: 0,
      cookingPenalty: 0,
    };
    
    const adjustments = {
      sugarTypeBonus: 0,
      fatTypeBonus: 0,
      processingPenalty: 0,
      glycemicPenalty: 0,
      cookingPenalty: 0,
    };

    if (context.sugarType === 'natural') adjustments.sugarTypeBonus = 5;
    if (context.fatType === 'healthy-unsaturated') adjustments.fatTypeBonus = 5;
    
    if (context.processingLevel === 'ultra-processed') adjustments.processingPenalty = 15;
    else if (context.processingLevel === 'processed') adjustments.processingPenalty = 5;

    if (user?.hasDiabetes) {
      switch (context.glycemicImpact) {
        case 'very-high': adjustments.glycemicPenalty = 25; break;
        case 'high': adjustments.glycemicPenalty = 15; break;
        case 'medium': adjustments.glycemicPenalty = 5; break;
      }
    }

    if (context.cookingMethod === 'fried') adjustments.cookingPenalty = 10;

    return adjustments;
  }

  calculateEnhancedScore(data, user) {
    const weights = this.calculateWeights(user);
    const foodContext = data.foodContext || {};

    const sugarScore = this.scoreSugarEnhanced(data.sugars, data.dietaryFiber, foodContext, user);
    const fatScore = this.scoreFatEnhanced(data.totalFat, data.saturatedFat, data.transFat, foodContext, user);
    const sodiumScore = this.scoreSodium(data.sodium, user);
    const calorieScore = this.scoreCalories(data.calories, user);
    const qualityScore = this.scoreQuality(foodContext);

    const adjustments = this.calculateAdjustments(foodContext, user);

    let overallScore = Math.round(
      (sugarScore * weights.sugar) +
      (fatScore * weights.fat) +
      (sodiumScore * weights.sodium) +
      (calorieScore * weights.calorie) +
      (qualityScore * weights.quality)
    );

    overallScore += adjustments.sugarTypeBonus;
    overallScore += adjustments.fatTypeBonus;
    overallScore -= adjustments.processingPenalty;
    overallScore -= adjustments.glycemicPenalty;
    overallScore -= adjustments.cookingPenalty;

    overallScore = Math.max(0, Math.min(100, overallScore));

    return {
      totalScore: overallScore,
      breakdown: {
        sugar: sugarScore,
        fat: fatScore,
        sodium: sodiumScore,
        calorie: calorieScore,
        quality: qualityScore,
      },
      adjustments,
    };
  }
}

// Test data - 6 fast food items
const testFoods = [
  {
    name: 'Grilled Chicken Salad (Light Vinaigrette)',
    nutrients: { 
      calories: 280, 
      sugars: 8, 
      totalFat: 12,
      saturatedFat: 2.5,
      transFat: 0,
      totalCarbohydrates: 18,
      dietaryFiber: 4,
      sodium: 680 
    },
    foodContext: { 
      category: 'salad', 
      processingLevel: 'minimally-processed', 
      cookingMethod: 'grilled', 
      sugarType: 'mixed',
      fatType: 'mixed',
      carbType: 'complex', 
      hasWholeGrains: false, 
      hasPreservatives: false, 
      glycemicImpact: 'low', 
      overallQuality: 'good' 
    },
    expectedRankNormal: 1,
    expectedRankCholesterol: 1,
    reasoning: 'Grilled chicken, vegetables, low saturated fat - best for both'
  },
  {
    name: 'Grilled Chicken Sandwich',
    nutrients: { 
      calories: 420, 
      sugars: 7, 
      totalFat: 16,
      saturatedFat: 3.5,
      transFat: 0,
      totalCarbohydrates: 42,
      dietaryFiber: 3,
      sodium: 990 
    },
    foodContext: { 
      category: 'sandwich', 
      processingLevel: 'processed', 
      cookingMethod: 'grilled', 
      sugarType: 'added',
      fatType: 'mixed',
      carbType: 'refined', 
      hasWholeGrains: false, 
      hasPreservatives: true, 
      glycemicImpact: 'medium', 
      overallQuality: 'fair' 
    },
    expectedRankNormal: 2,
    expectedRankCholesterol: 2,
    reasoning: 'Grilled chicken is good, but processed bun and higher sodium'
  },
  {
    name: 'Basic Hamburger',
    nutrients: { 
      calories: 540, 
      sugars: 8, 
      totalFat: 26,
      saturatedFat: 10,
      transFat: 0.5,
      totalCarbohydrates: 45,
      dietaryFiber: 2,
      sodium: 960 
    },
    foodContext: { 
      category: 'fast-food', 
      processingLevel: 'processed', 
      cookingMethod: 'grilled', 
      sugarType: 'added',
      fatType: 'saturated',
      carbType: 'refined', 
      hasWholeGrains: false, 
      hasPreservatives: true, 
      glycemicImpact: 'medium', 
      overallQuality: 'fair' 
    },
    expectedRankNormal: 3,
    expectedRankCholesterol: 4,
    reasoning: '10g saturated fat - OK for normal, worse for cholesterol'
  },
  {
    name: 'Double Cheeseburger',
    nutrients: { 
      calories: 740, 
      sugars: 9, 
      totalFat: 42,
      saturatedFat: 20,
      transFat: 1.5,
      totalCarbohydrates: 47,
      dietaryFiber: 2,
      sodium: 1360 
    },
    foodContext: { 
      category: 'fast-food', 
      processingLevel: 'processed', 
      cookingMethod: 'grilled', 
      sugarType: 'added',
      fatType: 'saturated',
      carbType: 'refined', 
      hasWholeGrains: false, 
      hasPreservatives: true, 
      glycemicImpact: 'medium', 
      overallQuality: 'poor' 
    },
    expectedRankNormal: 4,
    expectedRankCholesterol: 5,
    reasoning: '20g saturated fat + trans fat - terrible for cholesterol'
  },
  {
    name: 'French Fries (Large)',
    nutrients: { 
      calories: 510, 
      sugars: 0, 
      totalFat: 24,
      saturatedFat: 3.5,
      transFat: 0,
      totalCarbohydrates: 66,
      dietaryFiber: 6,
      sodium: 350 
    },
    foodContext: { 
      category: 'fast-food', 
      processingLevel: 'processed', 
      cookingMethod: 'fried', 
      sugarType: 'none',
      fatType: 'saturated',
      carbType: 'refined', 
      hasWholeGrains: false, 
      hasPreservatives: true, 
      glycemicImpact: 'high', 
      overallQuality: 'poor' 
    },
    expectedRankNormal: 5,
    expectedRankCholesterol: 3,
    reasoning: 'Fried but only 3.5g saturated fat - better than burgers for cholesterol'
  },
  {
    name: 'Large Milkshake',
    nutrients: { 
      calories: 820, 
      sugars: 112, 
      totalFat: 22,
      saturatedFat: 14,
      transFat: 0.5,
      totalCarbohydrates: 138,
      dietaryFiber: 0,
      sodium: 360 
    },
    foodContext: { 
      category: 'dessert', 
      processingLevel: 'ultra-processed', 
      cookingMethod: 'none', 
      sugarType: 'added',
      fatType: 'saturated',
      carbType: 'refined', 
      hasWholeGrains: false, 
      hasPreservatives: true, 
      glycemicImpact: 'very-high', 
      overallQuality: 'very-poor' 
    },
    expectedRankNormal: 6,
    expectedRankCholesterol: 6,
    reasoning: '112g sugar + 14g saturated fat - worst for everyone'
  },
];

function runTest() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  CHOLESTEROL TEST - Normal vs High Cholesterol Patient       ║');
  console.log('║  6 Fast Food Items - Testing Fat Scoring Accuracy            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const normalPerson = new User({
    id: 1,
    height: 175,
    weight: 70,
    hasDiabetes: false,
    hasHighCholesterol: false,
    hasHighBloodPressure: false,
  });

  const cholesterolPatient = new User({
    id: 2,
    height: 175,
    weight: 70,
    hasDiabetes: false,
    hasHighCholesterol: true,
    hasHighBloodPressure: false,
  });

  const scoringService = new EnhancedScoringService();

  // Calculate for both users
  const normalResults = testFoods.map(food => {
    const foodData = { ...food.nutrients, foodContext: food.foodContext };
    const result = scoringService.calculateEnhancedScore(foodData, normalPerson);
    return { ...food, calculatedScore: result.totalScore, breakdown: result.breakdown, adjustments: result.adjustments };
  });

  const cholesterolResults = testFoods.map(food => {
    const foodData = { ...food.nutrients, foodContext: food.foodContext };
    const result = scoringService.calculateEnhancedScore(foodData, cholesterolPatient);
    return { ...food, calculatedScore: result.totalScore, breakdown: result.breakdown, adjustments: result.adjustments };
  });

  const normalSorted = [...normalResults].sort((a, b) => b.calculatedScore - a.calculatedScore);
  const cholesterolSorted = [...cholesterolResults].sort((a, b) => b.calculatedScore - a.calculatedScore);

  // Print expected rankings
  console.log('📋 RATIONAL/EXPECTED RANKINGS:\n');
  console.log('─────────────────────────────────────────────────────────────────\n');
  
  console.log('👤 NORMAL PERSON (No Cholesterol Issues):\n');
  [...testFoods].sort((a, b) => a.expectedRankNormal - b.expectedRankNormal).forEach(food => {
    console.log(`   #${food.expectedRankNormal} - ${food.name}`);
    console.log(`       Fat: ${food.nutrients.totalFat}g (${food.nutrients.saturatedFat}g sat) | Calories: ${food.nutrients.calories}`);
  });

  console.log('\n💊 HIGH CHOLESTEROL PATIENT (Focus on Saturated Fat):\n');
  [...testFoods].sort((a, b) => a.expectedRankCholesterol - b.expectedRankCholesterol).forEach(food => {
    console.log(`   #${food.expectedRankCholesterol} - ${food.name}`);
    console.log(`       Fat: ${food.nutrients.totalFat}g (${food.nutrients.saturatedFat}g sat) | Calories: ${food.nutrients.calories}`);
  });

  console.log('\n═════════════════════════════════════════════════════════════════\n');

  // Print calculated rankings
  console.log('🤖 FORMULA CALCULATED RANKINGS:\n');
  console.log('─────────────────────────────────────────────────────────────────\n');

  console.log('👤 NORMAL PERSON (Weights: 20% each):\n');
  normalSorted.forEach((food, index) => {
    const calculatedRank = index + 1;
    const rankDiff = Math.abs(calculatedRank - food.expectedRankNormal);
    const matchEmoji = rankDiff === 0 ? '🎯' : rankDiff <= 1 ? '✅' : '⚠️';
    const scoreEmoji = food.calculatedScore >= 70 ? '🟢' : food.calculatedScore >= 50 ? '🟡' : food.calculatedScore >= 30 ? '🟠' : '🔴';
    
    console.log(`${matchEmoji} #${calculatedRank} ${scoreEmoji} ${food.calculatedScore}/100 - ${food.name}`);
    console.log(`   Expected: #${food.expectedRankNormal} | Diff: ${rankDiff}`);
    console.log(`   Fat Score: ${food.breakdown.fat} | Quality: ${food.breakdown.quality}`);
    console.log('');
  });

  console.log('💊 HIGH CHOLESTEROL PATIENT (Fat: 35%, Others: 16% each):\n');
  cholesterolSorted.forEach((food, index) => {
    const calculatedRank = index + 1;
    const rankDiff = Math.abs(calculatedRank - food.expectedRankCholesterol);
    const matchEmoji = rankDiff === 0 ? '🎯' : rankDiff <= 1 ? '✅' : '⚠️';
    const scoreEmoji = food.calculatedScore >= 70 ? '🟢' : food.calculatedScore >= 50 ? '🟡' : food.calculatedScore >= 30 ? '🟠' : '🔴';
    
    console.log(`${matchEmoji} #${calculatedRank} ${scoreEmoji} ${food.calculatedScore}/100 - ${food.name}`);
    console.log(`   Expected: #${food.expectedRankCholesterol} | Diff: ${rankDiff}`);
    console.log(`   Fat Score: ${food.breakdown.fat} | Quality: ${food.breakdown.quality}`);
    console.log('');
  });

  console.log('═════════════════════════════════════════════════════════════════\n');

  // Calculate accuracy
  let normalPerfect = 0, normalWithin2 = 0, normalTotalError = 0;
  let cholesterolPerfect = 0, cholesterolWithin2 = 0, cholesterolTotalError = 0;

  normalSorted.forEach((food, index) => {
    const diff = Math.abs((index + 1) - food.expectedRankNormal);
    normalTotalError += diff;
    if (diff === 0) normalPerfect++;
    if (diff <= 2) normalWithin2++;
  });

  cholesterolSorted.forEach((food, index) => {
    const diff = Math.abs((index + 1) - food.expectedRankCholesterol);
    cholesterolTotalError += diff;
    if (diff === 0) cholesterolPerfect++;
    if (diff <= 2) cholesterolWithin2++;
  });

  const normalAccuracy = ((normalWithin2 / testFoods.length) * 100).toFixed(1);
  const cholesterolAccuracy = ((cholesterolWithin2 / testFoods.length) * 100).toFixed(1);

  console.log('📊 ACCURACY ANALYSIS:\n');
  console.log('─────────────────────────────────────────────────────────────────\n');
  
  console.log('👤 NORMAL PERSON:');
  console.log(`   🎯 Perfect Matches: ${normalPerfect}/6 (${((normalPerfect / 6) * 100).toFixed(1)}%)`);
  console.log(`   ✅ Within 2 Ranks: ${normalWithin2}/6 (${normalAccuracy}%)`);
  console.log(`   📊 Avg Error: ${(normalTotalError / 6).toFixed(2)} positions`);
  console.log(`   🏆 ACCURACY: ${normalAccuracy}%\n`);

  console.log('💊 HIGH CHOLESTEROL PATIENT:');
  console.log(`   🎯 Perfect Matches: ${cholesterolPerfect}/6 (${((cholesterolPerfect / 6) * 100).toFixed(1)}%)`);
  console.log(`   ✅ Within 2 Ranks: ${cholesterolWithin2}/6 (${cholesterolAccuracy}%)`);
  console.log(`   📊 Avg Error: ${(cholesterolTotalError / 6).toFixed(2)} positions`);
  console.log(`   🏆 ACCURACY: ${cholesterolAccuracy}%\n`);

  console.log('═════════════════════════════════════════════════════════════════\n');

  // Key insights
  console.log('💡 KEY INSIGHTS:\n');
  console.log('─────────────────────────────────────────────────────────────────\n');
  
  const fries = testFoods.find(f => f.name.includes('French Fries'));
  const burger = testFoods.find(f => f.name.includes('Basic Hamburger'));
  const normalFriesScore = normalResults.find(f => f.name.includes('French Fries')).calculatedScore;
  const normalBurgerScore = normalResults.find(f => f.name.includes('Basic Hamburger')).calculatedScore;
  const cholFriesScore = cholesterolResults.find(f => f.name.includes('French Fries')).calculatedScore;
  const cholBurgerScore = cholesterolResults.find(f => f.name.includes('Basic Hamburger')).calculatedScore;

  console.log(`📌 French Fries vs Basic Hamburger:`);
  console.log(`   French Fries: ${fries.nutrients.saturatedFat}g sat fat`);
  console.log(`   Basic Hamburger: ${burger.nutrients.saturatedFat}g sat fat\n`);
  
  console.log(`   Normal Person:`);
  console.log(`   - Fries: ${normalFriesScore}/100 (Rank #${normalSorted.findIndex(f => f.name.includes('French Fries')) + 1})`);
  console.log(`   - Burger: ${normalBurgerScore}/100 (Rank #${normalSorted.findIndex(f => f.name.includes('Basic Hamburger')) + 1})\n`);
  
  console.log(`   Cholesterol Patient:`);
  console.log(`   - Fries: ${cholFriesScore}/100 (Rank #${cholesterolSorted.findIndex(f => f.name.includes('French Fries')) + 1}) ⬆️`);
  console.log(`   - Burger: ${cholBurgerScore}/100 (Rank #${cholesterolSorted.findIndex(f => f.name.includes('Basic Hamburger')) + 1}) ⬇️`);
  console.log(`   → Fries become BETTER than burger due to lower saturated fat!\n`);

  console.log('═════════════════════════════════════════════════════════════════\n');
}

runTest();
