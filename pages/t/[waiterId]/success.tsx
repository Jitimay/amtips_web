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
  const { token, status: urlStatus, message } = router.query;
  const [status, setStatus] = useState<'checking' | 'completed' | 'failed' | 'pending'>('checking');
  const afriPayMessage = typeof message === 'string' ? decodeURIComponent(message).replace(/<br\s*\/?>/gi, '\n') : null;

  useEffect(() => {
    if (!token) return;

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
        if (s === 'completed') setStatus('completed');
        else if (s === 'failed' || s === 'cancelled') setStatus('failed');
      })
      .subscribe();

    // 2. Polling fallback — every 3s for up to 2 minutes
    let tries = 0;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('payments')
        .select('status')
        .eq('client_token', token)
        .maybeSingle();

      if (data?.status === 'completed') { setStatus('completed'); cleanup(); }
      else if (data?.status === 'failed' || data?.status === 'cancelled') { setStatus('failed'); cleanup(); }
      else if (++tries > 40) { setStatus('pending'); cleanup(); } // 2 min timeout
    }, 3000);

    function cleanup() {
      clearInterval(interval);
      supabase.removeChannel(channel);
    }

    return cleanup;
  }, [token]);

  return (
    <>
      <Head><title>Payment — amTips</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', background: '#f4f4f8' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {status === 'checking' && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
              <h2 style={{ color: '#1A1033' }}>Check your phone!</h2>
              {afriPayMessage ? (
                <div style={{ background: '#f0ecff', borderRadius: 12, padding: '14px 16px', textAlign: 'left', marginBottom: 16 }}>
                  {afriPayMessage.split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} style={{ margin: '3px 0', fontSize: 13, color: i === 0 ? '#6C4EE8' : '#333', fontWeight: i === 0 ? 700 : 400 }}>{line}</p>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#888', fontSize: 14 }}>A payment request was sent to your phone. Please confirm it.</p>
              )}
              <p style={{ color: '#aaa', fontSize: 12 }}>Waiting for confirmation...</p>
            </>
          )}
          {status === 'completed' && (
            <>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h2 style={{ color: '#1A1033' }}>Tip sent!</h2>
              <p style={{ color: '#888', fontSize: 14 }}>Thank you for your generosity.</p>
            </>
          )}
          {status === 'failed' && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
              <h2 style={{ color: '#1A1033' }}>Payment failed</h2>
              <p style={{ color: '#888', fontSize: 14 }}>Your payment was not completed. No money was charged.</p>
            </>
          )}
          {status === 'pending' && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <h2 style={{ color: '#1A1033' }}>Payment processing</h2>
              <p style={{ color: '#888', fontSize: 14 }}>Your payment is being processed. The tip will be credited shortly.</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
