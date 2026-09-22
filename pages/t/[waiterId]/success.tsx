import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SuccessPage() {
  const router = useRouter();
  const { token, message } = router.query;
  const [status, setStatus] = useState<'checking' | 'completed' | 'failed' | 'pending'>('checking');
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const afriPayMessage = typeof message === 'string' ? decodeURIComponent(message).replace(/<br\s*\/?>/gi, '\n') : null;

  useEffect(() => {
    if (!token) return;

    // Fetch initial status and failure reason if available
    supabase
      .from('payments')
      .select('status, transaction_ref, failure_reason')
      .eq('client_token', token)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          if (data.transaction_ref) setTransactionRef(data.transaction_ref);
          if (data.status === 'completed') setStatus('completed');
          else if (data.status === 'failed' || data.status === 'cancelled') {
            setStatus('failed');
            if (data.failure_reason) setFailureReason(data.failure_reason);
          }
        }
      });

    // 1. Realtime subscription — instant update when webhook fires
    const channel = supabase
      .channel('payment-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'payments',
        filter: `client_token=eq.${token}`,
      }, (payload) => {
        const s = payload.new.status;
        if (payload.new.transaction_ref) setTransactionRef(payload.new.transaction_ref);
        if (s === 'completed') setStatus('completed');
        else if (s === 'failed' || s === 'cancelled') {
          setStatus('failed');
          if (payload.new.failure_reason) setFailureReason(payload.new.failure_reason);
        }
      })
      .subscribe();

    // 2. Polling fallback — every 3s for up to 2 minutes
    let tries = 0;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('payments')
        .select('status, transaction_ref, failure_reason')
        .eq('client_token', token)
        .maybeSingle();

      if (data) {
        if (data.transaction_ref) setTransactionRef(data.transaction_ref);
        if (data.status === 'completed') { setStatus('completed'); cleanup(); }
        else if (data.status === 'failed' || data.status === 'cancelled') {
          setStatus('failed');
          if (data.failure_reason) setFailureReason(data.failure_reason);
          cleanup();
        }
      }
      if (++tries > 40) { setStatus('pending'); cleanup(); }
    }, 3000);

    function cleanup() {
      clearInterval(interval);
      supabase.removeChannel(channel);
    }

    return cleanup;
  }, [token]);

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
        `}</style>
      </Head>
      <div style={s.page}>
        <div style={s.card}>
          {status === 'checking' && (
            <>
              <div style={s.iconCircle}>
                <span style={{ fontSize: 36 }}>📱</span>
              </div>
              <h2 style={s.title}>Check your phone! 📱</h2>
              <p style={s.desc}>A payment request was sent to your mobile money account.</p>

              {afriPayMessage && (
                <div style={s.stepsCard}>
                  {afriPayMessage.split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} style={s.stepLine}>{line}</p>
                  ))}
                </div>
              )}

              <div style={s.spinner} />
              <p style={s.waitingText}>Waiting for confirmation...</p>
            </>
          )}

          {status === 'completed' && (
            <>
              <div style={{ ...s.iconCircle, background: 'rgba(46, 204, 113, 0.2)' }}>
                <span style={{ fontSize: 40 }}>🎉</span>
              </div>
              <h2 style={s.title}>Tip sent!</h2>
              <p style={s.desc}>Thank you for your generosity!</p>
              {transactionRef && (
                <div style={s.refBadge}>
                  Ref: <strong>{transactionRef}</strong>
                </div>
              )}
            </>
          )}

          {status === 'failed' && (
            <>
              <div style={{ ...s.iconCircle, background: 'rgba(239, 68, 68, 0.2)' }}>
                <span style={{ fontSize: 40 }}>❌</span>
              </div>
              <h2 style={s.title}>Payment failed</h2>
              <p style={s.desc}>Your payment could not be completed. No money was charged.</p>

              <div style={s.errorCard}>
                <p style={s.errorTitle}>API Response / Failure Reason:</p>
                <p style={s.errorText}>
                  {failureReason || afriPayMessage || 'Transaction was cancelled or rejected by provider.'}
                </p>
              </div>

              <button onClick={() => router.back()} style={s.retryBtn}>
                Try again
              </button>
            </>
          )}

          {status === 'pending' && (
            <>
              <div style={s.iconCircle}>
                <span style={{ fontSize: 36 }}>⏳</span>
              </div>
              <h2 style={s.title}>Payment processing</h2>
              <p style={s.desc}>Your payment is being processed. The tip will be credited shortly.</p>
            </>
          )}
        </div>
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
    fontFamily: 'system-ui, sans-serif',
    background: '#141126',
    padding: 20,
    boxSizing: 'border-box',
  },
  card: {
    background: '#1C1830',
    borderRadius: 24,
    padding: '40px 24px',
    maxWidth: 420,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'rgba(123, 95, 238, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.5,
    marginBottom: 20,
  },
  stepsCard: {
    width: '100%',
    background: 'rgba(123, 95, 238, 0.15)',
    border: '1px solid rgba(123, 95, 238, 0.35)',
    borderRadius: 16,
    padding: '16px 20px',
    marginBottom: 24,
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  stepLine: {
    margin: '4px 0',
    fontSize: 14,
    fontWeight: 500,
    color: '#F1F0F8',
    lineHeight: 1.6,
  },
  errorCard: {
    width: '100%',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    borderRadius: 16,
    padding: '16px 20px',
    margin: '16px 0 24px',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  errorTitle: {
    margin: '0 0 6px',
    fontSize: 13,
    fontWeight: 700,
    color: '#FCA5A5',
  },
  errorText: {
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
    color: '#FEE2E2',
    lineHeight: 1.5,
  },
  refBadge: {
    background: 'rgba(46, 204, 113, 0.15)',
    border: '1px solid rgba(46, 204, 113, 0.3)',
    color: '#2ECC71',
    borderRadius: 12,
    padding: '10px 16px',
    fontSize: 13,
    marginTop: 12,
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid rgba(123, 95, 238, 0.25)',
    borderTop: '3px solid #7B5FEE',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: 12,
  },
  waitingText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  retryBtn: {
    width: '100%',
    padding: '14px 0',
    borderRadius: 16,
    background: '#7B5FEE',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
  },
};
