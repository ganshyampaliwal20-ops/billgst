require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("API Key found:", !!apiKey, "starts with:", apiKey ? apiKey.substring(0, 5) : 'none');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent("Say hello world in JSON format like { \"message\": \"hello world\" }");
    console.log("Response text:", result.response.text());
    console.log("SUCCESS!");
  } catch (error) {
    console.error("API Error details:");
    console.error(error);
    process.exit(1);
  }
}

test();
