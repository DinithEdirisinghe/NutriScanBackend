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

  // === Health Conditions (Simple Toggle) ===
  @Column({ type: 'boolean', default: false })
  hasDiabetes!: boolean;

  @Column({ type: 'boolean', default: false })
  hasHighCholesterol!: boolean;

  @Column({ type: 'boolean', default: false })
  hasHighBloodPressure!: boolean;

  // === Physical Measurements ===
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number; // Weight (kg)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height?: number; // Height (cm)

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Computed property: BMI
  get bmi(): number | null {
    if (this.weight && this.height) {
      const heightInMeters = this.height / 100;
      return Number((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    return null;
  }

  // Computed property: BMI category
  get bmiCategory(): string {
    const bmiValue = this.bmi;
    if (!bmiValue) return 'Unknown';
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  }

  // Computed property: Is healthy (no conditions and normal BMI)
  get isHealthy(): boolean {
    return !this.hasDiabetes && 
           !this.hasHighCholesterol && 
           !this.hasHighBloodPressure && 
           this.bmiCategory === 'Normal';
  }
}
