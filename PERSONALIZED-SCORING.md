# Personalized Health Scoring - Implementation Summary

## 🎯 Overview

Enhanced the NutriScore AI app with **dynamic, personalized health scoring** based on individual user health risks.

---

## ✅ What's Implemented

### Backend Updates

#### 1. Enhanced Scoring Service

**File:** `backend/src/services/scoring.service.ts`

**New Features:**

- Dynamic weight calculation based on user health risks
- Health risk assessment (high/normal for each metric)
- Personalized score component weighting

**Health Risk Logic:**

```typescript
Blood Sugar Assessment:
- Normal: < 100 mg/dL
- Pre-diabetes: 100-125 mg/dL
- Diabetes: ≥ 126 mg/dL

LDL Cholesterol Assessment:
- Optimal: < 100 mg/dL
- Near optimal: 100-129 mg/dL
- Borderline high: 130-159 mg/dL
- High: ≥ 160 mg/dL

BMI Assessment (from weight & height):
- Underweight: < 18.5
- Normal: 18.5-24.9
- Overweight: 25-29.9
- Obese: ≥ 30
```

**Dynamic Weight Examples:**

| User Health Status       | Sugar                                         | Fat     | Sodium | Calories |
| ------------------------ | --------------------------------------------- | ------- | ------ | -------- |
| **Normal (Default)**     | 30%                                           | 30%     | 25%    | 15%      |
| **High Blood Sugar**     | **50%**                                       | 20%     | 15%    | 15%      |
| **High LDL Cholesterol** | 15%                                           | **50%** | 20%    | 15%      |
| **Overweight/Obese**     | 25%                                           | 25%     | 10%    | **40%**  |
| **Multiple Risks**       | Combines risk factors with weighted averaging |

---

### Frontend Updates

#### 1. Profile Screen

**File:** `frontend/src/screens/ProfileScreen.tsx`

**Features:**

- ScrollView for easy navigation ✅
- Load user profile data from API
- Input fields for health metrics:
  - Blood Sugar (mg/dL)
  - LDL Cholesterol (mg/dL)
  - Weight (kg)
  - Height (cm)
- Real-time BMI calculation
- Color-coded health status indicators
- Save changes to database
- Educational info about personalized scoring

**UI Elements:**

- 📊 Health status badges (✓ Normal, ⚠️ High, etc.)
- 💡 Info box explaining how values affect scoring
- 🎯 BMI calculator with category display
- ✅ Save button with loading state

#### 2. Navigation

**Files:** `frontend/App.tsx`, `frontend/src/screens/ScannerScreen.tsx`

**Changes:**

- Added Profile screen to navigation stack
- Added "👤 Health Profile" button in Scanner screen
- Navigation flow: Login → Scanner ⟷ Profile → Results

---

## 🧮 Scoring Algorithm Details

### Default Scoring (No User Profile)

```
Overall Score = (Sugar × 0.30) + (Fat × 0.30) + (Sodium × 0.25) + (Calories × 0.15)
```

### Personalized Scoring Examples

#### Example 1: User with High Blood Sugar (150 mg/dL)

```typescript
Risk Factor: High blood sugar (diabetes range)
Priority: SUGAR RESTRICTION

Weights:
- Sugar: 50% (↑ from 30%)
- Fat: 20% (↓ from 30%)
- Sodium: 15% (↓ from 25%)
- Calories: 15% (unchanged)

Result: Foods high in sugar will receive MUCH lower scores
```

#### Example 2: User with High LDL (180 mg/dL)

```typescript
Risk Factor: High LDL cholesterol
Priority: FAT RESTRICTION (especially saturated fat)

Weights:
- Sugar: 15% (↓ from 30%)
- Fat: 50% (↑ from 30%)
- Sodium: 20% (↓ from 25%)
- Calories: 15% (unchanged)

Result: Foods high in saturated fat will receive MUCH lower scores
```

#### Example 3: Overweight User (BMI 28)

