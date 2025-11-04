// ENHANCED AI + FORMULA SCORING TEST - DIABETIC PATIENTS
// Tests the hybrid AI + formula approach with 20 foods

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
        if (saturatedFat > 5) score -= 60;
        else if (saturatedFat > 2) score -= 40;
        else if (saturatedFat > 1) score -= 20;
      } else {
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

    // Extract foodContext from data
    const foodContext = data.foodContext || {};

    const sugarScore = this.scoreSugarEnhanced(
      data.sugars,
      data.dietaryFiber,
      foodContext,
      user
    );

    const fatScore = this.scoreFatEnhanced(
      data.totalFat,
      data.saturatedFat,
      data.transFat,
      foodContext,
      user
    );

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

// Test data with top 10 foods for diabetics
const testFoods = [
  {
    name: 'Salmon Fillet',
    nutrients: { calories: 350, sugars: 0, totalFat: 22, saturatedFat: 3, transFat: 0, totalCarbohydrates: 0, dietaryFiber: 0, sodium: 90 },
    foodContext: { category: 'protein', processingLevel: 'minimally-processed', cookingMethod: 'grilled', sugarType: 'none', fatType: 'healthy-unsaturated', fatSources: ['omega-3'], carbType: 'none', hasWholeGrains: false, hasPreservatives: false, glycemicImpact: 'very-low', overallQuality: 'excellent' },
    expectedRank: 1
  },
  {
    name: 'Spinach Salad',
    nutrients: { calories: 20, sugars: 0.8, totalFat: 0.4, saturatedFat: 0.1, transFat: 0, totalCarbohydrates: 3.6, dietaryFiber: 2.2, sodium: 60 },
    foodContext: { category: 'vegetable', processingLevel: 'whole', cookingMethod: 'raw', sugarType: 'natural', fatType: 'none', carbType: 'complex', hasWholeGrains: false, hasPreservatives: false, glycemicImpact: 'very-low', overallQuality: 'excellent' },
    expectedRank: 2
  },
  {
    name: 'Avocado',
    nutrients: { calories: 120, sugars: 0.5, totalFat: 11, saturatedFat: 1.5, transFat: 0, totalCarbohydrates: 6, dietaryFiber: 5, sodium: 5 },
    foodContext: { category: 'fruit', processingLevel: 'whole', cookingMethod: 'raw', sugarType: 'natural', fatType: 'healthy-unsaturated', fatSources: ['monounsaturated'], carbType: 'complex', hasWholeGrains: false, hasPreservatives: false, glycemicImpact: 'very-low', overallQuality: 'excellent' },
    expectedRank: 3
  },
  {
    name: 'Turkey Breast',
    nutrients: { calories: 150, sugars: 0, totalFat: 2, saturatedFat: 0.6, transFat: 0, totalCarbohydrates: 0, dietaryFiber: 0, sodium: 65 },
    foodContext: { category: 'protein', processingLevel: 'minimally-processed', cookingMethod: 'grilled', sugarType: 'none', fatType: 'mixed', carbType: 'none', hasWholeGrains: false, hasPreservatives: false, glycemicImpact: 'very-low', overallQuality: 'excellent' },
    expectedRank: 4
  },
  {
    name: 'Strawberries',
    nutrients: { calories: 50, sugars: 7, totalFat: 0.5, saturatedFat: 0, transFat: 0, totalCarbohydrates: 12, dietaryFiber: 3, sodium: 2 },
    foodContext: { category: 'fruit', processingLevel: 'whole', cookingMethod: 'raw', sugarType: 'natural', sugarSources: ['natural fruit sugar'], fatType: 'none', carbType: 'complex', hasWholeGrains: false, hasPreservatives: false, glycemicImpact: 'low', overallQuality: 'excellent' },
    expectedRank: 5
  },
  {
    name: 'Sweet Potato',
    nutrients: { calories: 100, sugars: 5, totalFat: 0.2, saturatedFat: 0, transFat: 0, totalCarbohydrates: 24, dietaryFiber: 4, sodium: 70 },
    foodContext: { category: 'vegetable', processingLevel: 'whole', cookingMethod: 'baked', sugarType: 'natural', fatType: 'none', carbType: 'complex', hasWholeGrains: false, hasPreservatives: false, glycemicImpact: 'medium', overallQuality: 'good' },
    expectedRank: 6
  },
  {
    name: 'Pasta',
    nutrients: { calories: 220, sugars: 1, totalFat: 1.3, saturatedFat: 0.2, transFat: 0, totalCarbohydrates: 43, dietaryFiber: 2.5, sodium: 2 },
    foodContext: { category: 'grain', processingLevel: 'processed', cookingMethod: 'boiled', sugarType: 'none', fatType: 'none', carbType: 'refined', hasWholeGrains: false, hasPreservatives: false, glycemicImpact: 'high', overallQuality: 'fair' },
    expectedRank: 7
  },
  {
    name: 'French Fries',
    nutrients: { calories: 230, sugars: 0, totalFat: 11, saturatedFat: 2, transFat: 0, totalCarbohydrates: 29, dietaryFiber: 2, sodium: 160 },
    foodContext: { category: 'fast-food', processingLevel: 'processed', cookingMethod: 'fried', sugarType: 'none', fatType: 'saturated', carbType: 'refined', hasWholeGrains: false, hasPreservatives: true, glycemicImpact: 'high', overallQuality: 'poor' },
    expectedRank: 8
  },
  {
    name: 'Ice Cream',
    nutrients: { calories: 210, sugars: 21, totalFat: 11, saturatedFat: 7, transFat: 0, totalCarbohydrates: 24, dietaryFiber: 0, sodium: 50 },
    foodContext: { category: 'dessert', processingLevel: 'ultra-processed', cookingMethod: 'none', sugarType: 'added', sugarSources: ['sugar', 'cream'], fatType: 'saturated', carbType: 'refined', hasWholeGrains: false, hasPreservatives: true, glycemicImpact: 'high', overallQuality: 'very-poor' },
    expectedRank: 9
  },
  {
    name: 'Cinnamon Roll',
    nutrients: { calories: 880, sugars: 58, totalFat: 37, saturatedFat: 16, transFat: 0, totalCarbohydrates: 120, dietaryFiber: 2, sodium: 820 },
    foodContext: { category: 'dessert', processingLevel: 'ultra-processed', cookingMethod: 'baked', sugarType: 'added', sugarSources: ['sugar', 'frosting'], fatType: 'saturated', carbType: 'refined', hasWholeGrains: false, hasPreservatives: true, glycemicImpact: 'very-high', overallQuality: 'very-poor' },
    expectedRank: 10
  },
];

function runTest() {
  console.log('\\n=================================================================');
  console.log('  ENHANCED AI + FORMULA TEST - DIABETIC PATIENT');
  console.log('=================================================================\\n');

  const testPatient = new User({
    id: 1,
    height: 175,
    weight: 70,
    hasDiabetes: true,
    hasHighCholesterol: false,
    hasHighBloodPressure: false,
  });

  const scoringService = new EnhancedScoringService();

  // Calculate scores
  const results = testFoods.map(food => {
    // Merge nutrients and foodContext into single object for scoring
    const foodData = {
      ...food.nutrients,
      foodContext: food.foodContext
    };
    const result = scoringService.calculateEnhancedScore(foodData, testPatient);
    return {
      ...food,
      calculatedScore: result.totalScore,
      breakdown: result.breakdown,
      adjustments: result.adjustments,
    };
  });

  const sortedResults = [...results].sort((a, b) => b.calculatedScore - a.calculatedScore);

  // Print rankings
  console.log('EXPECTED RANKING (Common Sense for Diabetics):\\n');
  [...results].sort((a, b) => a.expectedRank - b.expectedRank).forEach(food => {
    const emoji = food.expectedRank <= 3 ? '✅' : food.expectedRank <= 6 ? '🟢' : food.expectedRank <= 8 ? '⚠️' : '🚨';
    console.log(`${emoji} #${food.expectedRank} - ${food.name} (Sugar: ${food.nutrients.sugars}g)`);
  });

  console.log('\\n-----------------------------------------------------------------\\n');
  console.log('CALCULATED RANKING (AI + Formula Hybrid):\\n');

  sortedResults.forEach((food, index) => {
    const calculatedRank = index + 1;
    const rankDiff = Math.abs(calculatedRank - food.expectedRank);
    const matchEmoji = rankDiff === 0 ? '🎯' : rankDiff <= 2 ? '✅' : '⚠️';
    const scoreEmoji = food.calculatedScore >= 80 ? '🟢' : food.calculatedScore >= 60 ? '🟡' : food.calculatedScore >= 40 ? '🟠' : '🔴';
    
    console.log(`${matchEmoji} #${calculatedRank} ${scoreEmoji} ${food.calculatedScore}/100 - ${food.name}`);
    console.log(`   Expected: #${food.expectedRank} | Diff: ${rankDiff} ranks`);
    console.log(`   Scores: Sugar ${food.breakdown.sugar}, Fat ${food.breakdown.fat}, Quality ${food.breakdown.quality}`);
    
    const adj = food.adjustments;
    const totalAdj = adj.sugarTypeBonus + adj.fatTypeBonus - adj.processingPenalty - adj.glycemicPenalty - adj.cookingPenalty;
    if (totalAdj !== 0) {
      console.log(`   🧠 AI Adjustments: ${totalAdj > 0 ? '+' : ''}${totalAdj}`);
    }
    console.log('');
  });

  console.log('-----------------------------------------------------------------\\n');

  // Calculate accuracy
  let perfectMatches = 0;
  let within2Ranks = 0;
  let totalRankError = 0;

  sortedResults.forEach((food, index) => {
    const calculatedRank = index + 1;
    const rankDiff = Math.abs(calculatedRank - food.expectedRank);
    
    totalRankError += rankDiff;
    if (rankDiff === 0) perfectMatches++;
    if (rankDiff <= 2) within2Ranks++;
  });

  const avgError = (totalRankError / testFoods.length).toFixed(2);
  const accuracy = ((within2Ranks / testFoods.length) * 100).toFixed(1);

  console.log('ACCURACY ANALYSIS:\\n');
  console.log(`Total Foods Tested: ${testFoods.length}`);
  console.log(`🎯 Perfect Matches: ${perfectMatches} (${((perfectMatches / testFoods.length) * 100).toFixed(1)}%)`);
  console.log(`✅ Within 2 Ranks: ${within2Ranks} (${accuracy}%)`);
  console.log(`📊 Average Rank Error: ${avgError} positions\\n`);

  const accuracyScore = parseFloat(accuracy);
  let verdict = accuracyScore >= 90 ? '🌟 OUTSTANDING!' : accuracyScore >= 80 ? '✅ EXCELLENT!' : accuracyScore >= 70 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT';

  console.log(`🏆 OVERALL ACCURACY: ${accuracy}%`);
  console.log(`   ${verdict}\\n`);

  console.log('=================================================================\\n');
}

runTest();
