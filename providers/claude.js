import { buildPrompt } from '../core/analysis.js';
import {extractJson} from "./utils";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-0";
const CLAUDE_API_VERSION = "2023-06-01";

export async function analyzeWithClaude(settings, structuredData, customTags) {
  const prompt = buildPrompt(structuredData, customTags);
  const { claudeApiKey } = settings;

  if (!claudeApiKey) {
    console.error("Claude Error: API key is not set.");
    return null;
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-dangerous-direct-browser-access': true,
        'anthropic-version': CLAUDE_API_VERSION
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: "You are an email analysis expert. Your task is to analyze the provided email data and respond only with a single, clean JSON object that strictly follows the requested schema. Do not include any conversational text, markdown formatting, or explanations in your response.",
        messages: [
          { role: "user", content: prompt }
        ]
      }),
    });

    if (!response.ok) {
      console.log(response);
      let text = await response.text();
      console.log(text);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const rawText = result.content[0].text;
    const jsonText = extractJson(rawText);

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Claude Error:", error);
    return null;
  }
}