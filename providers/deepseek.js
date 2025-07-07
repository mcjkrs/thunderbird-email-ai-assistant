import { buildPrompt } from '../core/analysis.js';
import {extractJson} from "./utils";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

export async function analyzeWithDeepseek(settings, structuredData, customTags) {
  const prompt = buildPrompt(structuredData, customTags);
  const { deepseekApiKey } = settings;

  if (!deepseekApiKey) {
    console.error("DeepSeek Error: API key is not set.");
    return null;
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: "You are an email analysis expert. Your task is to analyze the provided email data and respond only with a single, clean JSON object that strictly follows the requested schema. Do not include any conversational text, markdown formatting, or explanations in your response." },
          { role: "user", content: prompt }
        ],
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    const rawText = result.choices[0].message.content;
    const jsonText = extractJson(rawText);

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("DeepSeek Error:", error);
    return null;
  }
}
