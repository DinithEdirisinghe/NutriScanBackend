# Health Marker Field Cleanup Guide

## Overview

This document explains the cleanup of health marker field names to remove redundancy and improve code clarity.

## Changes Made

### 1. User Entity Field Renaming

All health marker fields have been renamed to remove redundant unit suffixes:

#### Blood Glucose Markers

- `blood_sugar_mg_dl` → `glucose` (Fasting glucose in mg/dL)
- `hba1c` → `hba1c` (No change - HbA1c percentage)

#### Lipid Panel

- `ldl_cholesterol_mg_dl` → `ldl` (LDL cholesterol in mg/dL)
- `hdl_cholesterol_mg_dl` → `hdl` (HDL cholesterol in mg/dL)
- `triglycerides_mg_dl` → `triglycerides` (Triglycerides in mg/dL)

#### Liver Enzymes

- `alt_u_l` → `alt` (Alanine aminotransferase in U/L)
- `ast_u_l` → `ast` (Aspartate aminotransferase in U/L)
- `ggt_u_l` → `ggt` (Gamma-glutamyl transferase in U/L)

#### Kidney Function

- `creatinine_mg_dl` → `creatinine` (Creatinine in mg/dL)

#### Inflammation & Other Markers

- `crp_mg_l` → `crp` (C-reactive protein in mg/L)
- `uric_acid_mg_dl` → `uric_acid` (Uric acid in mg/dL)

#### Physical Measurements

- `weight_kg` → `weight` (Weight in kg)
- `height_cm` → `height` (Height in cm)
- `waist_cm` → `waist` (Waist circumference in cm)
- `bmi` → `bmi` (No change - Body Mass Index)

#### Blood Pressure

- `systolic_bp_mmhg` → `systolic` (Systolic BP in mmHg)
- `diastolic_bp_mmhg` → `diastolic` (Diastolic BP in mmHg)

#### Demographics

- `age` → `age` (No change - Age in years)

### 2. Database Migration

A migration file has been created to rename all columns in the database:

- **File**: `src/migrations/RenameHealthMarkerColumns.ts`
- **Action**: Renames all health marker columns to use simplified names
- **Reversible**: Includes `down()` method to revert changes if needed

### 3. Service Layer Updates

The `AdvancedScoringService` has been updated to use the new field names:

- **File**: `src/services/advancedScoring.service.ts`
- **Method**: `userToPersonMarkers()` - updated to map simplified field names

## Why These Changes?

### Before (Old)

```typescript
user.blood_sugar_mg_dl; // Verbose and redundant
user.ldl_cholesterol_mg_dl;
user.systolic_bp_mmhg;
```

### After (New)

```typescript
user.glucose; // Clean and concise
user.ldl;
user.systolic;
```

### Benefits

1. **Cleaner Code**: Shorter, more readable field names
2. **Less Redundancy**: Units are documented in comments, not in field names
3. **Better DX**: Easier to type and remember
4. **Consistency**: Aligns with the `PersonMarkers` interface in `dietRisk.ts`
5. **Profile UI**: Frontend will show clean field names (e.g., "Glucose" instead of "Blood Sugar Mg/Dl")

## Migration Steps

### Automatic (Recommended)

The migration will run automatically when the server starts:

```bash
npm run dev
# or
npm start
```

TypeORM will detect and run the migration automatically.

### Manual (If Needed)

To run the migration manually:

```bash
npm run typeorm migration:run
```

To revert the migration:

```bash
npm run typeorm migration:revert
```

## Frontend Updates Needed

The frontend profile form should be updated to use the new field names:

```typescript
// OLD field names (remove these)
blood_sugar_mg_dl;
ldl_cholesterol_mg_dl;
weight_kg;
height_cm;
systolic_bp_mmhg;
diastolic_bp_mmhg;

// NEW field names (use these)
glucose;
ldl;
weight;
height;
systolic;
diastolic;
```

## Field Display Labels (Frontend)

Use these user-friendly labels in the UI:

```typescript
const fieldLabels = {
  // Blood Glucose
  glucose: "Fasting Glucose (mg/dL)",
  hba1c: "HbA1c (%)",

  // Lipid Panel
  ldl: "LDL Cholesterol (mg/dL)",
  hdl: "HDL Cholesterol (mg/dL)",
  triglycerides: "Triglycerides (mg/dL)",

  // Liver Enzymes
  alt: "ALT (U/L)",
  ast: "AST (U/L)",
  ggt: "GGT (U/L)",

  // Kidney Function
  creatinine: "Creatinine (mg/dL)",

  // Inflammation
  crp: "C-Reactive Protein (mg/L)",
  uric_acid: "Uric Acid (mg/dL)",

  // Physical
  weight: "Weight (kg)",
  height: "Height (cm)",
  waist: "Waist Circumference (cm)",
  bmi: "BMI",

  // Blood Pressure
  systolic: "Systolic BP (mmHg)",
  diastolic: "Diastolic BP (mmHg)",

  // Demographics
  age: "Age (years)",
};
```

## Complete Health Profile Fields

After this cleanup, the user's complete health profile includes:

### Essential Markers (4)

- Glucose
- LDL
- Weight
- Height

### Comprehensive Markers (14 additional)

- HbA1c
- HDL
- Triglycerides
- ALT, AST, GGT (liver)
- Creatinine (kidney)
- CRP, Uric Acid (inflammation)
- Waist, BMI (physical)
- Systolic, Diastolic (BP)
- Age

## Testing

After applying this migration:

1. **Backend**: Restart the server and verify no errors
2. **Database**: Check that columns are renamed correctly
3. **API**: Test profile update/retrieval endpoints
4. **Scoring**: Scan a product and verify health scoring works
5. **Frontend**: Update profile form to use new field names

## Rollback Plan

If issues occur, revert the migration:

```bash
npm run typeorm migration:revert
```

Then restore the old field names in:

- `src/entities/User.entity.ts`
- `src/services/advancedScoring.service.ts`

## Questions?

- **Q**: Will existing data be lost?
- **A**: No, the migration only renames columns - all data is preserved.

- **Q**: Do I need to update my frontend?
- **A**: Yes, update API calls to use new field names (see Frontend Updates section).

- **Q**: Can I still use old field names temporarily?
- **A**: No, once migrated, only new names will work.

---

**Last Updated**: Date of cleanup
**Migration File**: `RenameHealthMarkerColumns.ts`
