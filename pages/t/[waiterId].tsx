import { GetServerSideProps } from 'next';
import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import Head from 'next/head';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AFRIPAY_APP_ID     = process.env.NEXT_PUBLIC_AFRIPAY_APP_ID!;
const AFRIPAY_APP_SECRET = process.env.NEXT_PUBLIC_AFRIPAY_APP_SECRET!;
const AFRIPAY_URL        = 'https://www.afripay.africa/checkout/index.php';
const PRESETS            = [1000, 2000, 5000, 10000];
const PLATFORM_FEE       = 0.10; // 4% AfriPay + 6% amTips

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  restaurant_name: string;
  city: string;
  country: string;
  personal_message: string | null;
  average_rating: number;
  total_ratings: number;
  professions: string[];
};

export default function TipPage({ profile, error }: { profile: Profile | null; error?: string }) {
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (error || !profile) {
    return (
      <div style={styles.center}>
        <p style={{ color: '#888' }}>This tipping page was not found.</p>
      </div>
    );
  }

  const tipAmount = amount ?? (custom ? parseInt(custom) : 0);
  const waiterReceives = Math.round(tipAmount * (1 - PLATFORM_FEE));

  async function handlePay() {
    if (!tipAmount || tipAmount < 100) return;
    setSubmitting(true);

    // 1. Insert pending tip
    const { data: tip, error: tipErr } = await supabase
      .from('tips')
      .insert({
        waiter_id: profile!.id,
        amount: waiterReceives,
        currency: 'BIF',
        status: 'pending',
        is_anonymous: isAnon,
      })
      .select('id')
      .single();

    if (tipErr || !tip) { setSubmitting(false); alert('Error creating tip. Try again.'); return; }

    // 2. Insert pending payment
    const clientToken = `tip_${tip.id}_${Math.random().toString(36).slice(2, 8)}`;
    await supabase.from('payments').insert({
      tip_id: tip.id,
      client_token: clientToken,
      tip_amount: waiterReceives,
      gateway_fee: Math.round(tipAmount * 0.04),
      platform_fee: Math.round(tipAmount * 0.06),
      customer_pays: tipAmount,
      currency: 'BIF',
      status: 'pending',
      provider: 'afripay',
    });

    // 3. Submit AfriPay form
    const form = document.getElementById('afripayForm') as HTMLFormElement;
    (form.querySelector('[name=amount]') as HTMLInputElement).value = String(tipAmount);
    (form.querySelector('[name=client_token]') as HTMLInputElement).value = clientToken;
    (form.querySelector('[name=comment]') as HTMLInputElement).value =
      `Tip for ${profile!.full_name} — amTips`;
    (form.querySelector('[name=return_url]') as HTMLInputElement).value =
      `${window.location.origin}/t/${profile!.id}/success?token=${clientToken}`;
    form.submit();
  }

  return (
    <>
      <Head>
        <title>Tip {profile.full_name} — amTips</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.page}>
        <div style={styles.card}>
          {/* Avatar */}
          <div style={styles.avatarWrap}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" style={styles.avatar} />
              : <div style={styles.avatarFallback}>{profile.full_name[0]}</div>}
          </div>

          <h2 style={styles.name}>{profile.full_name}</h2>
          {profile.professions?.length > 0 && (
            <p style={styles.sub}>{profile.professions.join(' · ')}</p>
          )}
          {profile.restaurant_name && (
            <p style={styles.sub}>{profile.restaurant_name} · {profile.city}</p>
          )}
          {profile.personal_message && (
            <p style={styles.msg}>"{profile.personal_message}"</p>
          )}
          {profile.total_ratings > 0 && (
            <p style={styles.rating}>⭐ {profile.average_rating.toFixed(1)} ({profile.total_ratings})</p>
          )}

          <hr style={styles.divider} />

          {/* Amount presets */}
          <p style={styles.label}>Choose amount (BIF)</p>
          <div style={styles.presets}>
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => { setAmount(p); setCustom(''); }}
                style={{ ...styles.preset, ...(amount === p ? styles.presetActive : {}) }}
              >
                {p.toLocaleString()}
              </button>
            ))}
          </div>

          <input
            type="number"
            placeholder="Custom amount"
            value={custom}
            onChange={e => { setCustom(e.target.value); setAmount(null); }}
            style={styles.input}
            min={100}
          />

          {tipAmount > 0 && (
            <p style={styles.fee}>
              Waiter receives: <strong>{waiterReceives.toLocaleString()} BIF</strong>
              <span style={{ color: '#aaa', fontSize: 12 }}> (after 10% fees)</span>
            </p>
          )}

          <label style={styles.anonRow}>
            <input type="checkbox" checked={isAnon} onChange={e => setIsAnon(e.target.checked)} />
            &nbsp;Send anonymously
          </label>

          <button
            onClick={handlePay}
            disabled={!tipAmount || tipAmount < 100 || submitting}
            style={{ ...styles.payBtn, opacity: (!tipAmount || tipAmount < 100 || submitting) ? 0.5 : 1 }}
          >
            {submitting ? 'Redirecting...' : `Pay ${tipAmount ? tipAmount.toLocaleString() + ' BIF' : ''}`}
          </button>

          <p style={styles.powered}>Powered by <strong>amTips</strong> · Secured by AfriPay</p>
        </div>
      </div>

      {/* Hidden AfriPay form — submitted programmatically */}
      <form id="afripayForm" action={AFRIPAY_URL} method="POST" style={{ display: 'none' }}>
        <input type="hidden" name="amount" value="" />
        <input type="hidden" name="currency" value="BIF" />
        <input type="hidden" name="comment" value="" />
        <input type="hidden" name="client_token" value="" />
        <input type="hidden" name="return_url" value="" />
        <input type="hidden" name="app_id" value={AFRIPAY_APP_ID} />
        <input type="hidden" name="app_secret" value={AFRIPAY_APP_SECRET} />
      </form>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const waiterId = params?.waiterId as string;

  // Try to redirect to the app via deep link on mobile
  const ua = req.headers['user-agent'] ?? '';
  const isMobile = /android|iphone|ipad/i.test(ua);

  if (isMobile) {
    // App deep link — if app is installed it opens directly, otherwise falls through to web
    // We use a meta-refresh fallback so the page still loads if app isn't installed
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, restaurant_name, city, country, personal_message, average_rating, total_ratings, professions')
    .eq('id', waiterId)
    .eq('is_active', true)
    .single();

  if (error || !profile) return { props: { profile: null, error: 'Not found' } };

  return { props: { profile } };
};

