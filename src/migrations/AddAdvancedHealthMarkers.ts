import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAdvancedHealthMarkers1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new health marker columns to users table
    const newColumns = [
      // Blood Glucose Markers
      new TableColumn({
        name: 'hba1c',
        type: 'decimal',
        precision: 4,
        scale: 2,
        isNullable: true,
      }),

      // Lipid Panel
      new TableColumn({
        name: 'hdl_cholesterol_mg_dl',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),
      new TableColumn({
        name: 'triglycerides_mg_dl',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),

      // Liver Enzymes
      new TableColumn({
        name: 'alt_u_l',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),
      new TableColumn({
        name: 'ast_u_l',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),
      new TableColumn({
        name: 'ggt_u_l',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),

      // Kidney Function
      new TableColumn({
        name: 'creatinine_mg_dl',
        type: 'decimal',
        precision: 4,
        scale: 2,
        isNullable: true,
      }),

      // Inflammation & Other Markers
      new TableColumn({
        name: 'crp_mg_l',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),
      new TableColumn({
        name: 'uric_acid_mg_dl',
        type: 'decimal',
        precision: 4,
        scale: 2,
        isNullable: true,
      }),

      // Physical Measurements
      new TableColumn({
        name: 'waist_cm',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),
      new TableColumn({
        name: 'bmi',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),

      // Blood Pressure
      new TableColumn({
        name: 'systolic_bp_mmhg',
        type: 'int',
        isNullable: true,
      }),
      new TableColumn({
        name: 'diastolic_bp_mmhg',
        type: 'int',
        isNullable: true,
      }),

      // Demographics
      new TableColumn({
        name: 'age',
        type: 'int',
        isNullable: true,
      }),
    ];

    // Add all columns to the users table
    for (const column of newColumns) {
      await queryRunner.addColumn('users', column);
    }

    console.log('✅ Added advanced health marker columns to users table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the columns in reverse order
    const columnNames = [
      'age',
      'diastolic_bp_mmhg',
      'systolic_bp_mmhg',
      'bmi',
      'waist_cm',
      'uric_acid_mg_dl',
      'crp_mg_l',
      'creatinine_mg_dl',
      'ggt_u_l',
      'ast_u_l',
      'alt_u_l',
      'triglycerides_mg_dl',
      'hdl_cholesterol_mg_dl',
      'hba1c',
    ];

    for (const columnName of columnNames) {
      await queryRunner.dropColumn('users', columnName);
    }

    console.log('✅ Removed advanced health marker columns from users table');
  }
}
