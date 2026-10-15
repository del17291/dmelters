import { GoogleGenAI } from '@google/genai';
import { buildLilouSystemInstruction } from '../src/data/deliaProfile.ts';

/**
 * Serverless fallback chat endpoint.
 * Provides text-based responses using gemini-3.8-flash and optional TTS audio using gemini-3.8-flash-lite-tts.
 * Used if microphone is disabled or if the user prefers text conversation.
 */
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. In Vercel, go to Settings -> Environment Variables and add GEMINI_API_KEY.',
    });
  }

  const { message, history = [], language = 'en', generateVoice = false } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'A message string is required.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = buildLilouSystemInstruction(language);

    // Format chat contents
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-8)) {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Prioritize fastest low-latency models: gemini-3.1-flash-lite responds in ~1s
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let response: any = null;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        if (response?.text) break;
      } catch (err: any) {
        console.warn(`Model ${model} failed (${err?.status || err?.message}), trying fallback...`);
        lastError = err;
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    const replyText = response.text || 'I apologize, but I could not formulate an answer right now.';

    let audioBase64: string | null = null;
    if (generateVoice) {
      try {
        const ttsResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [{ text: replyText }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Aoede' },
              },
            },
          },
        });
        audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      } catch (ttsErr) {
        console.warn('TTS generation skipped or failed:', ttsErr);
      }
    }

    return res.status(200).json({
      text: replyText,
      audio: audioBase64,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({
      error: 'Failed to generate answer: ' + (error?.message || String(error)),
    });
  }
}
