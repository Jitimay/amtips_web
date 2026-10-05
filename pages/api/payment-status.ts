import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ status: 'error', message: 'Missing token' });
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('[payment-status] Missing env vars:', {
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SERVICE_KEY,
    });
    return res.status(500).json({ status: 'error', message: 'Server misconfiguration' });
  }

  // Create client inside handler so env vars are always fresh
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data, error } = await supabase
    .from('payments')
    .select('status, transaction_ref, failure_reason')
    .eq('client_token', token)
    .maybeSingle();

  if (error) {
    console.error('[payment-status] DB error:', error.message);
    return res.status(200).json({ status: 'pending', error: error.message });
  }

  return res.status(200).json({
    status: data?.status ?? 'pending',
    transactionRef: data?.transaction_ref ?? null,
    failureReason: data?.failure_reason ?? null,
  });
}
