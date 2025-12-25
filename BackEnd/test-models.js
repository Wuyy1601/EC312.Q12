import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    const list = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).apiKey; // Hack to check key
    console.log("API Key found:", API_KEY ? "Yes" : "No");

    // There isn't a direct listModels method in the helper (it's in the lower level lib), 
    // but let's try a simple generation with a few likely candidates.
    
    const models = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-001",
      "gemini-1.5-flash-002",
      "gemini-1.5-pro",
      "gemini-pro",
      "gemini-pro-vision",
      "gemini-2.0-flash-exp",
      "gemini-2.5-flash" // User saw this in dashboard
    ];

    for (const modelName of models) {
      console.log(`Testing ${modelName}...`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`✅ ${modelName}: SUCCESS`);
      } catch (error) {
         if (error.message.includes("404")) {
           console.log(`❌ ${modelName}: 404 Not Found`);
         } else if (error.message.includes("429")) {
           console.log(`⚠️ ${modelName}: 429 Rate Limit (Exists but quota exceeded)`);
         } else {
           console.log(`❌ ${modelName}: Error ${error.message}`);
         }
      }
    }

  } catch (error) {
    console.error("Fatal error:", error);
  }
}

listModels();
