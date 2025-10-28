import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to rename health marker columns to use simplified names
 * This removes the redundant units from column names for cleaner code
 */
export class RenameHealthMarkerColumns1234567890124 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename blood glucose markers
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "blood_sugar_mg_dl" TO "glucose"
    `);

    // Rename lipid panel columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "ldl_cholesterol_mg_dl" TO "ldl"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "hdl_cholesterol_mg_dl" TO "hdl"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "triglycerides_mg_dl" TO "triglycerides"
    `);

    // Rename liver enzyme columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "alt_u_l" TO "alt"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "ast_u_l" TO "ast"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "ggt_u_l" TO "ggt"
    `);

    // Rename kidney function column
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "creatinine_mg_dl" TO "creatinine"
    `);

    // Rename inflammation marker columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "crp_mg_l" TO "crp"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "uric_acid_mg_dl" TO "uric_acid"
    `);

    // Rename physical measurement columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "weight_kg" TO "weight"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "height_cm" TO "height"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "waist_cm" TO "waist"
    `);

    // Rename blood pressure columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "systolic_bp_mmhg" TO "systolic"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "diastolic_bp_mmhg" TO "diastolic"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert blood glucose markers
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "glucose" TO "blood_sugar_mg_dl"
    `);

    // Revert lipid panel columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "ldl" TO "ldl_cholesterol_mg_dl"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "hdl" TO "hdl_cholesterol_mg_dl"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "triglycerides" TO "triglycerides_mg_dl"
    `);

    // Revert liver enzyme columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "alt" TO "alt_u_l"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "ast" TO "ast_u_l"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "ggt" TO "ggt_u_l"
    `);

    // Revert kidney function column
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "creatinine" TO "creatinine_mg_dl"
    `);

    // Revert inflammation marker columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "crp" TO "crp_mg_l"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "uric_acid" TO "uric_acid_mg_dl"
    `);

    // Revert physical measurement columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "weight" TO "weight_kg"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "height" TO "height_cm"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "waist" TO "waist_cm"
    `);

    // Revert blood pressure columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "systolic" TO "systolic_bp_mmhg"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "diastolic" TO "diastolic_bp_mmhg"
    `);
  }
}
