import type { NextApiRequest, NextApiResponse } from 'next';

const PROXY_URL = 'https://ygtgfqitctowlhkqomjw.supabase.co/functions/v1/afripay-proxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { phone, paymentMethod } = req.body;
  if (!phone || !paymentMethod) return res.status(400).json({ status: 'error', message: 'Missing params.' });

  const params = new URLSearchParams({
    request: 'transaction',
    action: 'getOTP',
    mobile: phone,
    payment_method: (paymentMethod as string).toUpperCase(),
  });

  try {
    const afripayRes = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const text = await afripayRes.text();
    const json = JSON.parse(text);
    return res.status(200).json(json);
  } catch {
    return res.status(500).json({ status: 'error', message: 'OTP request failed.' });
  }
}
