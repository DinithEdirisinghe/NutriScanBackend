import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Enhanced nutrition data with AI-powered food context
 * This combines traditional nutrition facts with intelligent food analysis
 */
export interface EnhancedNutritionData {
  // Basic nutrition facts (from label or AI estimation)
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

  // AI-enhanced food context (NEW!)
  foodContext: {
    foodName: string;
    confidence: 'high' | 'medium' | 'low';
    
    // Food classification
    category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'processed' | 'fast-food' | 'dessert' | 'other';
    processingLevel: 'whole' | 'minimally-processed' | 'processed' | 'ultra-processed';
    
    // Cooking/preparation method
    cookingMethod?: 'raw' | 'steamed' | 'grilled' | 'baked' | 'fried' | 'boiled' | 'roasted' | 'none';
    
    // Sugar analysis
    sugarType: 'none' | 'natural' | 'added' | 'mixed';
    sugarSources?: string[]; // e.g., ["fruit", "honey"] or ["corn syrup", "table sugar"]
    
    // Fat analysis
    fatType: 'none' | 'healthy-unsaturated' | 'saturated' | 'trans' | 'mixed';
    fatSources?: string[]; // e.g., ["olive oil", "avocado"] or ["butter", "cream"]
    
    // Carbohydrate analysis
    carbType: 'none' | 'complex' | 'refined' | 'mixed';
    hasWholeGrains: boolean;
    
    // Health indicators
    isOrganic: boolean;
    hasFortification: boolean; // Added vitamins/minerals
    hasPreservatives: boolean;
    hasArtificialSweeteners: boolean;
    
    // Glycemic impact (for diabetics)
    glycemicImpact: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
    glycemicReasoning: string;
    
    // Overall food quality assessment
    overallQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor';
    qualityReasoning: string;
  };
}

