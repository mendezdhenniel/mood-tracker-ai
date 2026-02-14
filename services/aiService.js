import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getAIResponse = async (moodText) => {
  try {
    // FIX: Using 'gemini-1.5-flash-latest' to resolve the 404 error
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // This prompt forces language detection and accurate responses
    const prompt = `
      User input: "${moodText}"
      
      Instructions:
      1. Detect the language of the input.
      2. Provide a short, compassionate wellness tip (max 20 words).
      3. You MUST respond in the EXACT same language as the user.
      4. If the user asks a question like "ayos lang ba?", answer them supportively in that language.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();

  } catch (error) {
    // This logs the real error to your VS Code terminal for debugging
    console.error("AI SERVICE ERROR:", error);
    
    // Fallback is only used if the API is completely down
    return "I'm here for you. Please try again in a moment.";
  }
};