import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'nutriscore',
  synchronize: true, // Auto-create tables (disable in production!)
  logging: process.env.NODE_ENV === 'development',
  entities: [User],
  subscribers: [],
  migrations: [],
});
