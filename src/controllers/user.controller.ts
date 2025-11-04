import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';

const userRepository = AppDataSource.getRepository(User);

/**
 * Get user profile
 * GET /api/user/profile
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await userRepository.findOne({
      where: { id: req.user?.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      // Health conditions
      hasDiabetes: user.hasDiabetes,
      hasHighCholesterol: user.hasHighCholesterol,
      hasHighBloodPressure: user.hasHighBloodPressure,
      // Body metrics
      weight: user.weight,
      height: user.height,
      bmi: user.bmi,
      bmiCategory: user.bmiCategory,
      isHealthy: user.isHealthy,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update user profile
 * PUT /api/user/profile
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      // Health conditions
      hasDiabetes,
      hasHighCholesterol,
      hasHighBloodPressure,
      // Body metrics
      weight,
      height,
    } = req.body;

    const user = await userRepository.findOne({
      where: { id: req.user?.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update only provided fields
    if (hasDiabetes !== undefined) user.hasDiabetes = hasDiabetes;
    if (hasHighCholesterol !== undefined) user.hasHighCholesterol = hasHighCholesterol;
    if (hasHighBloodPressure !== undefined) user.hasHighBloodPressure = hasHighBloodPressure;
    if (weight !== undefined) user.weight = weight;
    if (height !== undefined) user.height = height;

    await userRepository.save(user);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        hasDiabetes: user.hasDiabetes,
        hasHighCholesterol: user.hasHighCholesterol,
        hasHighBloodPressure: user.hasHighBloodPressure,
        weight: user.weight,
        height: user.height,
        bmi: user.bmi,
        bmiCategory: user.bmiCategory,
        isHealthy: user.isHealthy,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