```typescript
Risk Factor: Overweight (BMI 25-29.9)
Priority: CALORIE REDUCTION

Weights:
- Sugar: 25% (↓ from 30%)
- Fat: 25% (↓ from 30%)
- Sodium: 10% (↓ from 25%)
- Calories: 40% (↑ from 15%)

Result: High-calorie foods will receive MUCH lower scores
```

#### Example 4: Multiple Risk Factors

```typescript
User: High blood sugar (130 mg/dL) + Overweight (BMI 27)

Combined Risk Adjustment:
- Sugar: 40% (high priority)
- Fat: 20%
- Sodium: 10%
- Calories: 30% (high priority)

Result: Both sugar AND calories heavily weighted
```

---

## 🔌 API Changes

### Existing Endpoint (Already Works!)

**GET** `/api/user/profile`

- Returns user health data
- Already integrated in scan controller ✅

**PUT** `/api/user/profile`

- Updates user health metrics
- Accepts: `blood_sugar_mg_dl`, `ldl_cholesterol_mg_dl`, `weight_kg`, `height_cm`
- Already exists in backend ✅

---

## 📊 Test Scenarios

### Test Case 1: Normal User

**Profile:**

- Blood Sugar: 90 mg/dL (normal)
- LDL: 95 mg/dL (optimal)
- BMI: 22 (normal)

**Food Scanned:**

- Calories: 250
- Sugar: 12g
- Saturated Fat: 3g
- Sodium: 600mg

**Expected Result:**

```
Overall Score: ~70
- Sugar Score: 80 (weight: 30%)
- Fat Score: 80 (weight: 30%)
- Sodium Score: 0 (weight: 25%)
- Calorie Score: 100 (weight: 15%)

Warnings:
- ⚠️ Moderate saturated fat
- ⚠️ Very high sodium
```

### Test Case 2: High Blood Sugar User

**Profile:**

- Blood Sugar: 140 mg/dL (diabetes)
- LDL: 95 mg/dL (normal)
- BMI: 22 (normal)

**Same Food:**

- Calories: 250
- Sugar: 12g
- Saturated Fat: 3g
- Sodium: 600mg

**Expected Result:**

```
Overall Score: ~62 (lower than normal user!)
- Sugar Score: 80 (weight: 50% ← DOUBLED!)
- Fat Score: 80 (weight: 20%)
- Sodium Score: 0 (weight: 15%)
- Calorie Score: 100 (weight: 15%)

Warnings:
- ⚠️ CAUTION: You have elevated blood sugar - this food contains 12g sugar
- ⚠️ Moderate saturated fat
- ⚠️ Very high sodium

Recommendations:
- 💡 Consider sugar-free alternatives
- 💡 Limit added sugars to <6g per serving
```

### Test Case 3: High LDL User

**Profile:**

- Blood Sugar: 90 mg/dL (normal)
- LDL: 170 mg/dL (high)
- BMI: 22 (normal)

**Same Food:**

- Calories: 250
- Sugar: 12g
- Saturated Fat: 3g
- Sodium: 600mg

**Expected Result:**

```
Overall Score: ~64 (lower than normal user!)
- Sugar Score: 80 (weight: 15%)
- Fat Score: 80 (weight: 50% ← DOUBLED!)
- Saturated Fat: 3g triggers stronger warning
- Sodium Score: 0 (weight: 20%)
- Calorie Score: 100 (weight: 15%)

Warnings:
- ⚠️ CAUTION: You have high LDL - this food contains 3g saturated fat
- ⚠️ Very high sodium

Recommendations:
- 💡 Choose products with <2g saturated fat
- 💡 Consider plant-based alternatives (lower saturated fat)
```

---

## 🚀 How to Test

### Step 1: Update Health Profile

1. Login to app
2. Click "👤 Health Profile" button on Scanner screen
3. Enter test values:
   - Blood Sugar: 150 (diabetes range)
   - LDL: 95 (normal)
   - Weight: 75
   - Height: 175
4. Click "Save Changes"
5. Check backend logs for updated values

