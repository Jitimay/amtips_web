import type { NextApiRequest, NextApiResponse } from 'next';

const PROXY_URL = 'https://ygtgfqitctowlhkqomjw.supabase.co/functions/v1/afripay-proxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { currency = 'BIF' } = req.query;

  const params = new URLSearchParams({
    request: 'payment_currencies',
    action: 'list_by_currency',
    currency: currency as string,
    app_id: process.env.AFRIPAY_APP_ID!,
    app_secret: process.env.AFRIPAY_APP_SECRET!,
  });

  try {
    const afripayRes = await fetch(`${PROXY_URL}?${params.toString()}`);
    const text = await afripayRes.text();
    const decoded = JSON.parse(text);

    const list: unknown[] = Array.isArray(decoded)
      ? decoded
      : Array.isArray(decoded?.list)
      ? decoded.list
      : Array.isArray(decoded?.data)
      ? decoded.data
      : [];

    const methods = (list as Record<string, unknown>[])
      .filter(
        (m) =>
          m.enable_on_collection === 1 ||
          m.enable_on_collection === '1' ||
          m.enable_on_collection === true
      )
      .map((m) => ({
        id: m.payment_method_name ?? m.slug ?? m.id ?? '',
        name: m.payment_method_name ?? m.name ?? '',
        icon_url: m.icon ?? null,
        requires_otp:
          m.otp_on_collection === 1 ||
          m.otp_on_collection === '1' ||
          m.otp_on_collection === true,
      }))
      .filter((m) => m.id);

    return res.status(200).json({ methods });
  } catch {
    // Fallback methods
    return res.status(200).json({
      methods: [
        { id: 'lumicash', name: 'LumiCash', icon_url: null, requires_otp: true },
        { id: 'bancobu_enoti', name: 'eNoti', icon_url: null, requires_otp: false },
        { id: 'ecocash', name: 'EcoCash', icon_url: null, requires_otp: false },
        { id: 'ibb_mobile_plus', name: 'IBB Mobile Plus', icon_url: null, requires_otp: false },
        { id: 'ihela', name: 'iHela', icon_url: null, requires_otp: false },
      ],
    });
  }
}
