// server.js (CORRECTED for Gemini API)

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI } from "@google/genai"; // 💡 Using the correct SDK for Gemini

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Get the correct key from the .env file
const GEMINI_KEY = process.env.GEMINI_API_KEY; 

if (!GEMINI_KEY) {
  console.error("❌ ERROR: Missing GEMINI_API_KEY in .env file or it's empty.");
  process.exit(1);
}

// Initialize the Gemini Client
const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

// Endpoint for the frontend to call
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, kind } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    // System instruction to control style and ensure clean output
    const systemInstruction = kind === "poem"
      ? "You are a creative poet. Write a short poem with evocative imagery. Do not include any titles or introductory text."
      : "You are a storyteller. Write a short, vivid story. Do not include any titles or introductory text.";

    // Call the Gemini API using the official SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Fast and capable model
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 400,
        temperature: 0.8
      }
    });

    const content = response.text ?? "";
    
    if (content) {
        // Send the extracted text back to the frontend
        return res.json({ text: content }); 
    } else {
         return res.status(500).json({ error: "No text content was returned by the AI." });
    }
  } catch (err) {
    // Catch API errors (e.g., Invalid Key, Rate Limit)
    console.error("Gemini API Error:", err.message);
    
    // Check for common authentication errors
    let status = 500;
    if (err.message.includes('API_KEY_INVALID') || err.message.includes('401')) {
        status = 401;
    }
    
    return res.status(status).json({ 
      error: "Gemini API error occurred",
      details: err.message
    });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ Server running on http://localhost:${4000}`));