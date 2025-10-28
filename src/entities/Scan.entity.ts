import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity('scans')
export class Scan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'scan_type' })
  scanType: 'label' | 'food'; // label = nutrition table, food = food photo

  @Column({ type: 'text', nullable: true })
  image: string; // Base64 image data

  @Column({ name: 'food_name', nullable: true })
  foodName: string; // e.g., "Chicken Burger" (only for food scans)

  @Column({ type: 'jsonb', name: 'nutrition_data' })
  nutritionData: {
    calories: number;
    totalFat: number;
    saturatedFat: number;
    transFat: number;
    cholesterol: number;
    sodium: number;
    totalCarbs: number;
    fiber: number;
    sugars: number;
    protein: number;
    servingSize?: string;
  };

  @Column({ type: 'jsonb', name: 'health_score' })
  healthScore: {
    overallScore: number;
    sugarScore: number;
    fatScore: number;
    sodiumScore: number;
    calorieScore: number;
  };

  @Column({ name: 'confidence_level', nullable: true })
  confidenceLevel: string; // high/medium/low (for food scans)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
