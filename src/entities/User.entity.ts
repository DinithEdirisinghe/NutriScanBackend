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

  // Health Profile Fields
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  blood_sugar_mg_dl?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ldl_cholesterol_mg_dl?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight_kg?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height_cm?: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
