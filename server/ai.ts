/**
 * Unified AI provider
 * Priority: Ollama (local / offline-first) → Gemini (cloud) → mock fallback
 *
 * Set GEMINI_API_KEY in .env.local to enable Gemini.
 * OLLAMA_BASE_URL / OLLAMA_MODEL override the Ollama defaults.
 */

import { GoogleGenAI } from '@google/genai';
import {
  isOllamaAvailable,
  ollamaGenerate,
  listOllamaModels,
  OLLAMA_MODEL,
} from './ollama.js';

export type AIProvider = 'ollama' | 'gemini' | 'mock';

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function geminiGenerate(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });
  return (response.text ?? '').trim();
}

/**
 * Returns which provider will handle the next request.
 * Ollama check is live (network probe); Gemini check is env-key presence.
 */
export async function getActiveProvider(): Promise<AIProvider> {
  if (await isOllamaAvailable()) return 'ollama';
  if (isGeminiConfigured()) return 'gemini';
  return 'mock';
}

/**
 * Generate text using the best available provider.
 * Throws when both Ollama and Gemini fail — callers should catch and serve mock.
 */
export async function generateText(
  prompt: string,
): Promise<{ text: string; provider: AIProvider }> {
  const provider = await getActiveProvider();

  if (provider === 'ollama') {
    const text = await ollamaGenerate(prompt);
    return { text, provider: 'ollama' };
  }

  if (provider === 'gemini') {
    const text = await geminiGenerate(prompt);
    return { text, provider: 'gemini' };
  }

  throw new Error('No AI provider available');
}

export interface AIStatusResult {
  provider: AIProvider;
  ollama_available: boolean;
  gemini_available: boolean;
  active_model: string | null;
  available_models: string[];
}

export async function getAIStatus(): Promise<AIStatusResult> {
  const [ollamaOnline] = await Promise.all([isOllamaAvailable()]);
  const geminiOnline = isGeminiConfigured();
  const provider: AIProvider = ollamaOnline ? 'ollama' : geminiOnline ? 'gemini' : 'mock';
  const models = ollamaOnline ? await listOllamaModels() : [];
  const activeModel = ollamaOnline
    ? OLLAMA_MODEL
    : geminiOnline
    ? GEMINI_MODEL
    : null;

  return {
    provider,
    ollama_available: ollamaOnline,
    gemini_available: geminiOnline,
    active_model: activeModel,
    available_models: models,
  };
}
