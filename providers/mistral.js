import { buildPrompt } from '../core/analysis.js';
import {extractJson} from "./utils";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-large-latest";

export async function analyzeWithMistral(settings, structuredData, customTags) {
  const prompt = buildPrompt(structuredData, customTags);
  const { mistralApiKey } = settings;

  if (!mistralApiKey) {
    console.error("Mistral Error: API key is not set.");
    return null;
  }

  //console.log("Calling Mistral:", prompt);
  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${mistralApiKey}`
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          { role: "system", content: "You are an email analysis expert. Your task is to analyze the provided email data and respond only with a single, clean JSON object that strictly follows the requested schema. Do not include any conversational text, markdown formatting, or explanations in your response." },
          { role: "user", content: prompt }
        ],
        response_format: { "type": "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    //console.log("Mistral response", result);

    const rawText = result.choices[0].message.content;
    const jsonText = extractJson(rawText);
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Mistral Error:", error);
    return null;
  }
}