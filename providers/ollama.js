import { buildPrompt } from '../core/analysis.js';
import {extractJson} from "./utils";

export async function analyzeWithOllama(settings, structuredData, customTags) {
  const prompt = buildPrompt(structuredData, customTags);
  const { ollamaApiUrl, ollamaModel } = settings;
  //console.log(`Querying OLLAMA: ${prompt}`);

  try {
    const response = await fetch(ollamaApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        format: "json",
        stream: false
      }),
    });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);

    const result = await response.json();
    //console.log("LLM response:");
    //console.log(result.response);

    const rawText = result.response;
    const jsonText = extractJson(rawText);
    return JSON.parse(jsonText);

  } catch (error) {
    console.error(`Ollama Error (URL: ${ollamaApiUrl}, model: ${ollamaModel}):`, error);
    return null;
  }
}
