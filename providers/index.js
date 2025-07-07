import { analyzeWithOllama } from './ollama.js';
import { analyzeWithOpenAI } from './openai.js';
import { analyzeWithGemini } from './gemini.js';
import { analyzeWithClaude } from './claude.js';
import { analyzeWithMistral } from './mistral.js';

import { analyzeWithDeepseek } from './deepseek.js';

export const PROVIDER_ENGINES = {
  ollama: analyzeWithOllama,
  openai: analyzeWithOpenAI,
  gemini: analyzeWithGemini,
  claude: analyzeWithClaude,
  mistral: analyzeWithMistral,
  deepseek: analyzeWithDeepseek
};
