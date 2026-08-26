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
  const { token } = router.query;
  const [status, setStatus] = useState<'checking' | 'completed' | 'pending'>('checking');

  useEffect(() => {
    if (!token) return;
    let tries = 0;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('payments')
        .select('status')
        .eq('client_token', token)
        .maybeSingle();

      if (data?.status === 'completed') {
        setStatus('completed');
        clearInterval(interval);
      } else if (++tries > 10) {
        setStatus('pending');
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <>
      <Head><title>Payment — amTips</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', background: '#f4f4f8' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {status === 'checking' && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <h2 style={{ color: '#1A1033' }}>Confirming payment...</h2>
              <p style={{ color: '#888', fontSize: 14 }}>Please wait a moment.</p>
            </>
          )}
          {status === 'completed' && (
            <>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h2 style={{ color: '#1A1033' }}>Tip sent!</h2>
              <p style={{ color: '#888', fontSize: 14 }}>Thank you for your generosity.</p>
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