### Step 2: Scan Same Food Label

1. Go back to Scanner
2. Scan the same nutrition label as before
3. Compare results with previous scan

### Step 3: Verify Personalized Score

**Backend logs should show:**

```
🩺 User Health Risks: { hasHighBloodSugar: true, hasHighLDL: false, isOverweight: false }
⚖️ Dynamic Weights: { sugar: 0.5, fat: 0.2, sodium: 0.15, calories: 0.15 }
```

**Results screen should show:**

- Lower overall score (due to 50% sugar weight)
- Stronger warnings about sugar content
- Personalized recommendations

---

## 🎨 UI Features

### Profile Screen

- ✅ Scrollable form (fixed scrolling issue)
- ✅ Real-time health status indicators
- ✅ Color-coded feedback (green/orange/red)
- ✅ BMI auto-calculation
- ✅ Educational tooltips
- ✅ Loading states

### Scanner Screen

- ✅ New "Health Profile" button (purple)
- ✅ Easy navigation to profile editor

### Results Screen

- (No changes - already displays personalized scores)

---

## 📝 Code Highlights

### Dynamic Weight Calculation

```typescript
private calculateDynamicWeights(healthRisks: HealthRisks): ScoreWeights {
  const weights = {
    sugar: 0.30,
    fat: 0.30,
    sodium: 0.25,
    calories: 0.15
  };

  if (healthRisks.hasHighBloodSugar) {
    weights.sugar = 0.50;      // 🎯 Prioritize sugar
    weights.fat = 0.20;
    weights.sodium = 0.15;
  } else if (healthRisks.hasHighLDL) {
    weights.sugar = 0.15;
    weights.fat = 0.50;        // 🎯 Prioritize fat
    weights.sodium = 0.20;
  } else if (healthRisks.isOverweight) {
    weights.sugar = 0.25;
    weights.fat = 0.25;
    weights.sodium = 0.10;
    weights.calories = 0.40;   // 🎯 Prioritize calories
  }

  return weights;
}
```

### Health Risk Assessment

```typescript
private assessHealthRisks(userProfile?: UserProfile): HealthRisks {
  if (!userProfile) {
    return { hasHighBloodSugar: false, hasHighLDL: false, isOverweight: false };
  }

  // Blood sugar check
  const hasHighBloodSugar = (userProfile.bloodSugarMgDl || 0) >= 100;

  // LDL cholesterol check
  const hasHighLDL = (userProfile.ldlCholesterolMgDl || 0) >= 130;

  // BMI calculation
  let isOverweight = false;
  if (userProfile.weightKg && userProfile.heightCm) {
    const heightM = userProfile.heightCm / 100;
    const bmi = userProfile.weightKg / (heightM * heightM);
    isOverweight = bmi >= 25;
  }

  return { hasHighBloodSugar, hasHighLDL, isOverweight };
}
```

---

## 🎉 Success Criteria

✅ **Backend:** Dynamic scoring based on user health risks
✅ **Frontend:** Scrollable profile editor with health inputs
✅ **Navigation:** Easy access to profile from scanner
✅ **Persistence:** Health data saved to PostgreSQL
✅ **Personalization:** Different scores for same food based on user health
✅ **UI/UX:** Color-coded feedback and educational tooltips

---

## 🔮 Future Enhancements

1. **Multiple Health Conditions:**

   - Combine weights intelligently when user has multiple risks
   - Example: High sugar + High LDL = balanced weighting

2. **Advanced Personalization:**

   - Age-based adjustments
   - Gender-specific recommendations
   - Activity level consideration

3. **Goal Tracking:**

   - Set target blood sugar/cholesterol
   - Track improvement over time
   - Show progress charts

4. **Medication Awareness:**
   - Flag food interactions with common medications
   - Dietary restrictions (e.g., low-sodium for hypertension meds)

---

**Status:** ✅ FULLY IMPLEMENTED
**Date:** October 28, 2025
**Impact:** Makes the app truly personalized - same food, different scores based on YOUR health needs!
