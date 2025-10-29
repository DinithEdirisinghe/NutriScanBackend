import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddScoringModeToUser1698537600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'scoringMode',
        type: 'varchar',
        length: '20',
        default: "'portion-aware'",
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'scoringMode');
  }
}
