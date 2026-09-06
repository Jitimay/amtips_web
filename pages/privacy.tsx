import Head from 'next/head';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — amTips</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={s.page}>
        <div style={s.container}>
          <h1 style={s.h1}>Privacy Policy</h1>
          <p style={s.meta}>Effective date: August 26, 2026 · amTips by Josué Jitimay</p>

          <h2 style={s.h2}>1. What we collect</h2>
          <p style={s.p}>When you register as a service worker, we collect:</p>
          <ul style={s.ul}>
            <li>Name, email address, city, country, profession, and profile photo</li>
            <li>Mobile money phone number(s) used for withdrawals</li>
            <li>Firebase Cloud Messaging (FCM) token for push notifications</li>
          </ul>
          <p style={s.p}>When a customer sends a tip, we collect the tip amount, currency, optional message, optional rating, and whether the tip is anonymous. We do not store card numbers or full mobile money credentials — payment details are transmitted directly to AfriPay.</p>

          <h2 style={s.h2}>2. How we use your data</h2>
          <ul style={s.ul}>
            <li>To display your public tipping profile and generate your QR code</li>
            <li>To process tip payments and credit your wallet via AfriPay</li>
            <li>To process withdrawal disbursements to your mobile money account</li>
            <li>To send push notifications about tips received and withdrawal status</li>
            <li>To detect and fix crashes via Firebase Crashlytics</li>
          </ul>

          <h2 style={s.h2}>3. Payment and financial information</h2>
          <p style={s.p}>amTips uses AfriPay (Afriregister) to process all payments. When a customer tips you:</p>
          <ul style={s.ul}>
            <li>The customer's phone number and payment method are sent to AfriPay to initiate the transaction</li>
            <li>amTips stores the tip amount, currency, and transaction reference for your wallet and history</li>
            <li>amTips does not store full mobile money credentials or card numbers</li>
          </ul>
          <p style={s.p}>When you request a withdrawal, your registered mobile money number is sent to AfriPay to disburse funds. Transaction records are retained for financial compliance purposes even after account deletion.</p>

          <h2 style={s.h2}>4. Data sharing</h2>
          <p style={s.p}>We share data only with services required to operate amTips:</p>
          <ul style={s.ul}>
            <li><strong>Firebase (Google)</strong> — authentication, push notifications, and crash reporting</li>
            <li><strong>Supabase</strong> — database and file storage (hosted on AWS)</li>
            <li><strong>AfriPay / Afriregister</strong> — payment processing and disbursements</li>
          </ul>
          <p style={s.p}>We do not sell your data to third parties.</p>

          <h2 style={s.h2}>5. Public profile</h2>
          <p style={s.p}>Your name, photo, profession, city, personal message, and average rating are publicly visible to anyone who visits your tipping link or scans your QR code. Your email address, payment account details, and wallet balance are never public.</p>

          <h2 style={s.h2}>6. Data retention</h2>
          <p style={s.p}>Your account data is retained as long as your account is active. Upon account deletion, your personal profile data is permanently removed. Tip and transaction records may be retained for financial and legal compliance purposes.</p>

          <h2 style={s.h2}>7. Account deletion</h2>
          <p style={s.p}>You can permanently delete your account at any time:</p>
          <ul style={s.ul}>
            <li><strong>In the app:</strong> Settings → Delete Account</li>
            <li><strong>Online:</strong> <a href="https://amtips.app/delete-account" style={s.link}>amtips.app/delete-account</a></li>
            <li><strong>By email:</strong> <a href="mailto:jitimayjosh1@gmail.com" style={s.link}>jitimayjosh1@gmail.com</a></li>
          </ul>
          <p style={s.p}>Deletion removes your profile, payment accounts, wallet, and personal data. Transaction records may be retained where required by law.</p>

          <h2 style={s.h2}>8. Security</h2>
          <p style={s.p}>We use industry-standard security measures including encrypted connections (HTTPS/TLS), row-level security on our database, and secure storage for sensitive credentials. Passwords are managed by Firebase Authentication and are never stored by amTips.</p>

          <h2 style={s.h2}>9. Children</h2>
          <p style={s.p}>amTips is not directed at children under 16. We do not knowingly collect data from minors.</p>

          <h2 style={s.h2}>10. Changes to this policy</h2>
          <p style={s.p}>We may update this policy from time to time. We will notify you of significant changes via the app or email.</p>

          <h2 style={s.h2}>11. Contact</h2>
          <p style={s.p}>For privacy questions or data deletion requests, contact us at: <a href="mailto:jitimayjosh1@gmail.com" style={s.link}>jitimayjosh1@gmail.com</a></p>
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
