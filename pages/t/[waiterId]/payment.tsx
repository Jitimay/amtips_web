import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const PRIMARY = '#7B5FEE';
const GATEWAY_FEE = 0.04;
const PLATFORM_FEE = 0.01;

type Method = {
  id: string;
  name: string;
  icon_url: string | null;
  requires_otp: boolean;
  description?: string;
};

type Step = 'form' | 'awaiting' | 'success' | 'failed';

function parseAfriPaySteps(raw?: string | null) {
  if (!raw) return [];
  const cleanMsg = raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  const rawLines = cleanMsg.split('\n').map((l) => l.trim()).filter(Boolean);

  const steps: { number: number; emoji: string; text: string }[] = [];
  let count = 1;
  for (const line of rawLines) {
    const lower = line.toLowerCase();
    if (
      lower.includes('has been created') ||
      lower.includes('demande de paiement a été') ||
      lower.includes('payment request has')
    ) {
      continue;
    }
    let emoji = '👉';
    if (line.includes('*') || lower.includes('composer') || lower.includes('dial')) {
      emoji = '📞';
    } else if (lower.includes('choisir') || lower.includes('select') || lower.includes('appuyer')) {
      emoji = '👆';
    } else if (lower.includes('attente') || lower.includes('pending')) {
      emoji = '⏳';
    } else if (
      lower.includes('confirmer') ||
      lower.includes('confirm') ||
      lower.includes('pin') ||
      lower.includes('code')
    ) {
      emoji = '🔐';
    }
    steps.push({ number: count++, emoji, text: line });
  }
  return steps;
}

