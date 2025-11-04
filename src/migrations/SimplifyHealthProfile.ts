import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyHealthProfile1730000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new simplified health condition fields
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS hasDiabetes BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS hasHighCholesterol BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS hasHighBloodPressure BOOLEAN DEFAULT false
    `);

    // Drop old complex health marker fields
    await queryRunner.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS glucose,
      DROP COLUMN IF EXISTS hba1c,
      DROP COLUMN IF EXISTS ldl,
      DROP COLUMN IF EXISTS hdl,
      DROP COLUMN IF EXISTS triglycerides,
      DROP COLUMN IF EXISTS alt,
      DROP COLUMN IF EXISTS ast,
      DROP COLUMN IF EXISTS ggt,
      DROP COLUMN IF EXISTS creatinine,
      DROP COLUMN IF EXISTS crp,
      DROP COLUMN IF EXISTS uric_acid,
      DROP COLUMN IF EXISTS waist,
      DROP COLUMN IF EXISTS bmi,
      DROP COLUMN IF EXISTS systolic,
      DROP COLUMN IF EXISTS diastolic,
      DROP COLUMN IF EXISTS age,
      DROP COLUMN IF EXISTS scoringMode
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore old fields
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS glucose DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS hba1c DECIMAL(4,2),
      ADD COLUMN IF NOT EXISTS ldl DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS hdl DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS triglycerides DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS alt DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS ast DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS ggt DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS creatinine DECIMAL(4,2),
      ADD COLUMN IF NOT EXISTS crp DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS uric_acid DECIMAL(4,2),
      ADD COLUMN IF NOT EXISTS waist DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS bmi DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS systolic INT,
      ADD COLUMN IF NOT EXISTS diastolic INT,
      ADD COLUMN IF NOT EXISTS age INT,
      ADD COLUMN IF NOT EXISTS scoringMode VARCHAR(20) DEFAULT 'portion-aware'
    `);

    // Remove new simplified fields
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS hasDiabetes,
      DROP COLUMN IF EXISTS hasHighCholesterol,
      DROP COLUMN IF EXISTS hasHighBloodPressure
    `);
  }
}
