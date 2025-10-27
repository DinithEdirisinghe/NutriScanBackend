// Simple script to test which Gemini models are available
require('dotenv').config();
const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔑 Testing with API Key:', apiKey?.substring(0, 15) + '...');
console.log('\n📋 Fetching available models...\n');

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.models) {
        console.log('✅ AVAILABLE MODELS:\n');
        console.log('==========================================');
        
        response.models.forEach(model => {
          console.log(`\n📦 Model: ${model.name}`);
          console.log(`   Display Name: ${model.displayName || 'N/A'}`);
          console.log(`   Description: ${model.description || 'N/A'}`);
          console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
          
          // Check if it supports vision/images
          if (model.supportedGenerationMethods?.includes('generateContent')) {
            console.log(`   ✅ Supports generateContent - CAN USE THIS!`);
          }
        });
        
        console.log('\n==========================================');
        console.log('\n🎯 VISION MODELS (for images):');
        const visionModels = response.models.filter(m => 
          m.name.includes('vision') || 
          m.displayName?.toLowerCase().includes('vision') ||
          m.description?.toLowerCase().includes('vision') ||
          m.description?.toLowerCase().includes('image')
        );
        
        if (visionModels.length > 0) {
          visionModels.forEach(m => console.log(`  - ${m.name}`));
        } else {
          console.log('  ⚠️ No vision-specific models found');
          console.log('  Try using the latest gemini model with multimodal support');
        }
        
      } else {
        console.error('❌ Error:', response.error || response);
      }
    } catch (e) {
      console.error('❌ Failed to parse response:', e.message);
      console.log('Raw response:', data);
    }
  });
}).on('error', (e) => {
  console.error('❌ Request failed:', e.message);
});
