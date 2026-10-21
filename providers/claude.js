import { buildPrompt } from '../core/analysis.js';
import {extractJson} from "./utils";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_DEFAULT_MODEL = "claude-haiku-5-5";
const CLAUDE_API_VERSION = "2023-06-01";

export async function analyzeWithClaude(settings, structuredData, customTags) {
  const prompt = buildPrompt(structuredData, customTags);
  const { claudeApiKey } = settings;
  const model = (settings.claudeModel || '').trim() || CLAUDE_DEFAULT_MODEL;

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
        model: model,
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
    const textBlock = (result.content || []).find(b => b.type === 'text');
    if (!textBlock) throw new Error('Claude returned no text block');
    const rawText = textBlock.text;
    const jsonText = extractJson(rawText);

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Claude Error:", error);
    return null;
  }
}