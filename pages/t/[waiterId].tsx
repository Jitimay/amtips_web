import { GetServerSideProps } from 'next';
import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PRESETS = [2000, 5000, 10000, 20000];
const GATEWAY_FEE = 0.04;
const PLATFORM_FEE = 0.06;

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

type Campaign = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  target_amount: number | null;
  current_amount: number;
  tips_count: number;
  currency: string;
  end_date: string | null;
};

export default function TipPage({
  profile,
  campaign,
  error,
}: {
  profile: Profile | null;
  campaign: Campaign | null;
  error?: string;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [note, setNote] = useState('');

  if (error || !profile) {
    return (
      <div style={s.center}>
        <p style={{ color: '#888', fontFamily: 'system-ui' }}>This tipping page was not found.</p>
      </div>
    );
  }

  const tipAmount = amount ?? (custom ? parseInt(custom) || 0 : 0);
  const waiterReceives = Math.round(tipAmount * (1 - GATEWAY_FEE - PLATFORM_FEE));

  function proceed() {
    if (!tipAmount || tipAmount < 100) return;
    router.push({
      pathname: `/t/${profile!.id}/payment`,
      query: { amount: tipAmount, currency: 'BIF', ...(note.trim() ? { message: note.trim() } : {}) },
    });
  }

  const firstName = profile.full_name.split(' ')[0];

  return (
    <>
      <Head>
        <title>Tip {profile.full_name} — amTips</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={s.page}>
        {/* ── Gradient header ── */}
        <div style={s.header}>
          <div style={s.avatarWrap}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={s.avatar} />
            ) : (
              <div style={s.avatarFallback}>{profile.full_name[0]}</div>
            )}
          </div>

          <h2 style={s.name}>Tip {firstName}</h2>

          {profile.professions?.length > 0 && (
            <div style={s.chips}>
              {profile.professions.map((p) => (
                <span key={p} style={s.chip}>{p}</span>
              ))}
            </div>
          )}

          {profile.restaurant_name && (
            <p style={s.headerSub}>{profile.restaurant_name}</p>
          )}

          <p style={s.headerSub}>
            📍 {profile.city}, {profile.country}
          </p>

          {profile.total_ratings > 0 && (
            <p style={s.headerSub}>
              ⭐ {profile.average_rating.toFixed(1)} ({profile.total_ratings})
            </p>
          )}

          {profile.personal_message && (
            <div style={s.msgBox}>
              <p style={s.msg}>"{profile.personal_message}"</p>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={s.body}>
          {/* Campaign banner */}
          {campaign && (
            <div style={s.campaign}>
              <div style={s.campaignRow}>
                <span style={{ fontSize: 22 }}>{campaign.emoji}</span>
                <span style={s.campaignTitle}>{campaign.title}</span>
                {campaign.end_date && (
                  <span style={s.campaignDays}>
                    {Math.max(
                      0,
                      Math.floor(
                        (new Date(campaign.end_date).getTime() - Date.now()) /
                          86400000
                      )
                    )}{' '}
                    days left
                  </span>
                )}
              </div>
              {campaign.description && (
                <p style={s.campaignDesc}>{campaign.description}</p>
              )}
              {campaign.target_amount && (
                <>
                  <div style={s.progressBg}>
                    <div
                      style={{
                        ...s.progressFill,
                        width: `${Math.min(
                          100,
                          (campaign.current_amount / campaign.target_amount) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p style={s.campaignStats}>
                    {campaign.current_amount.toLocaleString()} BIF raised ·{' '}
                    {campaign.tips_count} tips
                  </p>
                </>
              )}
            </div>
          )}

          {/* Amount picker */}
          <p style={s.label}>Choose an amount</p>
          <div style={s.presets}>
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => { setAmount(p); setCustom(''); }}
                style={{
                  ...s.preset,
                  ...(amount === p && !custom ? s.presetActive : {}),
                }}
              >
                {p.toLocaleString()} BIF
              </button>
            ))}
          </div>

          <input
            type="number"
            placeholder="Custom amount"
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setAmount(null); }}
            style={s.input}
            min={100}
          />

          <input
            type="text"
            placeholder="Add a note or message (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ ...s.input, marginTop: 10 }}
            maxLength={120}
          />

          {tipAmount > 0 && (
            <p style={s.fee}>
              {firstName} receives:{' '}
              <strong>{waiterReceives.toLocaleString()} BIF</strong>
              <span style={{ color: '#aaa', fontSize: 12 }}> (after 10% fees)</span>
            </p>
          )}

          <button
            onClick={proceed}
            disabled={!tipAmount || tipAmount < 100}
            style={{
              ...s.btn,
              opacity: !tipAmount || tipAmount < 100 ? 0.5 : 1,
            }}
          >
            Continue
          </button>

          {/* App download banner for tippers and service workers */}
          <div style={s.appCard}>
            <div style={s.appRow}>
              <div style={s.appLogoBox}>
                <img src="/logo.png" alt="amTips logo" style={s.appLogo} />
              </div>
              <div style={s.appInfo}>
                <p style={s.appTitle}>Get the amTips App</p>
              </div>
            </div>
            <a
              href="https://play.google.com/store/apps/details?id=app.amtips.official"
              target="_blank"
              rel="noreferrer"
              style={s.appDownloadBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L14.81,13.12L14.81,10.88L16.81,8.88L20.57,11.05C21.14,11.37 21.14,12.63 20.57,12.95L16.81,15.12M4.5,2.71L13.12,11.33L14.24,10.21L4.5,2.71Z" />
              </svg>
              Download on Google Play
            </a>
          </div>

          <p style={s.powered}>Powered by <strong>amTips</strong></p>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const waiterId = params?.waiterId as string;
  const campaignId = query?.campaign as string | undefined;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, avatar_url, restaurant_name, city, country, personal_message, average_rating, total_ratings, professions'
    )
    .eq('id', waiterId)
    .eq('is_active', true)
    .single();

  if (error || !profile) return { props: { profile: null, error: 'Not found' } };

  // Load campaign
  let campaign: Campaign | null = null;
  if (campaignId) {
    const { data } = await supabase
      .from('campaigns')
      .select('id, title, description, emoji, target_amount, current_amount, tips_count, currency, end_date')
      .eq('id', campaignId)
      .eq('is_active', true)
      .maybeSingle();
    campaign = data ?? null;
  } else {
    const { data } = await supabase
      .from('campaigns')
      .select('id, title, description, emoji, target_amount, current_amount, tips_count, currency, end_date')
      .eq('waiter_id', waiterId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    campaign = data ?? null;
  }

  return { props: { profile, campaign } };
};

const PRIMARY = '#7B5FEE';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f4f4f8', fontFamily: 'system-ui, sans-serif' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  // Header (gradient)
  header: {
    background: 'linear-gradient(135deg, #8B72F0 0%, #5E3DD0 100%)',
    padding: '40px 24px 32px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  avatarWrap: { marginBottom: 14 },
  avatar: { width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' },
  avatarFallback: {
    width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 32, fontWeight: 700,
  },
  name: { color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 8px', textAlign: 'center' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 8 },
  chip: {
    background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: 12,
    fontWeight: 500, padding: '4px 10px', borderRadius: 20,
  },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: '2px 0', textAlign: 'center' },
  msgBox: {
    background: 'rgba(255,255,255,0.15)', borderRadius: 12,
    padding: '10px 14px', marginTop: 12, maxWidth: 340,
  },
  msg: { color: '#fff', fontSize: 13, fontStyle: 'italic', margin: 0, textAlign: 'center' },
  // Body
  body: { padding: '24px 20px 48px', maxWidth: 480, margin: '0 auto' },
  // Campaign
  campaign: {
    background: 'linear-gradient(135deg, #8B72F0 0%, #5E3DD0 100%)',
    borderRadius: 16, padding: 14, marginBottom: 24,
  },
  campaignRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  campaignTitle: { color: '#fff', fontWeight: 600, fontSize: 14, flex: 1 },
  campaignDays: {
    background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 11,
    padding: '3px 8px', borderRadius: 20,
  },
  campaignDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: '0 0 8px' },
  progressBg: { background: 'rgba(255,255,255,0.25)', borderRadius: 4, height: 6, overflow: 'hidden' },
  progressFill: { background: '#fff', height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  campaignStats: { color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '6px 0 0' },
  // Amount
  label: { fontWeight: 600, fontSize: 15, color: '#1A1033', marginBottom: 12 },
  presets: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 },
  preset: {
    padding: '14px 0', borderRadius: 14, border: '1.5px solid #e8e8f0',
    background: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#1A1033',
  },
  presetActive: { border: `2px solid ${PRIMARY}`, background: '#f0ecff', color: PRIMARY },
  input: {
    width: '100%', padding: '13px 14px', borderRadius: 12, border: '1.5px solid #e8e8f0',
    fontSize: 15, marginBottom: 10, boxSizing: 'border-box', outline: 'none',
  },
  fee: { fontSize: 13, color: '#555', marginBottom: 16 },
  btn: {
    width: '100%', padding: '16px 0', borderRadius: 16, background: PRIMARY,
    color: '#fff', fontSize: 17, fontWeight: 700, border: 'none', cursor: 'pointer',
    marginBottom: 16,
  },
  powered: { textAlign: 'center', fontSize: 11, color: '#bbb', margin: 0 },
  // App Promo Card
  appCard: {
    background: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginBottom: 20,
    border: '1px solid #e8e8f0',
    boxShadow: '0 4px 16px rgba(123, 95, 238, 0.08)',
  },
  appRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  appLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: '#f0ecff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  appLogo: {
    width: 28,
    height: 28,
    objectFit: 'contain',
  },
  appInfo: {
    flex: 1,
  },
  appTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: '#1A1033',
  },
  appDesc: {
    margin: '3px 0 0',
    fontSize: 12,
    color: '#666',
    lineHeight: 1.35,
  },
  appDownloadBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '11px 0',
    borderRadius: 12,
    background: '#1A1033',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 600,
    boxSizing: 'border-box',
  },
};
