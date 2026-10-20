import type { NextApiRequest, NextApiResponse } from 'next';
import { AM_TIPS_SYSTEM_PROMPT } from '../../lib/support-knowledge';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers so mobile app and web clients can access seamlessly
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({
      error: 'GROQ_API_KEY is not configured on Vercel/server. Please add GROQ_API_KEY to your environment variables.',
    });
  }

  const { message, history } = req.body ?? {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Valid "message" string is required.' });
  }

  const cleanMessage = message.trim().slice(0, 1000);

  // Format valid conversation history (last 6 messages max to stay focused and fast)
  const validHistory: ChatMessage[] = [];
  if (Array.isArray(history)) {
    for (const item of history.slice(-6)) {
      if (item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string') {
        validHistory.push({
          role: item.role,
          content: item.content.slice(0, 1000),
        });
      }
    }
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: AM_TIPS_SYSTEM_PROMPT },
    ...validHistory,
    { role: 'user', content: cleanMessage },
  ];

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.2, // Low temperature for high accuracy & zero hallucinations
        max_tokens: 600,
      }),
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error('Groq API Error Response:', data);
      return res.status(groqResponse.status).json({
        error: data.error?.message || 'Error communicating with Groq API.',
      });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || '';

    return res.status(200).json({
      reply,
      model: data.model || 'llama-3.3-70b-versatile',
    });
  } catch (error: any) {
    console.error('Support Chat Server Error:', error);
    return res.status(500).json({
      error: 'Internal server error while processing support question.',
      details: error?.message,
    });
  }
}
