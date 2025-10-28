import { GoogleGenerativeAI } from '@google/generative-ai';

// Food recognition result
interface FoodRecognitionResult {
  foodName: string;
  confidence: 'high' | 'medium' | 'low';
  nutritionPer100g: {
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
  };
}

export class FoodRecognitionService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    console.log('✅ Food Recognition Service initialized with Gemini 2.5 Flash');
  }

  async recognizeAndAnalyzeFood(imageBase64: string): Promise<FoodRecognitionResult> {
    try {
      console.log('🍔 Starting food recognition and nutrition analysis...');

      const prompt = `You are a professional nutritionist and food expert. Analyze this food image carefully.

TASK:
1. Identify what food item(s) are in the image
2. Provide standard/average nutrition values per 100g for this food
3. Rate your confidence level (high/medium/low)

IMPORTANT RULES:
- Provide nutrition for a STANDARD/TYPICAL version of this food
- Use average values from reputable nutrition databases (USDA, etc.)
- If multiple items, estimate for the main/largest item
- Be conservative with confidence - use "medium" or "low" if uncertain
- All values must be realistic and based on nutritional science

Return ONLY valid JSON in this EXACT format (no markdown, no extra text):
{
  "foodName": "Chicken Burger with Lettuce and Tomato",
  "confidence": "high",
  "nutritionPer100g": {
    "calories": 250,
    "totalFat": 12.5,
    "saturatedFat": 3.5,
    "transFat": 0.1,
    "cholesterol": 45,
    "sodium": 580,
    "totalCarbs": 25.3,
    "fiber": 2.1,
    "sugars": 4.2,
    "protein": 15.8
  }
}

VALIDATION:
- All numbers must be realistic (e.g., calories 50-900, protein 0-50, etc.)
- Saturated fat should be less than total fat
- Trans fat is usually 0-2g
- Fiber should be less than total carbs
- Sugars should be less than total carbs`;

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = response.text();

      console.log('🤖 Gemini raw response:', text);

      // Parse JSON response
      const foodData = this.parseGeminiResponse(text);

      console.log('✅ Food recognized:', foodData.foodName);
      console.log('📊 Confidence:', foodData.confidence);
      console.log('🍽️ Nutrition per 100g:', foodData.nutritionPer100g);

      return foodData;

    } catch (error) {
      console.error('❌ Food recognition error:', error);
      throw new Error('Failed to recognize food from image. Please try again.');
    }
  }

  private parseGeminiResponse(text: string): FoodRecognitionResult {
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim();
      cleanText = cleanText.replace(/```json\s*/g, '');
      cleanText = cleanText.replace(/```\s*/g, '');
      cleanText = cleanText.trim();

      const data = JSON.parse(cleanText);

      // Validate required fields
      if (!data.foodName || !data.confidence || !data.nutritionPer100g) {
        throw new Error('Missing required fields in AI response');
      }

      // Validate confidence level
      if (!['high', 'medium', 'low'].includes(data.confidence)) {
        data.confidence = 'medium'; // Default to medium if invalid
      }

      // Validate nutrition values
      const nutrition = data.nutritionPer100g;
      const validatedNutrition = {
        calories: this.validateNumber(nutrition.calories, 0, 900),
        totalFat: this.validateNumber(nutrition.totalFat, 0, 100),
        saturatedFat: this.validateNumber(nutrition.saturatedFat, 0, 50),
        transFat: this.validateNumber(nutrition.transFat, 0, 10),
        cholesterol: this.validateNumber(nutrition.cholesterol, 0, 500),
        sodium: this.validateNumber(nutrition.sodium, 0, 5000),
        totalCarbs: this.validateNumber(nutrition.totalCarbs, 0, 100),
        fiber: this.validateNumber(nutrition.fiber, 0, 50),
        sugars: this.validateNumber(nutrition.sugars, 0, 100),
        protein: this.validateNumber(nutrition.protein, 0, 100),
      };

      return {
        foodName: data.foodName,
        confidence: data.confidence,
        nutritionPer100g: validatedNutrition,
      };

    } catch (error) {
      console.error('❌ Failed to parse Gemini response:', error);
      console.error('Raw text:', text);

      // Fallback response
      return {
        foodName: 'Unknown Food Item',
        confidence: 'low',
        nutritionPer100g: {
          calories: 200,
          totalFat: 10,
          saturatedFat: 3,
          transFat: 0,
          cholesterol: 30,
          sodium: 400,
          totalCarbs: 20,
          fiber: 2,
          sugars: 5,
          protein: 10,
        },
      };
    }
  }

  private validateNumber(value: any, min: number, max: number): number {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    if (num < min) return min;
    if (num > max) return max;
    return Math.round(num * 10) / 10; // Round to 1 decimal
  }
}

// Export singleton instance
export default new FoodRecognitionService();
