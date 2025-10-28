import { GoogleGenerativeAI } from '@google/generative-ai';
import { NutritionData } from './ocr.service';
import { HealthScore } from './scoring.service';

export interface UserProfile {
  bloodSugarMgDl?: number;
  ldlCholesterolMgDl?: number;
  weightKg?: number;
  heightCm?: number;
}

export interface AIAdvice {
  explanation: string;
  healthyAlternatives: string[];
  detailedAdvice: string;
}

export class AIAdviceService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found. AI advice will not work.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-flash-latest for fast, cost-effective responses
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    console.log('✅ AI Advice Service initialized with Gemini');
  }

  /**
   * Generate comprehensive health advice based on nutrition data and user profile
   */
  async generateHealthAdvice(
    nutritionData: NutritionData,
    healthScore: HealthScore,
    userProfile?: UserProfile
  ): Promise<AIAdvice> {
    try {
      console.log('🤖 Generating AI health advice...');

      // Build user health context
      const userHealthContext = this.buildUserHealthContext(userProfile);

      // Create comprehensive prompt
      const prompt = `You are a professional nutritionist and health advisor. Analyze this nutrition label and provide personalized health advice.

**PRODUCT NUTRITION DATA:**
- Serving Size: ${nutritionData.servingSize || 'Not specified'}
- Calories: ${nutritionData.calories || 0}
- Total Fat: ${nutritionData.totalFat || 0}g
- Saturated Fat: ${nutritionData.saturatedFat || 0}g
- Trans Fat: ${nutritionData.transFat || 0}g
- Cholesterol: ${nutritionData.cholesterol || 0}mg
- Sodium: ${nutritionData.sodium || 0}mg
- Total Carbohydrates: ${nutritionData.totalCarbohydrates || 0}g
- Dietary Fiber: ${nutritionData.dietaryFiber || 0}g
- Sugars: ${nutritionData.sugars || 0}g
- Protein: ${nutritionData.protein || 0}g

**HEALTH SCORE:** ${healthScore.overallScore}/100 (${healthScore.category})

**SCORE BREAKDOWN:**
- Sugar Score: ${healthScore.breakdown.sugarScore}/100
- Fat Score: ${healthScore.breakdown.fatScore}/100
- Sodium Score: ${healthScore.breakdown.sodiumScore}/100
- Calorie Score: ${healthScore.breakdown.calorieScore}/100

**CURRENT WARNINGS:**
${healthScore.warnings.map(w => `- ${w}`).join('\n')}

**USER HEALTH PROFILE:**
${userHealthContext}

**YOUR TASK:**
Provide a detailed, personalized health analysis in the following format:

1. **EXPLANATION (2-3 sentences):** Explain why this product received this score, focusing on the most concerning nutrients based on the user's health profile.

2. **HEALTHY ALTERNATIVES (exactly 3 items):** Suggest specific healthier alternatives. Each alternative should be realistic, specific, and address the main health concerns. Format: "• [Alternative name] - [Brief reason why it's better]"

3. **DETAILED ADVICE (3-4 sentences):** Provide actionable, personalized health advice. If the user has specific health conditions (high blood sugar, high LDL, overweight), emphasize how this product affects THEIR condition. Be encouraging but honest.

**IMPORTANT:**
- Be specific and practical
- If the user has health risks, prioritize advice related to their condition
- Keep tone professional but friendly
- Focus on the most important health concerns
- Don't use markdown formatting (no ** or # symbols)`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('🤖 AI Response received:', text.substring(0, 200) + '...');

      // Parse the AI response
      const advice = this.parseAIResponse(text);

      console.log('✅ AI advice generated successfully');
      return advice;

    } catch (error) {
      console.error('❌ Error generating AI advice:', error);
      
      // Return fallback advice if AI fails
      return {
        explanation: `This product scored ${healthScore.overallScore}/100. ${healthScore.warnings[0] || 'Consider the nutritional content carefully.'}`,
        healthyAlternatives: [
          'Fresh fruits and vegetables',
          'Whole grain products',
          'Lean proteins like chicken or fish'
        ],
        detailedAdvice: 'For personalized nutrition advice, consult with a registered dietitian or nutritionist.'
      };
    }
  }

  /**
   * Build user health context string for the AI prompt
   */
  private buildUserHealthContext(userProfile?: UserProfile): string {
    if (!userProfile) {
      return 'No specific health profile provided. Provide general nutrition advice.';
    }

    const context: string[] = [];

    if (userProfile.bloodSugarMgDl) {
      if (userProfile.bloodSugarMgDl >= 126) {
        context.push(`⚠️ DIABETES: Blood sugar is ${userProfile.bloodSugarMgDl} mg/dL (diabetic range). PRIORITIZE sugar content warnings.`);
      } else if (userProfile.bloodSugarMgDl >= 100) {
        context.push(`⚠️ PRE-DIABETES: Blood sugar is ${userProfile.bloodSugarMgDl} mg/dL (pre-diabetic range). Focus on sugar content.`);
      } else {
        context.push(`✓ Normal blood sugar: ${userProfile.bloodSugarMgDl} mg/dL`);
      }
    }

    if (userProfile.ldlCholesterolMgDl) {
      if (userProfile.ldlCholesterolMgDl >= 190) {
        context.push(`⚠️ VERY HIGH LDL: ${userProfile.ldlCholesterolMgDl} mg/dL. PRIORITIZE saturated fat warnings.`);
      } else if (userProfile.ldlCholesterolMgDl >= 160) {
        context.push(`⚠️ HIGH LDL: ${userProfile.ldlCholesterolMgDl} mg/dL. Focus on saturated fat content.`);
      } else if (userProfile.ldlCholesterolMgDl >= 130) {
        context.push(`⚠️ Borderline high LDL: ${userProfile.ldlCholesterolMgDl} mg/dL. Watch saturated fat.`);
      } else {
        context.push(`✓ Normal LDL cholesterol: ${userProfile.ldlCholesterolMgDl} mg/dL`);
      }
    }

    if (userProfile.weightKg && userProfile.heightCm) {
      const heightM = userProfile.heightCm / 100;
      const bmi = userProfile.weightKg / (heightM * heightM);
      
      if (bmi >= 30) {
        context.push(`⚠️ OBESITY: BMI ${bmi.toFixed(1)}. PRIORITIZE calorie content.`);
      } else if (bmi >= 25) {
        context.push(`⚠️ OVERWEIGHT: BMI ${bmi.toFixed(1)}. Focus on calorie content.`);
      } else if (bmi >= 18.5) {
        context.push(`✓ Normal weight: BMI ${bmi.toFixed(1)}`);
      } else {
        context.push(`⚠️ Underweight: BMI ${bmi.toFixed(1)}`);
      }
    }

    if (context.length === 0) {
      return 'Limited health profile data. Provide general nutrition advice.';
    }

    return context.join('\n');
  }

  /**
   * Parse AI response into structured advice
   */
  private parseAIResponse(text: string): AIAdvice {
    try {
      // Split response into sections
      const sections = text.split(/\d\.\s+/);
      
      let explanation = '';
      let healthyAlternatives: string[] = [];
      let detailedAdvice = '';

      // Try to extract sections
      for (const section of sections) {
        const lowerSection = section.toLowerCase();
        
        if (lowerSection.includes('explanation')) {
          explanation = section.replace(/explanation:?/i, '').trim();
        } else if (lowerSection.includes('alternatives') || lowerSection.includes('alternative')) {
          // Extract bullet points
          const alternatives = section.match(/[•\-\*]\s*([^\n]+)/g) || [];
          healthyAlternatives = alternatives
            .map(alt => alt.replace(/^[•\-\*]\s*/, '').trim())
            .filter(alt => alt.length > 0)
            .slice(0, 3); // Take first 3
        } else if (lowerSection.includes('advice') || lowerSection.includes('detailed')) {
          detailedAdvice = section.replace(/detailed advice:?/i, '').trim();
        }
      }

      // Fallback: if parsing failed, use the whole text
      if (!explanation && !detailedAdvice) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        explanation = sentences.slice(0, 2).join('. ') + '.';
        detailedAdvice = sentences.slice(2).join('. ') + '.';
      }

      // Ensure we have at least 3 alternatives
      if (healthyAlternatives.length === 0) {
        healthyAlternatives = [
          'Fresh fruits and vegetables',
          'Whole grain products',
          'Lean proteins like chicken or fish'
        ];
      }

      return {
        explanation: explanation || 'This product has been analyzed based on its nutritional content.',
        healthyAlternatives,
        detailedAdvice: detailedAdvice || 'Consider your overall dietary patterns and health goals when making food choices.'
      };

    } catch (error) {
      console.error('❌ Error parsing AI response:', error);
      
      // Return fallback
      return {
        explanation: text.substring(0, 200),
        healthyAlternatives: [
          'Fresh fruits and vegetables',
          'Whole grain products',
          'Lean proteins'
        ],
        detailedAdvice: text.substring(200)
      };
    }
  }
}

export default new AIAdviceService();
