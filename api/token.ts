import { GoogleGenAI } from '@google/genai';

/**
 * Serverless handler for issuing short-lived ephemeral tokens for Gemini Live API.
 * Compatible with Vercel Serverless Functions and local Express server.
 * Never exposes the permanent GEMINI_API_KEY to the browser.
 */
export default async function handler(req: any, res: any) {
  // Allow CORS for local dev / cross-origin if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. In Vercel, go to Settings -> Environment Variables and add GEMINI_API_KEY.',
    });
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

    // Create an ephemeral token specifically for Gemini Live API WebSocket session
    const tokenRes = await ai.authTokens.create({
      config: {
        uses: 0, // 0 = unlimited connections during the validity period
        newSessionExpireTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes to initiate connection
        expireTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 60 minutes session duration
      },
    });

    if (!tokenRes?.name) {
      throw new Error('No token name received from Gemini authTokens service');
    }

    return res.status(200).json({
      token: tokenRes.name,
      expireTime: tokenRes.expireTime,
      model: 'models/gemini-3.8-live',
    });
  } catch (error: any) {
    console.error('Error generating ephemeral token:', error);
    return res.status(500).json({
      error: 'Failed to issue ephemeral Live API token: ' + (error?.message || String(error)),
    });
  }
}
