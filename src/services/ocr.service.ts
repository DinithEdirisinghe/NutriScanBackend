import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

export interface NutritionData {
  calories?: number;
  totalFat?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  totalCarbohydrates?: number;
  dietaryFiber?: number;
  sugars?: number;
  protein?: number;
  servingSize?: string;
}

export class OCRService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_DELAY_MS = 1000;

  constructor() {
    // Initialize Gemini AI
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found. OCR will not work properly.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-flash-latest - the latest stable multimodal model
    // Supports text + images with good free tier limits
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    console.log('✅ Using Gemini model: gemini-flash-latest');
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Extract nutrition data from image using Google Gemini Vision API with retry logic
   */
  async processNutritionLabel(imagePath: string): Promise<NutritionData> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🤖 Attempt ${attempt}/${this.MAX_RETRIES}: Using Google Gemini Vision to analyze nutrition label...`);
        console.log('📸 Image path:', imagePath);

        // Read the image file
        const imageData = fs.readFileSync(imagePath);
        const base64Image = imageData.toString('base64');
        const mimeType = this.getMimeType(imagePath);

        // Create the prompt for Gemini
        const prompt = `You are a nutrition label analyzer. Analyze this image and extract ALL nutrition information you can find.

Return ONLY a valid JSON object with the following structure (use null for missing values):
{
  "servingSize": "text description of serving size",
  "calories": number,
  "totalFat": number in grams,
  "saturatedFat": number in grams,
  "transFat": number in grams,
  "cholesterol": number in mg,
  "sodium": number in mg,
  "totalCarbohydrates": number in grams,
  "dietaryFiber": number in grams,
  "sugars": number in grams,
  "protein": number in grams
}

IMPORTANT:
- Extract ONLY numeric values (no units in the JSON)
- If a value is not visible or unclear, use null
- Return ONLY the JSON object, no explanations
- Make sure the JSON is valid and parseable`;

        // Call Gemini Vision API
        const result = await this.model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
        ]);

        const response = await result.response;
        const text = response.text();
        
        console.log('🤖 Gemini raw response:', text);

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Failed to extract JSON from Gemini response');
        }

        const nutritionData: NutritionData = JSON.parse(jsonMatch[0]);
        
        console.log('✅ Nutrition data extracted by Gemini:', nutritionData);
        return nutritionData;

      } catch (error: any) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if it's a 503 (overloaded) error
        const is503Error = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('overloaded');
        
        if (is503Error && attempt < this.MAX_RETRIES) {
          const delayMs = this.INITIAL_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
          console.warn(`⚠️ Gemini API overloaded (503). Retrying in ${delayMs}ms... (Attempt ${attempt}/${this.MAX_RETRIES})`);
          await this.sleep(delayMs);
          continue; // Retry
        }
        
        // If it's not a 503 error, or we've exhausted retries, throw the error
        console.error(`❌ Gemini Vision Error (Attempt ${attempt}/${this.MAX_RETRIES}):`, error);
        
        if (attempt === this.MAX_RETRIES) {
          break; // Exit loop and throw error below
        }
      }
    }

    // If we get here, all retries failed
    throw new Error(`Failed to analyze nutrition label after ${this.MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return mimeTypes[ext] || 'image/jpeg';
  }
}

export default new OCRService();
