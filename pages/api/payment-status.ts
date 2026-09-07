import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ status: 'error' });

  const { data } = await supabase
    .from('payments')
    .select('status')
    .eq('client_token', token)
    .maybeSingle();

  return res.status(200).json({ status: data?.status ?? 'pending' });
}
