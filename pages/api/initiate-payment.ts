import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROXY_URL = 'https://ygtgfqitctowlhkqomjw.supabase.co/functions/v1/afripay-proxy';
const CALLBACK_URL = 'https://ygtgfqitctowlhkqomjw.supabase.co/functions/v1/afripay-callback';
const GATEWAY_FEE = 0.04;
const PLATFORM_FEE = 0.06;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { waiterId, amount, currency = 'BIF', phone, paymentMethod, otp } = req.body;

  if (!waiterId || !amount || amount < 100 || !phone || !paymentMethod) {
    return res.status(400).json({ status: 'error', message: 'Invalid parameters.' });
  }

  const waiterReceives = Math.round(amount * (1 - GATEWAY_FEE - PLATFORM_FEE));
  const gatewayFee = Math.round(amount * GATEWAY_FEE);
  const platformFee = Math.round(amount * PLATFORM_FEE);

  // 1. Insert pending tip
  const { data: tip, error: tipErr } = await supabase
    .from('tips')
    .insert({
      waiter_id: waiterId,
      amount: waiterReceives,
      currency,
      status: 'pending',
      is_anonymous: true,
    })
    .select('id')
    .single();

  if (tipErr || !tip) {
    return res.status(500).json({ status: 'error', message: 'Failed to create tip record.' });
  }

  // 2. Insert pending payment
  const clientToken = `tip_${tip.id}_${uuidv4().slice(0, 6)}`;
  await supabase.from('payments').insert({
    tip_id: tip.id,
    client_token: clientToken,
    tip_amount: waiterReceives,
    gateway_fee: gatewayFee,
    platform_fee: platformFee,
    customer_pays: amount,
    currency,
    status: 'pending',
    provider: 'afripay',
  });

  // 3. Call AfriPay C2B API via Supabase proxy (whitelisted IP)
  const params = new URLSearchParams({
    request: 'payment',
    payment_type: '3',
    app_id: process.env.AFRIPAY_APP_ID!,
    app_secret: process.env.AFRIPAY_APP_SECRET!,
    payment_method: paymentMethod.toUpperCase(),
    amount: String(amount),
    currency,
    initiator: phone,
    client_token: clientToken,
    comment: `Tip — amTips`,
    notify_url: CALLBACK_URL,
  });
  if (otp) params.set('otp', otp);

  const afripayRes = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const text = await afripayRes.text();
  let json: Record<string, unknown> = {};
  try { json = JSON.parse(text); } catch { /* non-JSON response */ }

  if (json.status === 'error' || json.status === 'failed') {
    return res.status(200).json({ status: 'error', message: json.message ?? 'Payment initiation failed.' });
  }

  return res.status(200).json({ status: 'success', clientToken });
}
