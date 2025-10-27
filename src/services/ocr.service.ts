import Tesseract from 'tesseract.js';
import sharp from 'sharp';
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
  /**
   * Preprocess image to improve OCR accuracy
   */
  private async preprocessImage(imagePath: string): Promise<string> {
    try {
      console.log('🖼️ Preprocessing image for better OCR...');
      
      const ext = path.extname(imagePath);
      const preprocessedPath = imagePath.replace(ext, '-processed.png');
      
      await sharp(imagePath)
        .grayscale() // Convert to grayscale
        .normalize() // Improve contrast
        .sharpen() // Sharpen edges for better text recognition
        .resize(3000, 3000, { // Upscale to improve text clarity
          fit: 'inside',
          withoutEnlargement: false
        })
        .threshold(128) // Convert to pure black and white
        .toFile(preprocessedPath);
      
      console.log('✅ Image preprocessed:', preprocessedPath);
      return preprocessedPath;
    } catch (error) {
      console.error('❌ Image preprocessing error:', error);
      // Return original if preprocessing fails
      return imagePath;
    }
  }

  /**
   * Extract text from image using Tesseract OCR with preprocessing
   */
  async extractText(imagePath: string): Promise<string> {
    let preprocessedPath: string | null = null;
    
    try {
      console.log('🔍 Starting OCR on image:', imagePath);
      
      // Preprocess image first
      preprocessedPath = await this.preprocessImage(imagePath);
      
      const result = await Tesseract.recognize(
        preprocessedPath,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`📊 OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      const extractedText = result.data.text;
      console.log('✅ OCR Complete. Extracted text length:', extractedText.length);
      console.log('📝 Full extracted text:\n', extractedText);
      
      // Clean up preprocessed file
      if (preprocessedPath && preprocessedPath !== imagePath && fs.existsSync(preprocessedPath)) {
        fs.unlinkSync(preprocessedPath);
        console.log('🗑️ Cleaned up preprocessed file');
      }
      
      return extractedText;
    } catch (error) {
      console.error('❌ OCR Error:', error);
      
      // Clean up preprocessed file on error
      if (preprocessedPath && preprocessedPath !== imagePath && fs.existsSync(preprocessedPath)) {
        fs.unlinkSync(preprocessedPath);
      }
      
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Parse nutrition values from extracted text with fuzzy matching for OCR errors
   */
  parseNutritionData(text: string): NutritionData {
    console.log('🔍 Parsing nutrition data from text...');
    
    const nutritionData: NutritionData = {};

    // Clean up text: remove extra spaces, normalize, remove special chars
    const cleanText = text
      .replace(/[°™§£\-_=»]/g, ' ') // Remove special chars
      .replace(/\s+/g, ' ') // Normalize spaces
      .toLowerCase();

    console.log('🧹 Cleaned text:', cleanText);

    // Extract Serving Size - flexible pattern
    const servingSizeMatch = cleanText.match(/s[eio]rv[io]ng\s+s[io]ze[:\s]+([^\n]+)/i);
    if (servingSizeMatch) {
      nutritionData.servingSize = servingSizeMatch[1].trim();
      console.log('✅ Found serving size:', nutritionData.servingSize);
    }

    // Extract Calories - very flexible (calor, calov, calo, cal)
    const caloriesMatch = cleanText.match(/cal[ov]?[rio]?[ie]s?[:\s»°]+(\d+)/i);
    if (caloriesMatch) {
      nutritionData.calories = parseInt(caloriesMatch[1]);
      console.log('✅ Found calories:', nutritionData.calories);
    }

    // Extract Total Fat - flexible (to tel, total, totel)
    const totalFatMatch = cleanText.match(/t[o0][t\s]*[e3]?l?\s+f[a4][dt][:\s°]+(\d+)/i);
    if (totalFatMatch) {
      nutritionData.totalFat = parseFloat(totalFatMatch[1]);
      console.log('✅ Found total fat:', nutritionData.totalFat);
    }

    // Extract Saturated Fat - flexible (satureded, saturated, satur)
    const saturatedFatMatch = cleanText.match(/satur[ae]?t?[eo]?d?[e]?d?\s+f[a4][dt][:\s°]+(\d+)/i);
    if (saturatedFatMatch) {
      nutritionData.saturatedFat = parseFloat(saturatedFatMatch[1]);
      console.log('✅ Found saturated fat:', nutritionData.saturatedFat);
    }

    // Extract Trans Fat - flexible
    const transFatMatch = cleanText.match(/tr[a4]ns\s+f[a4][dt][:\s°\-]+(\d+)/i);
    if (transFatMatch) {
      nutritionData.transFat = parseFloat(transFatMatch[1]);
      console.log('✅ Found trans fat:', nutritionData.transFat);
    }

    // Extract Cholesterol - flexible (choles, choles tevol)
    const cholesterolMatch = cleanText.match(/ch[o0]les[t\s]*[te]?[rv]?[o0]?l?[:\s]+(\d+)/i);
    if (cholesterolMatch) {
      nutritionData.cholesterol = parseInt(cholesterolMatch[1]);
      console.log('✅ Found cholesterol:', nutritionData.cholesterol);
    }

    // Extract Sodium - flexible
    const sodiumMatch = cleanText.match(/s[o0]d[i!l]um[:\s=°§]+(\d+)/i);
    if (sodiumMatch) {
      nutritionData.sodium = parseInt(sodiumMatch[1]);
      console.log('✅ Found sodium:', nutritionData.sodium);
    }

    // Extract Total Carbohydrates - flexible
    const carbsMatch = cleanText.match(/t[o0]t[ae]?l?\s+c[a4]rb[o0]?h?[yx]?d?r?[ae]?t?[e3]?s?[:\s°]+(\d+)/i);
    if (carbsMatch) {
      nutritionData.totalCarbohydrates = parseFloat(carbsMatch[1]);
      console.log('✅ Found carbohydrates:', nutritionData.totalCarbohydrates);
    }

    // Extract Dietary Fiber - flexible (fibey, fiber, fibre)
    const fiberMatch = cleanText.match(/d[i!l][e3]t[ae]ry\s+f[i!l]b[e3][ry][:\s°«]+(\d+)/i);
    if (fiberMatch) {
      nutritionData.dietaryFiber = parseFloat(fiberMatch[1]);
      console.log('✅ Found fiber:', nutritionData.dietaryFiber);
    }

    // Extract Sugars - flexible (sugers, sugars, sugar)
    const sugarsMatch = cleanText.match(/s[u]?g[e3][r]?s?[:\s°ti]+(\d+)/i);
    if (sugarsMatch) {
      nutritionData.sugars = parseFloat(sugarsMatch[1]);
      console.log('✅ Found sugars:', nutritionData.sugars);
    }

    // Extract Protein - flexible
    const proteinMatch = cleanText.match(/pr[o0]t[e3][i!l]n[:\s°]+(\d+)/i);
    if (proteinMatch) {
      nutritionData.protein = parseFloat(proteinMatch[1]);
      console.log('✅ Found protein:', nutritionData.protein);
    }

    console.log('✅ Final parsed nutrition data:', nutritionData);
    return nutritionData;
  }

  /**
   * Process image: Extract text and parse nutrition data
   */
  async processNutritionLabel(imagePath: string): Promise<NutritionData> {
    const extractedText = await this.extractText(imagePath);
    const nutritionData = this.parseNutritionData(extractedText);
    
    return nutritionData;
  }
}

export default new OCRService();
