import Head from 'next/head';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — amTips</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={s.page}>
        <div style={s.container}>
          <h1 style={s.h1}>Terms of Service</h1>
          <p style={s.meta}>Effective date: August 26, 2026 · amTips by Josué Jitimay</p>

          <h2 style={s.h2}>1. About amTips</h2>
          <p style={s.p}>amTips is a digital tipping platform that allows customers to tip service workers (waiters, musicians, taxi drivers, and others) via QR code and mobile money. By using amTips, you agree to these terms.</p>

          <h2 style={s.h2}>2. Eligibility</h2>
          <p style={s.p}>You must be at least 16 years old to create an account. By registering, you confirm that the information you provide is accurate and complete.</p>

          <h2 style={s.h2}>3. Service worker accounts</h2>
          <p style={s.p}>As a registered service worker, you are responsible for keeping your account credentials secure, providing accurate payment account information for withdrawals, and ensuring your profile information is truthful.</p>

          <h2 style={s.h2}>4. Payments and fees</h2>
          <p style={s.p}>Tips are processed through AfriPay. The following fees apply:</p>
          <ul style={s.ul}>
            <li>AfriPay gateway fee: 4% of the tip amount (charged to the customer)</li>
            <li>amTips platform fee: 6% of the tip amount</li>
            <li>Total deduction: 10% — the service worker receives 90% of the tip</li>
          </ul>
          <p style={s.p}>LumiCash may apply their own withdrawal fee (3%) when funds are transferred to your mobile money account. This fee is between you and LumiCash and is not collected by amTips.</p>

          <h2 style={s.h2}>5. Withdrawals</h2>
          <p style={s.p}>Withdrawals are processed to your registered mobile money account. Minimum withdrawal amount is 1,000 BIF. amTips does not guarantee specific processing times as these depend on the payment provider.</p>

          <h2 style={s.h2}>6. Prohibited use</h2>
          <p style={s.p}>You may not use amTips to process fraudulent transactions, impersonate another person, or violate any applicable laws. We reserve the right to suspend accounts that violate these terms.</p>

          <h2 style={s.h2}>7. Limitation of liability</h2>
          <p style={s.p}>amTips is provided "as is". We are not liable for payment failures caused by third-party providers (AfriPay, LumiCash, BANCOBU eNoti), network outages, or events outside our control.</p>

          <h2 style={s.h2}>8. Changes to these terms</h2>
          <p style={s.p}>We may update these terms at any time. Continued use of amTips after changes constitutes acceptance of the new terms.</p>

          <h2 style={s.h2}>9. Contact</h2>
          <p style={s.p}>Questions about these terms? Contact us at: <a href="mailto:jitimayjosh1@gmail.com" style={s.link}>jitimayjosh1@gmail.com</a></p>
        </div>
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f4f4f8', padding: '40px 16px', fontFamily: 'system-ui, sans-serif' },
  container: { maxWidth: 680, margin: '0 auto', background: '#fff', borderRadius: 16, padding: '40px 32px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  h1: { fontSize: 28, fontWeight: 700, color: '#1A1033', marginBottom: 4 },
  h2: { fontSize: 17, fontWeight: 600, color: '#1A1033', marginTop: 28, marginBottom: 8 },
  meta: { fontSize: 13, color: '#999', marginBottom: 32 },
  p: { fontSize: 14, color: '#444', lineHeight: 1.7, margin: '0 0 12px' },
  ul: { fontSize: 14, color: '#444', lineHeight: 1.9, paddingLeft: 20, margin: '0 0 12px' },
  link: { color: '#7B5FEE' },
};
