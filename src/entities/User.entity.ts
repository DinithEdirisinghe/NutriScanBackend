import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string; // Hashed password

  // === Blood Glucose Markers ===
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  glucose?: number; // Fasting glucose (mg/dL)

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  hba1c?: number; // HbA1c percentage

  // === Lipid Panel ===
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ldl?: number; // LDL cholesterol (mg/dL)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hdl?: number; // HDL cholesterol (mg/dL)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  triglycerides?: number; // Triglycerides (mg/dL)

  // === Liver Enzymes ===
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  alt?: number; // Alanine aminotransferase (U/L)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ast?: number; // Aspartate aminotransferase (U/L)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ggt?: number; // Gamma-glutamyl transferase (U/L)

  // === Kidney Function ===
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  creatinine?: number; // Creatinine (mg/dL)

  // === Inflammation & Other Markers ===
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  crp?: number; // C-reactive protein (mg/L)

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  uric_acid?: number; // Uric acid (mg/dL)

  // === Physical Measurements ===
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number; // Weight (kg)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height?: number; // Height (cm)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  waist?: number; // Waist circumference (cm)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bmi?: number; // Body Mass Index

  // === Blood Pressure ===
  @Column({ type: 'int', nullable: true })
  systolic?: number; // Systolic blood pressure (mmHg)

  @Column({ type: 'int', nullable: true })
  diastolic?: number; // Diastolic blood pressure (mmHg)

  // === Demographics ===
  @Column({ type: 'int', nullable: true })
  age?: number; // Age in years

  // === Scoring Preferences ===
  @Column({ type: 'varchar', length: 20, default: 'portion-aware' })
  scoringMode?: string; // 'portion-aware' or 'per-100g'

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