// ── Inline styles ─────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f4f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'system-ui, sans-serif' },
  card: { background: '#fff', borderRadius: 20, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  avatarWrap: { display: 'flex', justifyContent: 'center', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' },
  avatarFallback: { width: 80, height: 80, borderRadius: '50%', background: '#7B5FEE', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700 },
  name: { textAlign: 'center', margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#1A1033' },
  sub: { textAlign: 'center', margin: '2px 0', fontSize: 13, color: '#888' },
  msg: { textAlign: 'center', fontStyle: 'italic', color: '#555', fontSize: 13, margin: '8px 0' },
  rating: { textAlign: 'center', fontSize: 13, color: '#555', margin: '4px 0' },
  divider: { border: 'none', borderTop: '1px solid #f0f0f0', margin: '16px 0' },
  label: { fontWeight: 600, fontSize: 14, color: '#1A1033', marginBottom: 8 },
  presets: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 },
  preset: { padding: '12px 0', borderRadius: 12, border: '2px solid #e8e8f0', background: '#fafafa', fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#1A1033' },
  presetActive: { border: '2px solid #7B5FEE', background: '#f0ecff', color: '#7B5FEE' },
  input: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e8e8f0', fontSize: 15, marginBottom: 10, boxSizing: 'border-box', outline: 'none' },
  fee: { fontSize: 13, color: '#555', marginBottom: 10 },
  anonRow: { display: 'flex', alignItems: 'center', fontSize: 13, color: '#555', marginBottom: 16, cursor: 'pointer' },
  payBtn: { width: '100%', padding: '15px 0', borderRadius: 14, background: '#7B5FEE', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' },
  powered: { textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 14 },
};
