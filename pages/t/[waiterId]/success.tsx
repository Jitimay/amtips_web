import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

type PaymentInfo = {
  status: string;
  tip_amount: number;
  customer_pays: number;
  gateway_fee: number;
  platform_fee: number;
  currency: string;
  transaction_ref: string | null;
  created_at: string;
  waiter_name: string;
  waiter_username: string;
};

type Status = 'checking' | 'completed' | 'failed' | 'pending';

export default function SuccessPage() {
  const router = useRouter();
  const { token } = router.query;
  const receiptRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<Status>('checking');
  const [info, setInfo] = useState<PaymentInfo | null>(null);

  // ── Fetch payment info + waiter name ────────────────────────────────────
  async function fetchPaymentInfo(clientToken: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: payment } = await supabase
      .from('payments')
      .select('status, tip_amount, customer_pays, gateway_fee, platform_fee, currency, transaction_ref, created_at, tip_id')
      .eq('client_token', clientToken)
      .maybeSingle();

    if (!payment) return null;

    let waiterName = 'Waiter';
    let waiterUsername = '';

    if (payment.tip_id) {
      const { data: tip } = await supabase
        .from('tips')
        .select('waiter_id')
        .eq('id', payment.tip_id)
        .maybeSingle();

      if (tip?.waiter_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', tip.waiter_id)
          .maybeSingle();

        if (profile) {
          waiterName = profile.full_name ?? 'Waiter';
          waiterUsername = profile.username ?? '';
        }
      }
    }

    return { ...payment, waiter_name: waiterName, waiter_username: waiterUsername } as PaymentInfo;
  }

  useEffect(() => {
    if (!token) return;
    const clientToken = token as string;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Initial fetch
    fetchPaymentInfo(clientToken).then((data) => {
      if (!data) return;
      setInfo(data);
      if (data.status === 'completed') setStatus('completed');
      else if (data.status === 'failed' || data.status === 'cancelled') setStatus('failed');
    });

    // Realtime subscription
    const channel = supabase
      .channel(`payment-${clientToken}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'payments',
        filter: `client_token=eq.${clientToken}`,
      }, async (payload) => {
        const s = payload.new.status;
        if (s === 'completed' || s === 'failed' || s === 'cancelled') {
          const data = await fetchPaymentInfo(clientToken);
          if (data) setInfo(data);
          setStatus(s === 'completed' ? 'completed' : 'failed');
          cleanup();
        }
      })
      .subscribe();

    // Polling fallback every 3s for up to 2 min
    let tries = 0;
    const interval = setInterval(async () => {
    const { data } = await supabase
        .from('payments')
        .select('status, transaction_ref')
        .eq('client_token', token)
        .maybeSingle();

      if (data) {
        setInfo(prev => prev ? { ...prev, status: data.status, transaction_ref: data.transaction_ref ?? prev.transaction_ref } : prev);
        if (data.status === 'completed') setStatus('completed');
        else if (data.status === 'failed' || data.status === 'cancelled') setStatus('failed');
      }
      if (++tries > 40) { setStatus('pending'); cleanup(); }
    }, 3000);

    function cleanup() {
      clearInterval(interval);
      supabase.removeChannel(channel);
    }

    return cleanup;
  }, [token]);

  // ── Download receipt as print ────────────────────────────────────────────
  function downloadReceipt() {
    window.print();
  }

  const dateStr = info?.created_at
    ? new Date(info.created_at).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '';

  return (
    <>
      <Head>
        <title>Payment Status — amTips</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pop {
            0% { transform: scale(0.7); opacity: 0; }
            80% { transform: scale(1.08); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* ── Print styles ── */
          @media print {
            body * { visibility: hidden !important; }
            #receipt, #receipt * { visibility: visible !important; }
            #receipt {
              position: fixed !important;
              inset: 0 !important;
              background: #fff !important;
              color: #000 !important;
              padding: 40px !important;
              margin: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              max-width: 100% !important;
              width: 100% !important;
              font-family: monospace !important;
            }
            .no-print { display: none !important; }
          }
        `}</style>
      </Head>

      <div style={s.page}>
        {/* ── Checking / Awaiting ── */}
        {status === 'checking' && (
          <div style={s.card}>
            <div style={s.iconCircle}>
              <span style={{ fontSize: 36 }}>📱</span>
            </div>
            <h2 style={s.title}>Check your phone! 📱</h2>
            <p style={s.desc}>A payment request was sent to your mobile money account.</p>
            <div style={s.spinner} />
            <p style={s.waitingText}>Waiting for confirmation...</p>
          </div>
        )}

        {/* ── Success + Receipt ── */}
        {status === 'completed' && info && (
          <div style={s.card}>
            {/* Success header (hidden on print) */}
            <div className="no-print" style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ ...s.iconCircle, background: 'rgba(46,204,113,0.2)', animation: 'pop 0.5s ease' }}>
                <span style={{ fontSize: 44 }}>🎉</span>
              </div>
              <h2 style={{ ...s.title, color: '#2ECC71', animation: 'fadeUp 0.4s ease 0.1s both' }}>
                Tip sent successfully!
              </h2>
              <p style={{ ...s.desc, animation: 'fadeUp 0.4s ease 0.2s both' }}>
                Thank you for your generosity!
              </p>
            </div>

            {/* ── Receipt Card ── */}
            <div id="receipt" ref={receiptRef} style={s.receipt}>
              {/* Receipt header */}
              <div style={s.receiptHeader}>
                <div style={s.receiptLogo}>amTips</div>
                <div style={s.receiptTitle}>PAYMENT RECEIPT</div>
                <div style={s.receiptDate}>{dateStr}</div>
              </div>

              <div style={s.receiptDivider} />

              {/* Recipient */}
              <div style={s.receiptRow}>
                <span style={s.receiptLabel}>Recipient</span>
                <span style={s.receiptValue}>{info.waiter_name}</span>
              </div>
              {info.waiter_username && (
                <div style={s.receiptRow}>
                  <span style={s.receiptLabel}>Username</span>
                  <span style={s.receiptValue}>@{info.waiter_username}</span>
                </div>
              )}

              <div style={s.receiptDivider} />

              {/* Amounts */}
              <div style={s.receiptRow}>
                <span style={s.receiptLabel}>Amount paid</span>
                <span style={{ ...s.receiptValue, fontWeight: 800 }}>
                  {info.customer_pays.toLocaleString()} {info.currency}
                </span>
              </div>
              <div style={s.receiptRow}>
                <span style={s.receiptLabel}>Tip received</span>
                <span style={{ ...s.receiptValue, color: '#2ECC71', fontWeight: 700 }}>
                  {info.tip_amount.toLocaleString()} {info.currency}
                </span>
              </div>
              <div style={s.receiptRow}>
                <span style={s.receiptLabel}>Gateway fee (10%)</span>
                <span style={s.receiptLabelSub}>
                  {(info.customer_pays - info.tip_amount).toLocaleString()} {info.currency}
                </span>
              </div>

              <div style={s.receiptDivider} />

              {/* Reference */}
              {info.transaction_ref && (
                <div style={s.receiptRow}>
                  <span style={s.receiptLabel}>Transaction Ref</span>
                  <span style={{ ...s.receiptValue, fontSize: 11, wordBreak: 'break-all' }}>
                    {info.transaction_ref}
                  </span>
                </div>
              )}
              <div style={s.receiptRow}>
                <span style={s.receiptLabel}>Status</span>
                <span style={{ ...s.receiptValue, color: '#2ECC71' }}>✓ COMPLETED</span>
              </div>

              <div style={{ ...s.receiptDivider, marginTop: 16 }} />
              <p style={s.receiptFooter}>Powered by amTips · amtips.app</p>
            </div>

            {/* Action buttons */}
            <div className="no-print" style={{ width: '100%', marginTop: 20, display: 'flex', gap: 12 }}>
              <button onClick={downloadReceipt} style={s.downloadBtn}>
                ⬇ Download Receipt
              </button>
              <button onClick={() => router.replace('/')} style={s.backBtn}>
                Done
              </button>
            </div>

            {/* Download app promo card */}
            <div className="no-print" style={s.appPromoCard}>
              <div style={s.appPromoRow}>
                <div style={s.appLogoBox}>
                  <img src="/logo.png" alt="amTips logo" style={s.appLogo} />
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <p style={s.appPromoTitle}>Get the amTips App</p>
                  <p style={s.appPromoDesc}>
                    Service worker? Receive digital tips directly with your own QR code!
                  </p>
                </div>
              </div>
              <a
                href="https://play.google.com/store/apps/details?id=app.amtips.official"
                target="_blank"
                rel="noreferrer"
                style={s.playBtn}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L14.81,13.12L14.81,10.88L16.81,8.88L20.57,11.05C21.14,11.37 21.14,12.63 20.57,12.95L16.81,15.12M4.5,2.71L13.12,11.33L14.24,10.21L4.5,2.71Z" />
                </svg>
                Download on Google Play
              </a>
            </div>
          </div>
        )}

        {/* ── Failed ── */}
        {status === 'failed' && (
          <div style={s.card}>
            <div style={{ ...s.iconCircle, background: 'rgba(239,68,68,0.2)' }}>
              <span style={{ fontSize: 40 }}>❌</span>
            </div>
            <h2 style={s.title}>Payment failed</h2>
            <p style={s.desc}>Your payment could not be completed. No money was charged.</p>
            <div style={s.errorCard}>
              <p style={s.errorTitle}>Reason</p>
              <p style={s.errorText}>
                {'Transaction was cancelled or rejected by provider.'}
              </p>
            </div>
            <button onClick={() => router.back()} style={s.downloadBtn}>
              Try again
            </button>
          </div>
        )}

        {/* ── Timed out / Pending ── */}
        {status === 'pending' && (
          <div style={s.card}>
            <div style={s.iconCircle}>
              <span style={{ fontSize: 36 }}>⏳</span>
            </div>
            <h2 style={s.title}>Payment processing</h2>
            <p style={s.desc}>
              Your payment is being processed. The tip will be credited automatically within 5 minutes.
            </p>
            {info?.transaction_ref && (
              <div style={s.refBadge}>
                Ref: <strong>{info.transaction_ref}</strong>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: '#141126',
    padding: 20,
    boxSizing: 'border-box',
  },
  card: {
    background: '#1C1830',
    borderRadius: 24,
    padding: '36px 24px',
    maxWidth: 420,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'rgba(123,95,238,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 },
  desc: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: 20 },
  spinner: {
    width: 32, height: 32,
    border: '3px solid rgba(123,95,238,0.25)',
    borderTop: '3px solid #7B5FEE',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: 12,
  },
  waitingText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },

  // Receipt
  receipt: {
    width: '100%',
    background: '#fff',
    borderRadius: 16,
    padding: '20px 20px 16px',
    boxSizing: 'border-box',
    color: '#111',
    textAlign: 'left',
  },
  receiptHeader: { textAlign: 'center', marginBottom: 12 },
  receiptLogo: { fontSize: 20, fontWeight: 900, color: '#7B5FEE', letterSpacing: 1 },
  receiptTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#777', marginTop: 2 },
  receiptDate: { fontSize: 11, color: '#999', marginTop: 4 },
  receiptDivider: {
    borderTop: '1px dashed #ddd',
    margin: '12px 0',
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  receiptLabel: { fontSize: 12, color: '#666', fontWeight: 500, flex: 1 },
  receiptLabelSub: { fontSize: 12, color: '#999', fontWeight: 400 },
  receiptValue: { fontSize: 13, color: '#111', fontWeight: 600, textAlign: 'right', flex: 1 },
  receiptFooter: { fontSize: 10, color: '#aaa', textAlign: 'center', margin: '4px 0 0' },

  // Buttons
  downloadBtn: {
    flex: 1,
    padding: '14px 0',
    borderRadius: 14,
    background: '#7B5FEE',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
  },
  backBtn: {
    flex: 1,
    padding: '14px 0',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    border: '1px solid rgba(255,255,255,0.15)',
    cursor: 'pointer',
  },

  // Error
  errorCard: {
    width: '100%',
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 14,
    padding: '14px 18px',
    margin: '12px 0 20px',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  errorTitle: { margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#FCA5A5' },
  errorText: { margin: 0, fontSize: 13, color: '#FEE2E2', lineHeight: 1.5 },
  refBadge: {
    background: 'rgba(46,204,113,0.12)',
    border: '1px solid rgba(46,204,113,0.3)',
    color: '#2ECC71',
    borderRadius: 12,
    padding: '10px 16px',
    fontSize: 13,
    marginTop: 12,
  },

  // App Promo Card
  appPromoCard: {
    width: '100%',
    marginTop: 20,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    border: '1px solid rgba(255,255,255,0.12)',
    boxSizing: 'border-box',
  },
  appPromoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  appLogoBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: 'rgba(123, 95, 238, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  appLogo: {
    width: 26,
    height: 26,
    objectFit: 'contain',
  },
  appPromoTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: '#ffffff',
  },
  appPromoDesc: {
    margin: '3px 0 0',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.35,
  },
  playBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '12px 0',
    borderRadius: 12,
    background: '#7B5FEE',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 700,
    boxSizing: 'border-box',
  },
};
