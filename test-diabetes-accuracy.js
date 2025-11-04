/**
 * Test: Diabetes Scoring Accuracy
 * 
 * This test compares common sense rankings of foods for diabetic patients
 * with the actual scores from our simplified formula.
 */

// Simulate the User entity
class User {
  constructor(hasDiabetes, weight, height) {
    this.hasDiabetes = hasDiabetes;
    this.hasHighCholesterol = false;
    this.hasHighBloodPressure = false;
    this.weight = weight;
    this.height = height;
  }

  get bmi() {
    if (this.weight && this.height) {
      const heightInMeters = this.height / 100;
      return Number((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    return null;
  }

  get bmiCategory() {
    const bmiValue = this.bmi;
    if (!bmiValue) return 'Unknown';
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  }

  get isHealthy() {
    return !this.hasDiabetes && 
           !this.hasHighCholesterol && 
           !this.hasHighBloodPressure && 
           this.bmiCategory === 'Normal';
  }
}

// Simplified scoring service
class ScoringService {
  calculateScore(nutritionData, user) {
    const warnings = [];
    const recommendations = [];

    const sugarScore = this.scoreSugar(nutritionData.sugars, user, warnings, recommendations);
    const fatScore = this.scoreFat(nutritionData.saturatedFat, nutritionData.transFat, user, warnings, recommendations);
    const sodiumScore = this.scoreSodium(nutritionData.sodium, user, warnings, recommendations);
    const calorieScore = this.scoreCalories(nutritionData.calories, user, warnings, recommendations);

    const weights = this.calculateWeights(user);

    const overallScore = Math.round(
      (sugarScore * weights.sugar) +
      (fatScore * weights.fat) +
      (sodiumScore * weights.sodium) +
      (calorieScore * weights.calorie)
    );

    return {
      overallScore,
      breakdown: { sugarScore, fatScore, sodiumScore, calorieScore },
      warnings,
      recommendations,
    };
  }

  calculateWeights(user) {
    if (!user || user.isHealthy) {
      return { sugar: 0.25, fat: 0.25, sodium: 0.25, calorie: 0.25 };
    }

    const weights = { sugar: 0.25, fat: 0.25, sodium: 0.25, calorie: 0.25 };

    if (user.hasDiabetes) weights.sugar = 0.55; // Increased from 0.45
    if (user.hasHighCholesterol) weights.fat = 0.40;
    if (user.hasHighBloodPressure) weights.sodium = 0.40;
    
    if (user.bmiCategory === 'Obese') weights.calorie = 0.40;
    else if (user.bmiCategory === 'Overweight') weights.calorie = 0.35;
    else if (user.bmiCategory === 'Underweight') weights.calorie = 0.15;

    const sum = weights.sugar + weights.fat + weights.sodium + weights.calorie;
    return {
      sugar: weights.sugar / sum,
      fat: weights.fat / sum,
      sodium: weights.sodium / sum,
      calorie: weights.calorie / sum,
    };
  }

  scoreSugar(sugars, user, warnings, recommendations) {
    if (!sugars || sugars === 0) return 100; // Perfect score for zero sugar

    let score = 100;
    if (user?.hasDiabetes) {
      // Much stricter thresholds for diabetics with better granularity
      if (sugars >= 30) {
        score = 0; // Extremely dangerous
        warnings.push(`🚨 CRITICAL: ${sugars}g sugar - Extremely dangerous!`);
      } else if (sugars >= 20) {
        score = Math.max(0, 10 - ((sugars - 20) * 1)); // 0-10 range
        warnings.push(`🚨 CRITICAL: ${sugars}g sugar - Very dangerous`);
      } else if (sugars >= 10) {
        score = Math.max(10, 40 - ((sugars - 10) * 3)); // 10-40 range
        warnings.push(`🚨 High sugar for diabetes: ${sugars}g`);
      } else if (sugars >= 5) {
        score = Math.max(40, 70 - ((sugars - 5) * 6)); // 40-70 range
        warnings.push(`⚠️ Moderate sugar: ${sugars}g`);
      } else if (sugars >= 2) {
        score = 80; // Acceptable but not ideal
      } else if (sugars >= 0.5) {
        score = 90; // Very low sugar
      } else {
        score = 100; // Trace amounts or zero
      }
    } else {
      // Healthy/non-diabetic scoring
      if (sugars > 40) {
        score = 10;
      } else if (sugars > 25) {
        score = 30;
      } else if (sugars > 15) {
        score = 50;
      } else if (sugars > 8) {
        score = 75;
      } else if (sugars > 3) {
        score = 90;
      } else {
        score = 100;
      }
    }
    return Math.round(score);
  }

  scoreFat(saturatedFat, transFat, user, warnings, recommendations) {
    let score = 100;

    if (transFat && transFat > 0) {
      score -= 40;
    }

    if (saturatedFat) {
      if (user?.hasHighCholesterol) {
        if (saturatedFat > 2) {
          score -= 50;
        } else if (saturatedFat > 1) {
          score -= 25;
        }
      } else {
        if (saturatedFat > 5) {
          score -= 40;
        } else if (saturatedFat > 3) {
          score -= 20;
        }
      }
    }
    return Math.max(0, Math.round(score));
  }

  scoreSodium(sodium, user, warnings, recommendations) {
    if (!sodium) return 75;

    let score = 100;
    if (user?.hasHighBloodPressure) {
      if (sodium > 300) {
        score = Math.max(0, 100 - ((sodium - 300) / 10));
      } else if (sodium > 200) {
        score = 70;
      } else {
        score = 95;
      }
    } else {
      if (sodium > 600) {
        score = 20;
      } else if (sodium > 400) {
        score = 50;
      } else if (sodium > 200) {
        score = 75;
      } else {
        score = 95;
      }
    }
    return Math.round(score);
  }

  scoreCalories(calories, user, warnings, recommendations) {
    if (!calories) return 75;

    let score = 100;
    const bmiCategory = user?.bmiCategory;

    if (bmiCategory === 'Obese') {
      if (calories > 250) {
        score = Math.max(0, 100 - ((calories - 250) / 5));
      } else if (calories > 150) {
        score = 70;
      } else {
        score = 95;
      }
    } else if (bmiCategory === 'Overweight') {
      if (calories > 350) {
        score = Math.max(20, 100 - ((calories - 350) / 8));
      } else if (calories > 250) {
        score = 70;
      } else {
        score = 95;
      }
    } else if (bmiCategory === 'Underweight') {
      if (calories > 600) {
        score = 100;
      } else if (calories > 400) {
        score = 95;
      } else {
        score = 80;
      }
    } else {
      if (calories > 600) {
        score = 30;
      } else if (calories > 400) {
        score = 60;
      } else if (calories > 250) {
        score = 80;
      } else {
        score = 95;
      }
    }
    return Math.round(score);
  }
}

// Test data: Common foods ranked by how good they are for diabetics
const foodItems = [
  // BEST for diabetics (ranked 1-5)
  {
    rank: 1,
    name: "Grilled Chicken Breast",
    reason: "High protein, zero sugar, low fat",
    nutrition: {
      calories: 165,
      sugars: 0,
      saturatedFat: 1,
      transFat: 0,
      sodium: 74,
    }
  },
  {
    rank: 2,
    name: "Steamed Broccoli",
    reason: "Very low calories, zero sugar, high fiber",
    nutrition: {
      calories: 55,
      sugars: 0,
      saturatedFat: 0,
      transFat: 0,
      sodium: 33,
    }
  },
  {
    rank: 3,
    name: "Greek Yogurt (Plain, Unsweetened)",
    reason: "Low sugar, high protein, good for blood sugar control",
    nutrition: {
      calories: 100,
      sugars: 3.5,
      saturatedFat: 1.5,
      transFat: 0,
      sodium: 50,
    }
  },
  {
    rank: 4,
    name: "Almonds (1 oz)",
    reason: "Low sugar, healthy fats, slows blood sugar spike",
    nutrition: {
      calories: 164,
      sugars: 1,
      saturatedFat: 1,
      transFat: 0,
      sodium: 0,
    }
  },
  {
    rank: 5,
    name: "Hard Boiled Egg",
    reason: "Zero sugar, high protein, very filling",
    nutrition: {
      calories: 78,
      sugars: 0.6,
      saturatedFat: 1.6,
      transFat: 0,
      sodium: 62,
    }
  },

  // MODERATE (ranked 6-10)
  {
    rank: 6,
    name: "Apple (medium)",
    reason: "Natural sugar with fiber, still raises blood sugar",
    nutrition: {
      calories: 95,
      sugars: 19,
      saturatedFat: 0,
      transFat: 0,
      sodium: 2,
    }
  },
  {
    rank: 7,
    name: "Whole Wheat Bread (1 slice)",
    reason: "Some fiber, but still carbs that raise blood sugar",
    nutrition: {
      calories: 80,
      sugars: 2,
      saturatedFat: 0.5,
      transFat: 0,
      sodium: 170,
    }
  },
  {
    rank: 8,
    name: "Banana (medium)",
    reason: "Higher natural sugar, less fiber than apple",
    nutrition: {
      calories: 105,
      sugars: 14,
      saturatedFat: 0,
      transFat: 0,
      sodium: 1,
    }
  },
  {
    rank: 9,
    name: "Orange Juice (8 oz)",
    reason: "High sugar with no fiber to slow absorption",
    nutrition: {
      calories: 110,
      sugars: 21,
      saturatedFat: 0,
      transFat: 0,
      sodium: 2,
    }
  },
  {
    rank: 10,
    name: "White Rice (1 cup cooked)",
    reason: "High glycemic index, rapid blood sugar spike",
    nutrition: {
      calories: 205,
      sugars: 0,
      saturatedFat: 0,
      transFat: 0,
      sodium: 2,
    }
  },

  // BAD (ranked 11-13)
  {
    rank: 11,
    name: "Glazed Donut",
    reason: "Very high sugar, refined carbs, empty calories",
    nutrition: {
      calories: 260,
      sugars: 12,
      saturatedFat: 4.5,
      transFat: 0,
      sodium: 330,
    }
  },
  {
    rank: 12,
    name: "Candy Bar (Snickers)",
    reason: "Extremely high sugar, causes rapid spike",
    nutrition: {
      calories: 250,
      sugars: 27,
      saturatedFat: 4.5,
      transFat: 0,
      sodium: 120,
    }
  },

  // WORST (ranked 13-15)
  {
    rank: 13,
    name: "Regular Coca-Cola (12 oz)",
    reason: "Pure liquid sugar, fastest blood sugar spike",
    nutrition: {
      calories: 140,
      sugars: 39,
      saturatedFat: 0,
      transFat: 0,
      sodium: 45,
    }
  },
  {
    rank: 14,
    name: "Fruit Punch (16 oz)",
    reason: "Massive sugar content, no nutritional value",
    nutrition: {
      calories: 200,
      sugars: 52,
      saturatedFat: 0,
      transFat: 0,
      sodium: 40,
    }
  },
  {
    rank: 15,
    name: "Chocolate Milkshake (16 oz)",
    reason: "Extreme sugar + fat combo, disaster for diabetics",
    nutrition: {
      calories: 580,
      sugars: 68,
      saturatedFat: 10,
      transFat: 0.5,
      sodium: 300,
    }
  },
];

// Run the test
console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║     DIABETES SCORING ACCURACY TEST - SIMPLIFIED FORMULA       ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Create diabetic patient (normal BMI)
const diabeticPatient = new User(true, 70, 175);
console.log(`👤 Test Patient: Diabetic with BMI ${diabeticPatient.bmi} (${diabeticPatient.bmiCategory})`);

const scoringService = new ScoringService();
const weights = scoringService.calculateWeights(diabeticPatient);
console.log(`⚖️  Weights: Sugar ${(weights.sugar * 100).toFixed(0)}%, Fat ${(weights.fat * 100).toFixed(0)}%, Sodium ${(weights.sodium * 100).toFixed(0)}%, Calories ${(weights.calorie * 100).toFixed(0)}%\n`);

// Calculate scores for all foods
const results = foodItems.map(food => {
  const score = scoringService.calculateScore(food.nutrition, diabeticPatient);
  return {
    ...food,
    calculatedScore: score.overallScore,
    breakdown: score.breakdown,
  };
});

// Sort by calculated score (descending - higher is better)
const sortedByScore = [...results].sort((a, b) => b.calculatedScore - a.calculatedScore);

// Print results
console.log('════════════════════════════════════════════════════════════════\n');
console.log('📊 EXPECTED RANKING (Common Sense for Diabetics):');
console.log('────────────────────────────────────────────────────────────────\n');

results.forEach(food => {
  const rankEmoji = food.rank <= 5 ? '✅' : food.rank <= 10 ? '⚠️' : '🚨';
  console.log(`${rankEmoji} #${food.rank.toString().padStart(2)} - ${food.name.padEnd(40)} (Sugar: ${food.nutrition.sugars}g)`);
  console.log(`      ${food.reason}`);
});

console.log('\n════════════════════════════════════════════════════════════════\n');
console.log('🤖 CALCULATED RANKING (Using Simplified Formula):');
console.log('────────────────────────────────────────────────────────────────\n');

sortedByScore.forEach((food, index) => {
  const calculatedRank = index + 1;
  const expectedRank = food.rank;
  const diff = Math.abs(calculatedRank - expectedRank);
  
  const accuracyEmoji = diff === 0 ? '🎯' : diff <= 2 ? '✅' : diff <= 4 ? '⚠️' : '❌';
  const scoreColor = food.calculatedScore >= 80 ? '🟢' : food.calculatedScore >= 60 ? '🟡' : food.calculatedScore >= 40 ? '🟠' : '🔴';
  
  console.log(`${accuracyEmoji} #${calculatedRank.toString().padStart(2)} ${scoreColor} ${food.calculatedScore}/100 - ${food.name.padEnd(40)}`);
  console.log(`      Expected: #${expectedRank} | Difference: ${diff} ranks`);
  console.log(`      Sugar Score: ${food.breakdown.sugarScore}/100 (Weight: ${(weights.sugar * 100).toFixed(0)}%)`);
});

console.log('\n════════════════════════════════════════════════════════════════\n');
console.log('📈 ACCURACY ANALYSIS:');
console.log('────────────────────────────────────────────────────────────────\n');

// Calculate accuracy metrics
let perfectMatches = 0;
let withinTwo = 0;
let withinFour = 0;
let totalError = 0;

results.forEach((food, index) => {
  const calculatedRank = sortedByScore.findIndex(f => f.name === food.name) + 1;
  const expectedRank = food.rank;
  const diff = Math.abs(calculatedRank - expectedRank);
  
  totalError += diff;
  if (diff === 0) perfectMatches++;
  if (diff <= 2) withinTwo++;
  if (diff <= 4) withinFour++;
});

const totalFoods = results.length;
const avgError = (totalError / totalFoods).toFixed(2);

console.log(`Total Foods Tested: ${totalFoods}`);
console.log(`\n🎯 Perfect Matches (Rank Difference = 0): ${perfectMatches} (${((perfectMatches/totalFoods)*100).toFixed(1)}%)`);
console.log(`✅ Within 2 Ranks: ${withinTwo} (${((withinTwo/totalFoods)*100).toFixed(1)}%)`);
console.log(`⚠️  Within 4 Ranks: ${withinFour} (${((withinFour/totalFoods)*100).toFixed(1)}%)`);
console.log(`📊 Average Rank Error: ${avgError} positions`);

// Overall accuracy assessment
const accuracyPercent = ((withinTwo / totalFoods) * 100).toFixed(1);
console.log(`\n🏆 OVERALL ACCURACY: ${accuracyPercent}%`);

if (accuracyPercent >= 85) {
  console.log('   ✅ EXCELLENT - Formula is highly accurate!');
} else if (accuracyPercent >= 70) {
  console.log('   ✅ GOOD - Formula is reasonably accurate');
} else if (accuracyPercent >= 50) {
  console.log('   ⚠️  FAIR - Formula needs some tuning');
} else {
  console.log('   ❌ POOR - Formula needs significant improvement');
}

console.log('\n════════════════════════════════════════════════════════════════\n');
console.log('🔍 KEY INSIGHTS:');
console.log('────────────────────────────────────────────────────────────────\n');

// Find biggest mismatches
const mismatches = results.map((food, index) => {
  const calculatedRank = sortedByScore.findIndex(f => f.name === food.name) + 1;
  return {
    name: food.name,
    expected: food.rank,
    calculated: calculatedRank,
    diff: Math.abs(calculatedRank - food.rank),
    score: food.calculatedScore,
    sugar: food.nutrition.sugars,
  };
}).sort((a, b) => b.diff - a.diff);

if (mismatches[0].diff > 0) {
  console.log('⚠️  Biggest Mismatches:');
  mismatches.slice(0, 3).forEach(item => {
    if (item.diff > 0) {
      console.log(`   • ${item.name}: Expected #${item.expected}, Got #${item.calculated} (${item.diff} ranks off)`);
      console.log(`     Reason: Score ${item.score}/100 (Sugar: ${item.sugar}g)`);
    }
  });
} else {
  console.log('✅ No significant mismatches - formula is spot on!');
}

console.log('\n════════════════════════════════════════════════════════════════\n');

// Final verdict
if (withinTwo === totalFoods) {
  console.log('🎉 VERDICT: The simplified formula is HIGHLY ACCURATE for diabetics!');
  console.log('   All foods ranked within 2 positions of expected ranking.');
} else if (withinTwo >= totalFoods * 0.8) {
  console.log('✅ VERDICT: The simplified formula works VERY WELL for diabetics!');
  console.log('   Most foods ranked correctly, minor tweaking possible.');
} else if (withinFour >= totalFoods * 0.7) {
  console.log('👍 VERDICT: The simplified formula is GOOD for diabetics.');
  console.log('   Generally accurate, some edge cases need attention.');
} else {
  console.log('⚠️  VERDICT: Formula needs adjustment.');
  console.log('   Consider tweaking sugar weight or thresholds.');
}

console.log('\n════════════════════════════════════════════════════════════════\n');