function extractUssdCode(text?: string | null): string | null {
  if (!text) return null;
  const match = text.match(/\*[0-9]+#/);
  return match ? match[0] : null;
}

function renderHighlightedText(text: string) {
  const parts = text.split(/(\*[0-9]+#|8 Online|Online payment|Paiement en attente|eCommerce|confirmer le paiement|confirm the payment)/gi);
  return parts.map((part, i) => {
    const isKeyword = /(\*[0-9]+#|8 Online|Online payment|Paiement en attente|eCommerce|confirmer le paiement|confirm the payment)/gi.test(part);
    if (isKeyword) {
      return (
        <span key={i} style={{ color: '#FCD34D', fontWeight: 700 }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function PaymentPage() {
  const router = useRouter();
  const { waiterId, amount: amountQ, currency: currencyQ, message: messageQ } = router.query;
  const message = (messageQ as string) || undefined;

  const amount = parseInt(amountQ as string) || 0;
  const currency = (currencyQ as string) || 'BIF';
  const waiterReceives = Math.round(amount * (1 - GATEWAY_FEE - PLATFORM_FEE));

  const [methods, setMethods] = useState<Method[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [dialCode, setDialCode] = useState('257');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);
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
      try {
        const res = await fetch(`/api/payment-status?token=${clientToken}`);
        const data = await res.json();
        if (data.status === 'completed') {
          if (pollRef.current) clearInterval(pollRef.current);
          router.replace(`/t/${waiterId}/success?token=${clientToken}`);
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          if (pollRef.current) clearInterval(pollRef.current);
          setFailureReason(
            data.failureReason || 'Payment failed or was cancelled by provider.'
          );
          setStep('failed');
        } else if (++tries > 40) {
          if (pollRef.current) clearInterval(pollRef.current);
          setFailureReason(
            'Payment request timed out after 2 minutes. Please check your mobile money balance.'
          );
          setStep('failed');
        }
      } catch (_) {
        // network glitch while polling — keep polling
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, clientToken, waiterId, router]);

  async function requestOtp() {
    if (!phone || !selectedId) {
      setError('Enter your phone number and select a method first.');
      return;
    }
    setRequestingOtp(true);
    setError(null);
    const res = await fetch('/api/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: dialCode + phone, paymentMethod: selectedId }),
    });
    const data = await res.json();
    setRequestingOtp(false);
    if (data.status === 'error') {
      setError(data.message ?? 'OTP request failed.');
    } else {
      setError(null);
      if (data.message) setApiMessage(data.message);
    }
  }

  async function pay() {
    if (!phone) {
      setError('Enter your mobile money number.');
      return;
    }
    if (!selectedId) {
      setError('Select a payment method.');
      return;
    }
    if (requiresOtp && !otp) {
      setError('Enter the OTP sent to your phone.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const res = await fetch('/api/initiate-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        waiterId,
        amount,
        currency,
        phone: dialCode + phone,
        paymentMethod: selectedId,
        otp: requiresOtp ? otp : undefined,
        message,
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok || data.status === 'error') {
      setError(data.message ?? 'Payment failed. Please try again.');
      return;
    }

    const selectedMethod = methods.find((m) => m.id === selectedId);
    const displayMsg =
      data.message || selectedMethod?.description || null;

    setApiMessage(displayMsg);
    setClientToken(data.clientToken);
    setStep('awaiting');
  }

  if (!amount || !waiterId) return null;

  return (
    <>
      <Head>
        <title>Pay your tip — amTips</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
              {/* Action Banner */}
              <div style={s.actionBadge}>
                <span style={s.actionBadgeText}>⚡ ACTION REQUISE SUR VOTRE TÉLÉPHONE</span>
              </div>
              <p style={s.actionSubtitle}>
                Suivez ces étapes pour valider et confirmer votre pourboire :
              </p>

              {/* 1-Tap USSD Call Button */}
              {(() => {
                const ussd = extractUssdCode(apiMessage);
                if (!ussd) return null;
                const encoded = encodeURIComponent(ussd);
                return (
                  <a
                    href={`tel:${encoded}`}
                    style={s.ussdBtn}
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(ussd).catch(() => {});
                      }
                    }}
                  >
                    <span style={{ fontSize: 18 }}>📞</span>
                    <span>Composer {ussd}</span>
                  </a>
                );
              })()}

              {/* Step cards */}
              {(() => {
                const steps = parseAfriPaySteps(apiMessage);
                if (steps.length === 0) {
                  return (
                    <div style={s.fallbackCard}>
                      <span style={{ fontSize: 26, marginBottom: 8, display: 'block' }}>📱</span>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#fff' }}>
                        Veuillez valider le paiement sur votre téléphone
                      </p>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                        Confirmez la transaction avec votre code PIN secret.
                      </p>
                    </div>
                  );
                }

                return (
                  <div style={s.stepsList}>
                    {steps.map((st) => (
                      <div key={st.number} style={s.stepItem}>
                        <div style={s.stepBadge}>{st.number}</div>
                        <div style={s.stepEmoji}>{st.emoji}</div>
                        <div style={s.stepText}>
                          {renderHighlightedText(st.text)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Loading & Status */}
              <div style={s.awaitingStatusRow}>
                <div style={s.spinnerMini} />
                <span style={s.awaitingStatusText}>En attente de confirmation...</span>
              </div>

              <button
                onClick={() => {
                  if (pollRef.current) clearInterval(pollRef.current);
                  setStep('form');
                }}
                style={s.cancelBtnRed}
              >
                Annuler le paiement
              </button>
            </div>
          ) : step === 'failed' ? (
            <div style={s.awaitingWrap}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
              <h2 style={s.awaitingTitle}>Payment failed</h2>
              <p style={s.awaitingDesc}>
                Your payment could not be completed.
              </p>

              <div style={s.errorCard}>
                <p style={s.errorCardTitle}>Provider Response / Reason:</p>
                <p style={s.errorCardText}>
                  {failureReason || apiMessage || 'Transaction failed or was cancelled by provider.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 24 }}>
                <button
                  onClick={() => {
                    setError(null);
                    setStep('form');
                  }}
                  style={{ ...s.payBtn, flex: 1, marginTop: 0 }}
                >
                  Try again
                </button>
                <button
                  onClick={() => router.back()}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    borderRadius: 16,
                    color: '#fff',
                    flex: 1,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Back
                </button>
              </div>
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
                <span style={{ color: '#aaa', fontSize: 12 }}> (after 5% fees)</span>
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
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={s.methodName}>{m.name.toUpperCase()}</span>
                    </div>
                    {selectedId === m.id && <span style={{ color: PRIMARY, fontSize: 20 }}>✓</span>}
                  </button>
                ))
              )}

              {/* Phone */}
              <p style={s.sectionLabel}>Your mobile money number</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
                  style={{ ...s.input, width: 'auto', paddingRight: 8, flexShrink: 0 }}
                >
                  {[
                    { flag: '🇧🇮', code: '257', label: '+257' },
                    { flag: '🇷🇼', code: '250', label: '+250' },
                    { flag: '🇨🇩', code: '243', label: '+243' },
                    { flag: '🇹🇿', code: '255', label: '+255' },
                    { flag: '🇰🇪', code: '254', label: '+254' },
                    { flag: '🇺🇬', code: '256', label: '+256' },
                  ].map(({ flag, code, label }) => (
                    <option key={code} value={code}>{flag} {label}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="61 234 567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  style={{ ...s.input, flex: 1 }}
                />
              </div>

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
                {submitting ? 'Processing…' : `Give tip · ${amount.toLocaleString()} ${currency}`}
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
  // Awaiting & Failed cards
  awaitingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#1C1830',
    borderRadius: 24,
    padding: '36px 24px',
    color: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
    margin: '12px 0',
  },
    actionBadge: {
    background: 'rgba(252, 211, 77, 0.15)',
    border: '1px solid rgba(252, 211, 77, 0.35)',
    borderRadius: 999,
    padding: '6px 14px',
    marginBottom: 10,
    display: 'inline-flex',
    alignItems: 'center',
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: 800,
    color: '#FCD34D',
    letterSpacing: 0.6,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 1.5,
    margin: '0 0 16px',
    maxWidth: 320,
  },
  ussdBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '12px 20px',
    borderRadius: 14,
    background: '#7B5FEE',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 15,
    marginBottom: 16,
    boxShadow: '0 4px 16px rgba(123, 95, 238, 0.4)',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  stepsList: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: '12px 14px',
    boxSizing: 'border-box',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#7B5FEE',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
    marginTop: 2,
  },
  stepEmoji: {
    fontSize: 18,
    flexShrink: 0,
    lineHeight: 1.3,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#F1F0F8',
    lineHeight: 1.55,
  },
  fallbackCard: {
    width: '100%',
    background: 'rgba(123, 95, 238, 0.15)',
    border: '1px solid rgba(123, 95, 238, 0.35)',
    borderRadius: 16,
    padding: '20px',
    textAlign: 'center',
    marginBottom: 16,
    boxSizing: 'border-box',
  },
  awaitingStatusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 16,
  },
  spinnerMini: {
    width: 20,
    height: 20,
    border: '2.5px solid rgba(255, 255, 255, 0.2)',
    borderTop: '2.5px solid #7B5FEE',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  },
  awaitingStatusText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 500,
  },
  phoneCircle: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'rgba(123, 95, 238, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  awaitingTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  awaitingDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
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
    marginBottom: 20,
    boxSizing: 'border-box',
  },
  errorCardTitle: {
    margin: '0 0 6px',
    fontSize: 13,
    fontWeight: 700,
    color: '#FCA5A5',
  },
  errorCardText: {
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
    color: '#FEE2E2',
    lineHeight: 1.5,
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
    marginBottom: 24,
  },
  cancelBtnRed: {
    background: 'none',
    border: 'none',
    color: '#EF4444',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
