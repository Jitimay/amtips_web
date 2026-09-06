import Head from 'next/head';

export default function DeleteAccount() {
  return (
    <>
      <Head>
        <title>Delete Account — amTips</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={s.page}>
        <div style={s.container}>
          <h1 style={s.h1}>Delete Your amTips Account</h1>
          <p style={s.sub}>This will permanently delete your account and all associated personal data.</p>

          <div style={s.card}>
            <h2 style={s.h2}>Option 1 — Delete from the app</h2>
            <p style={s.p}>Open the amTips app → <strong>Profile</strong> → <strong>Settings</strong> → <strong>Delete Account</strong></p>
          </div>

          <div style={s.card}>
            <h2 style={s.h2}>Option 2 — Request by email</h2>
            <p style={s.p}>Send an email to <a href="mailto:jitimayjosh1@gmail.com" style={s.link}>jitimayjosh1@gmail.com</a> with the subject <strong>"Account Deletion Request"</strong> and include the email address associated with your account.</p>
            <p style={s.p}>We will process your request within 7 days.</p>
          </div>

          <div style={s.notice}>
            <p style={s.p}><strong>What gets deleted:</strong> your profile, photo, payment accounts, wallet, notification history, and device tokens.</p>
            <p style={s.p}><strong>What is retained:</strong> tip and transaction records may be kept for financial and legal compliance purposes, in anonymised form where possible.</p>
          </div>
        </div>
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f4f4f8', padding: '40px 16px', fontFamily: 'system-ui, sans-serif' },
  container: { maxWidth: 600, margin: '0 auto' },
  h1: { fontSize: 26, fontWeight: 700, color: '#1A1033', marginBottom: 8 },
  h2: { fontSize: 15, fontWeight: 600, color: '#1A1033', marginBottom: 8 },
  sub: { fontSize: 14, color: '#666', marginBottom: 32 },
  card: { background: '#fff', borderRadius: 12, padding: '24px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  notice: { background: '#fff8f0', border: '1px solid #ffe0b2', borderRadius: 12, padding: '20px 24px', marginTop: 8 },
  p: { fontSize: 14, color: '#444', lineHeight: 1.7, margin: '0 0 8px' },
  link: { color: '#7B5FEE' },
};
