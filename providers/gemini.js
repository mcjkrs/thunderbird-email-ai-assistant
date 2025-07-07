import { buildPrompt } from '../core/analysis.js';

const GEMINI_MODEL = "gemini-1.5-flash-latest";

export async function analyzeWithGemini(settings, structuredData, customTags) {
  const prompt = buildPrompt(structuredData, customTags);
  const { geminiApiKey } = settings;

  if (!geminiApiKey) {
    console.error("Gemini Error: API key is not set.");
    return null;
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return JSON.parse(result.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}