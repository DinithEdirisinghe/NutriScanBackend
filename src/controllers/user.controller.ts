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
      // Blood sugar & diabetes
      glucose: user.glucose,
      hba1c: user.hba1c,
      // Cholesterol & heart health
      ldl: user.ldl,
      hdl: user.hdl,
      triglycerides: user.triglycerides,
      // Blood pressure
      systolic: user.systolic,
      diastolic: user.diastolic,
      // Body metrics
      weight: user.weight,
      height: user.height,
      waist: user.waist,
      bmi: user.bmi,
      age: user.age,
      // Liver function
      alt: user.alt,
      ast: user.ast,
      ggt: user.ggt,
      // Kidney & inflammation
      creatinine: user.creatinine,
      crp: user.crp,
      uric_acid: user.uric_acid,
      // Scoring preferences
      scoringMode: user.scoringMode,
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
      // Blood sugar & diabetes
      glucose,
      hba1c,
      // Cholesterol & heart health
      ldl,
      hdl,
      triglycerides,
      // Blood pressure
      systolic,
      diastolic,
      // Body metrics
      weight,
      height,
      waist,
      bmi,
      age,
      // Liver function
      alt,
      ast,
      ggt,
      // Kidney & inflammation
      creatinine,
      crp,
      uric_acid,
      // Scoring preferences
      scoringMode,
    } = req.body;

    const user = await userRepository.findOne({
      where: { id: req.user?.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update only provided fields
    // Blood sugar & diabetes
    if (glucose !== undefined) user.glucose = glucose;
    if (hba1c !== undefined) user.hba1c = hba1c;
    // Cholesterol & heart health
    if (ldl !== undefined) user.ldl = ldl;
    if (hdl !== undefined) user.hdl = hdl;
    if (triglycerides !== undefined) user.triglycerides = triglycerides;
    // Blood pressure
    if (systolic !== undefined) user.systolic = systolic;
    if (diastolic !== undefined) user.diastolic = diastolic;
    // Body metrics
    if (weight !== undefined) user.weight = weight;
    if (height !== undefined) user.height = height;
    if (waist !== undefined) user.waist = waist;
    if (bmi !== undefined) user.bmi = bmi;
    if (age !== undefined) user.age = age;
    // Liver function
    if (alt !== undefined) user.alt = alt;
    if (ast !== undefined) user.ast = ast;
    if (ggt !== undefined) user.ggt = ggt;
    // Kidney & inflammation
    if (creatinine !== undefined) user.creatinine = creatinine;
    if (crp !== undefined) user.crp = crp;
    if (uric_acid !== undefined) user.uric_acid = uric_acid;
    // Scoring preferences
    if (scoringMode !== undefined) {
      // Validate scoring mode
      if (scoringMode === 'portion-aware' || scoringMode === 'per-100g') {
        user.scoringMode = scoringMode;
      }
    }

    await userRepository.save(user);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        // Blood sugar & diabetes
        glucose: user.glucose,
        hba1c: user.hba1c,
        // Cholesterol & heart health
        ldl: user.ldl,
        hdl: user.hdl,
        triglycerides: user.triglycerides,
        // Blood pressure
        systolic: user.systolic,
        diastolic: user.diastolic,
        // Body metrics
        weight: user.weight,
        height: user.height,
        waist: user.waist,
        bmi: user.bmi,
        age: user.age,
        // Liver function
        alt: user.alt,
        ast: user.ast,
        ggt: user.ggt,
        // Kidney & inflammation
        creatinine: user.creatinine,
        crp: user.crp,
        uric_acid: user.uric_acid,
        // Scoring preferences
        scoringMode: user.scoringMode,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
