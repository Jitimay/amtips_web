import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const PRIMARY = '#7B5FEE';
const GATEWAY_FEE = 0.04;
const PLATFORM_FEE = 0.06;

type Method = {
  id: string;
  name: string;
  icon_url: string | null;
  requires_otp: boolean;
};

type Step = 'form' | 'awaiting' | 'success' | 'failed';

export default function PaymentPage() {
  const router = useRouter();
  const { waiterId, amount: amountQ, currency: currencyQ } = router.query;

  const amount = parseInt(amountQ as string) || 0;
  const currency = (currencyQ as string) || 'BIF';
  const waiterReceives = Math.round(amount * (1 - GATEWAY_FEE - PLATFORM_FEE));

  const [methods, setMethods] = useState<Method[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load payment methods
  useEffect(() => {
    if (!waiterId) return;
    fetch(`/api/get-payment-methods?currency=${currency}`)
      .then((r) => r.json())
      .then((data) => setMethods(data.methods ?? []))
      .catch(() => setMethods([]));
  }, [waiterId, currency]);

  // Poll payment status once awaiting
  useEffect(() => {
    if (step !== 'awaiting' || !clientToken) return;
    let tries = 0;
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/payment-status?token=${clientToken}`);
      const data = await res.json();
      if (data.status === 'completed') {
        clearInterval(pollRef.current!);
        router.replace(`/t/${waiterId}/success?token=${clientToken}`);
      } else if (data.status === 'failed' || data.status === 'cancelled') {
        clearInterval(pollRef.current!);
        setStep('failed');
      } else if (++tries > 40) {
        clearInterval(pollRef.current!);
        router.replace(`/t/${waiterId}/success?token=${clientToken}`);
      }
    }, 3000);
    return () => clearInterval(pollRef.current!);
  }, [step, clientToken]);

  async function requestOtp() {
    if (!phone || !selectedId) { setError('Enter your phone number and select a method first.'); return; }
    setRequestingOtp(true);
    setError(null);
    const res = await fetch('/api/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, paymentMethod: selectedId }),
    });
    const data = await res.json();
    setRequestingOtp(false);
    if (data.status === 'error') setError(data.message ?? 'OTP request failed.');
    else setError(null);
  }

  async function pay() {
    if (!phone) { setError('Enter your mobile money number.'); return; }
    if (!selectedId) { setError('Select a payment method.'); return; }
    if (requiresOtp && !otp) { setError('Enter the OTP sent to your phone.'); return; }
    setSubmitting(true);
    setError(null);

    const res = await fetch('/api/initiate-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        waiterId,
        amount,
        currency,
        phone,
        paymentMethod: selectedId,
        otp: requiresOtp ? otp : undefined,
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok || data.status === 'error') {
      setError(data.message ?? 'Payment failed. Please try again.');
      return;
    }

    setClientToken(data.clientToken);
    setStep('awaiting');
  }

  if (!amount || !waiterId) return null;

  return (
    <>
      <Head>
        <title>Pay your tip — amTips</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={s.page}>
        {/* App bar */}
        <div style={s.appBar}>
          <button onClick={() => router.back()} style={s.back}>←</button>
          <span style={s.appBarTitle}>Pay your tip</span>
        </div>

        <div style={s.body}>
          {step === 'awaiting' ? (
            <div style={s.awaitingWrap}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📱</div>
              <h2 style={s.awaitingTitle}>Check your phone!</h2>
              <p style={s.awaitingDesc}>
                A payment request of <strong>{amount.toLocaleString()} {currency}</strong> was sent
                to your mobile money account. Please confirm it on your phone.
              </p>
              <div style={s.spinner} />
              <button onClick={() => { clearInterval(pollRef.current!); router.back(); }} style={s.cancelBtn}>
                Cancel
              </button>
            </div>
          ) : (
            <>
              {/* Fee summary */}
              <div style={s.feeCard}>
                <span style={s.feeLabel}>You pay</span>
                <span style={s.feeValue}>{amount.toLocaleString()} {currency}</span>
              </div>
              <p style={s.feeNote}>
                Recipient receives: <strong>{waiterReceives.toLocaleString()} {currency}</strong>
                <span style={{ color: '#aaa', fontSize: 12 }}> (after 10% fees)</span>
              </p>

              {/* Payment methods */}
              <p style={s.sectionLabel}>Select payment method</p>
              {methods.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: 13 }}>Loading methods…</p>
              ) : (
                methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedId(m.id);
                      setRequiresOtp(m.requires_otp);
                      setOtp('');
                    }}
                    style={{
                      ...s.methodTile,
                      ...(selectedId === m.id ? s.methodTileActive : {}),
                    }}
                  >
                    <div style={s.methodIcon}>
                      {m.icon_url ? (
                        <img src={m.icon_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <span style={s.methodInitial}>{m.name[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <span style={s.methodName}>{m.name.toUpperCase()}</span>
                    {selectedId === m.id && <span style={{ color: PRIMARY, fontSize: 20 }}>✓</span>}
                  </button>
                ))
              )}

              {/* Phone */}
              <p style={s.sectionLabel}>Your mobile money number</p>
              <input
                type="tel"
                placeholder="e.g. 25761234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                style={s.input}
              />

              {/* OTP */}
              {requiresOtp && (
                <>
                  <p style={s.sectionLabel}>One-Time Password (OTP)</p>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      style={{ ...s.input, paddingRight: 90 }}
                    />
                    <button
                      onClick={requestOtp}
                      disabled={requestingOtp}
                      style={s.otpBtn}
                    >
                      {requestingOtp ? '…' : 'Get OTP'}
                    </button>
                  </div>
                </>
              )}

              {error && <p style={s.error}>{error}</p>}

              <button onClick={pay} disabled={submitting} style={{ ...s.payBtn, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Processing…' : `Pay ${amount.toLocaleString()} ${currency}`}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f4f4f8', fontFamily: 'system-ui, sans-serif' },
  appBar: {
    background: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center',
    gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10,
  },
  back: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#1A1033', padding: 0 },
  appBarTitle: { fontWeight: 700, fontSize: 16, color: '#1A1033' },
  body: { padding: '24px 20px 48px', maxWidth: 480, margin: '0 auto' },
  feeCard: {
    background: 'rgba(123,95,238,0.07)', borderRadius: 14, padding: '14px 18px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  feeLabel: { fontWeight: 700, fontSize: 15, color: '#1A1033' },
  feeValue: { fontWeight: 700, fontSize: 15, color: '#1A1033' },
  feeNote: { fontSize: 13, color: '#555', marginBottom: 24 },
  sectionLabel: { fontWeight: 600, fontSize: 15, color: '#1A1033', margin: '0 0 12px' },
  methodTile: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
    padding: '12px 16px', borderRadius: 14, border: '1.5px solid #e8e8f0',
    background: '#fff', cursor: 'pointer', marginBottom: 10, textAlign: 'left',
  },
  methodTileActive: { border: `2px solid ${PRIMARY}`, background: 'rgba(123,95,238,0.05)' },
  methodIcon: {
    width: 40, height: 40, borderRadius: '50%', background: 'rgba(123,95,238,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  methodInitial: { fontWeight: 700, fontSize: 16, color: PRIMARY },
  methodName: { flex: 1, fontWeight: 600, fontSize: 14, color: '#1A1033', letterSpacing: 0.5 },
  input: {
    width: '100%', padding: '13px 14px', borderRadius: 12, border: '1.5px solid #e8e8f0',
    fontSize: 15, marginBottom: 16, boxSizing: 'border-box', outline: 'none', background: '#fff',
  },
  otpBtn: {
    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: PRIMARY, fontWeight: 600, cursor: 'pointer',
    fontSize: 14, marginTop: -8,
  },
  error: { color: '#e53935', fontSize: 13, marginBottom: 12 },
  payBtn: {
    width: '100%', padding: '16px 0', borderRadius: 16, background: PRIMARY,
    color: '#fff', fontSize: 17, fontWeight: 700, border: 'none', cursor: 'pointer',
    marginTop: 8,
  },
  // Awaiting
  awaitingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 },
  awaitingTitle: { fontSize: 22, fontWeight: 700, color: '#1A1033', marginBottom: 12 },
  awaitingDesc: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 1.6, marginBottom: 28 },
  spinner: {
    width: 36, height: 36, border: `3px solid rgba(123,95,238,0.2)`,
    borderTop: `3px solid ${PRIMARY}`, borderRadius: '50%',
    animation: 'spin 0.8s linear infinite', marginBottom: 28,
  },
  cancelBtn: {
    background: 'none', border: 'none', color: '#888', fontSize: 14, cursor: 'pointer',
  },
};
