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
      where: { id: req.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      blood_sugar_mg_dl: user.blood_sugar_mg_dl,
      ldl_cholesterol_mg_dl: user.ldl_cholesterol_mg_dl,
      weight_kg: user.weight_kg,
      height_cm: user.height_cm,
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
    const { blood_sugar_mg_dl, ldl_cholesterol_mg_dl, weight_kg, height_cm } =
      req.body;

    const user = await userRepository.findOne({
      where: { id: req.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update only provided fields
    if (blood_sugar_mg_dl !== undefined)
      user.blood_sugar_mg_dl = blood_sugar_mg_dl;
    if (ldl_cholesterol_mg_dl !== undefined)
      user.ldl_cholesterol_mg_dl = ldl_cholesterol_mg_dl;
    if (weight_kg !== undefined) user.weight_kg = weight_kg;
    if (height_cm !== undefined) user.height_cm = height_cm;

    await userRepository.save(user);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        blood_sugar_mg_dl: user.blood_sugar_mg_dl,
        ldl_cholesterol_mg_dl: user.ldl_cholesterol_mg_dl,
        weight_kg: user.weight_kg,
        height_cm: user.height_cm,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