export class EnhancedAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use Gemini Flash Latest with temperature=0 for deterministic responses
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0, // Make responses deterministic
        topP: 1,
        topK: 1,
      }
    });

    console.log('✅ Enhanced AI Service initialized with Gemini Flash Latest (deterministic mode)');
  }

  /**
   * Analyze multiple images (up to 3) and extract comprehensive nutrition data + food context
   */
  async analyzeFood(images: Array<{ base64: string; mimeType: string }>): Promise<EnhancedNutritionData> {
    try {
      console.log(`🔍 Analyzing ${images.length} image(s) with enhanced AI...`);

      const prompt = this.buildEnhancedPrompt();
      const imageParts = images.map(img => ({
        inlineData: {
          data: img.base64,
          mimeType: img.mimeType,
        },
      }));

      // Call Gemini with all images
      const result = await this.model.generateContent([prompt, ...imageParts]);
      const response = result.response;
      const text = response.text();

      console.log('🤖 AI Analysis Response (first 500 chars):', text.substring(0, 500));

      // Parse and validate response
      const enhancedData = this.parseAIResponse(text);

      console.log('✅ Food identified:', enhancedData.foodContext.foodName);
      console.log('📊 Processing level:', enhancedData.foodContext.processingLevel);
      console.log('🍬 Sugar type:', enhancedData.foodContext.sugarType);
      console.log('🥑 Fat type:', enhancedData.foodContext.fatType);
      console.log('📈 Glycemic impact:', enhancedData.foodContext.glycemicImpact);

      return enhancedData;

    } catch (error) {
      console.error('❌ Enhanced AI analysis failed:', error);
      throw new Error('Failed to analyze food images. Please try again.');
    }
  }

  private buildEnhancedPrompt(): string {
    return `You are an expert nutritionist and food scientist. Analyze the provided image(s) and extract COMPREHENSIVE information about the food.

INSTRUCTIONS:
1. If there's a nutrition label, extract exact values from it
2. If no label, estimate nutrition based on visual analysis
3. Identify the food type, ingredients, and preparation method
4. Assess sugar sources (natural from fruit vs added sugar)
5. Assess fat quality (omega-3, unsaturated vs saturated, trans)
6. Assess carb quality (whole grain vs refined)
7. Determine glycemic impact (how quickly it raises blood sugar)
8. Rate overall food quality

Return ONLY valid JSON (no markdown, no explanations):

{
  "calories": 250,
  "totalFat": 12.5,
  "saturatedFat": 3.5,
  "transFat": 0,
  "cholesterol": 45,
  "sodium": 580,
  "totalCarbohydrates": 25,
  "dietaryFiber": 3,
  "sugars": 8,
  "protein": 15,
  "servingSize": "1 burger (200g)",
  
  "foodContext": {
    "foodName": "Grilled Chicken Burger with Whole Wheat Bun",
    "confidence": "high",
    
    "category": "fast-food",
    "processingLevel": "processed",
    
    "cookingMethod": "grilled",
    
    "sugarType": "added",
    "sugarSources": ["high fructose corn syrup in bun", "ketchup"],
    
    "fatType": "mixed",
    "fatSources": ["chicken (lean protein)", "mayo (saturated)", "cheese (saturated)"],
    
    "carbType": "refined",
    "hasWholeGrains": false,
    
    "isOrganic": false,
    "hasFortification": false,
    "hasPreservatives": true,
    "hasArtificialSweeteners": false,
    
    "glycemicImpact": "high",
    "glycemicReasoning": "Refined white bun causes rapid blood sugar spike. Low fiber (3g) can't offset 25g carbs.",
    
    "overallQuality": "fair",
    "qualityReasoning": "Grilled chicken is good protein, but refined bun, added sugars, and high sodium lower quality. Better than fried options."
  }
}

FIELD DEFINITIONS:

category: "protein" (meat, fish, eggs), "vegetable", "fruit", "grain", "dairy", "snack", "beverage", "processed", "fast-food", "dessert", "other"

processingLevel:
- "whole": unprocessed (raw vegetables, fruits, nuts)
- "minimally-processed": basic cooking/prep (grilled chicken, steamed broccoli)
- "processed": some industrial processing (bread, cheese, canned goods)
- "ultra-processed": heavily processed (chips, soda, candy, frozen dinners)

cookingMethod: "raw", "steamed", "grilled", "baked", "fried", "boiled", "roasted", "none"

sugarType:
- "none": 0-0.5g sugar
- "natural": from fruit, milk, vegetables
- "added": table sugar, corn syrup, honey, agave
- "mixed": both natural and added

fatType:
- "none": < 1g fat
- "healthy-unsaturated": omega-3, olive oil, avocado, nuts
- "saturated": butter, cream, fatty meat, cheese
- "trans": partially hydrogenated oils (very bad)
- "mixed": combination

carbType:
- "none": < 3g carbs
- "complex": whole grains, beans, vegetables (slow digestion)
- "refined": white flour, white rice, sugar (fast digestion)
- "mixed": combination

glycemicImpact (how fast it raises blood sugar - BE CONSISTENT):
- "very-low": < 10g net carbs OR high fiber (>8g) with low carbs (leafy greens, nuts, eggs)
- "low": 10-20g net carbs with good fiber (>5g) (berries, beans, legumes)
- "medium": 20-35g net carbs with moderate fiber (2-5g) (sweet potato, brown rice, oatmeal)
- "high": 35-50g net carbs with low fiber (<2g) (white bread, pasta, most packaged snacks)
- "very-high": >50g net carbs OR >30g pure sugar OR sugary beverages (soda, candy, energy drinks, fruit juice)

GLYCEMIC RULES FOR CONSISTENCY:
1. ALL sugary beverages (soda, sweetened tea, energy drinks) = "very-high" (no fiber, pure liquid sugar)
2. Pure sugar foods (candy, cookies with >20g sugar) = "very-high"
3. White bread, white rice, refined grains with low fiber = "high"
4. Whole grains with good fiber = "medium" or "low"
5. Non-starchy vegetables, leafy greens = "very-low"
6. Calculate: net carbs = total carbs - fiber. Use this for classification.

overallQuality: "excellent" (whole foods, nutrient-dense), "good" (mostly healthy), "fair" (some concerns), "poor" (highly processed), "very-poor" (junk food)

ACCURACY RULES:
- Be conservative with glycemic impact assessment
- Natural sugars in whole fruits = lower glycemic impact (fiber slows absorption)
- Fried foods = always "processed" or "ultra-processed"
- Whole grains = "complex" carbs, white flour = "refined"
- Salmon, avocado, nuts = "healthy-unsaturated" fats
- Estimate nutrition if no label visible
- If uncertain, set confidence to "medium" or "low"`;
  }

  private parseAIResponse(text: string): EnhancedNutritionData {
    try {
      // Clean response (remove markdown if present)
      let cleanText = text.trim();
      cleanText = cleanText.replace(/```json\s*/g, '');
      cleanText = cleanText.replace(/```\s*/g, '');
      cleanText = cleanText.trim();

      const data = JSON.parse(cleanText);

      // Validate and return
      return {
        calories: data.calories || undefined,
        totalFat: data.totalFat || undefined,
        saturatedFat: data.saturatedFat || undefined,
        transFat: data.transFat || undefined,
        cholesterol: data.cholesterol || undefined,
        sodium: data.sodium || undefined,
        totalCarbohydrates: data.totalCarbohydrates || undefined,
        dietaryFiber: data.dietaryFiber || undefined,
        sugars: data.sugars || undefined,
        protein: data.protein || undefined,
        servingSize: data.servingSize || undefined,
        foodContext: {
          foodName: data.foodContext?.foodName || 'Unknown Food',
          confidence: data.foodContext?.confidence || 'low',
          category: data.foodContext?.category || 'other',
          processingLevel: data.foodContext?.processingLevel || 'processed',
          cookingMethod: data.foodContext?.cookingMethod,
          sugarType: data.foodContext?.sugarType || 'mixed',
          sugarSources: data.foodContext?.sugarSources || [],
          fatType: data.foodContext?.fatType || 'mixed',
          fatSources: data.foodContext?.fatSources || [],
          carbType: data.foodContext?.carbType || 'mixed',
          hasWholeGrains: data.foodContext?.hasWholeGrains || false,
          isOrganic: data.foodContext?.isOrganic || false,
          hasFortification: data.foodContext?.hasFortification || false,
          hasPreservatives: data.foodContext?.hasPreservatives || false,
          hasArtificialSweeteners: data.foodContext?.hasArtificialSweeteners || false,
          glycemicImpact: data.foodContext?.glycemicImpact || 'medium',
          glycemicReasoning: data.foodContext?.glycemicReasoning || '',
          overallQuality: data.foodContext?.overallQuality || 'fair',
          qualityReasoning: data.foodContext?.qualityReasoning || '',
        },
      };

    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      throw new Error('Invalid AI response format');
    }
  }
}

export default new EnhancedAIService();
