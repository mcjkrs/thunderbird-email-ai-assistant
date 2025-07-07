import { buildPrompt } from '../core/analysis.js';

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o";

export async function analyzeWithOpenAI(settings, structuredData, customTags) {
  const prompt = buildPrompt(structuredData, customTags);
  const { openaiApiKey } = settings;

  if (!openaiApiKey) {
    console.error("OpenAI Error: API key is not set.");
    return null;
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
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
    return JSON.parse(result.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI Error:", error);
    return null;
  }
}