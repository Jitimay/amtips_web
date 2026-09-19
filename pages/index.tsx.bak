import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>amTips — Digital Tipping for Service Workers</title>
        <meta name="description" content="Receive digital tips instantly. Share your QR code and get paid with ease." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={s.root}>
        {/* NAV */}
        <nav style={s.nav}>
          <span style={s.logo}>am<span style={s.logoAccent}>Tips</span></span>
          <a href="https://play.google.com/store" style={s.navCta} target="_blank" rel="noreferrer">
            Download App
          </a>
        </nav>

        {/* HERO */}
        <section style={s.hero}>
          <div style={s.heroText}>
            <h1 style={s.h1}>
              Tip the people who make your<br />
              <span style={s.accent}>experience better.</span>
            </h1>
            <p style={s.heroSub}>
              amTips lets service workers receive digital tips instantly via QR code or a personal link — no cash, no hassle.
            </p>
            <div style={s.heroActions}>
              <a href="https://play.google.com/store" style={s.btnPrimary} target="_blank" rel="noreferrer">
                Get it on Google Play
              </a>
              <a href="#how" style={s.btnOutline}>See how it works</a>
            </div>
          </div>
          <div style={s.heroVisual}>
            <div style={s.phoneMock}>
              <div style={s.phoneMockInner}>
                <img src="/1.jpg" alt="amTips home screen" style={s.screenshotHero} />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section style={s.features}>
          <h2 style={s.sectionTitle}>Everything you need to get tipped</h2>
          <div style={s.featureGrid}>
            {[
              { icon: '📲', title: 'QR Code & Link', desc: 'Share your personal QR code or link. Customers tip you in seconds — no app needed on their side.' },
              { icon: '💰', title: 'Instant Wallet', desc: 'All tips land in your amTips wallet. Track your balance and full history in one place.' },
              { icon: '📤', title: 'Easy Withdrawals', desc: 'Cash out to your mobile money account anytime, directly from the app.' },
              { icon: '📊', title: 'Analytics', desc: 'See your earnings, ratings, and performance over time with a clear dashboard.' },
              { icon: '🎯', title: 'Campaigns', desc: 'Create tipping campaigns for special events, goals, or promotions.' },
              { icon: '🔔', title: 'Instant Notifications', desc: 'Get notified the moment a tip arrives so you never miss a payment.' },
            ].map(f => (
              <div key={f.title} style={s.featureCard}>
                <span style={s.featureIcon}>{f.icon}</span>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" style={s.how}>
          <h2 style={s.sectionTitle}>How it works</h2>
          <div style={s.steps}>
            {[
              { n: '1', title: 'Create your profile', desc: 'Sign up, add your photo, profession, and workplace.' },
              { n: '2', title: 'Share your QR code', desc: 'Display it on your table, uniform, or send your personal link.' },
              { n: '3', title: 'Receive tips', desc: 'Customers scan and tip you instantly — no app required on their end.' },
              { n: '4', title: 'Withdraw anytime', desc: 'Cash out to mobile money whenever you want.' },
            ].map(step => (
              <div key={step.n} style={s.step}>
                <div style={s.stepNum}>{step.n}</div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SCREENSHOTS */}
        <section style={s.screenshots}>
          <h2 style={s.sectionTitle}>See it in action</h2>
          <div style={s.screenshotGrid}>
            {[
              { src: '/1.jpg', label: 'Home' },
              { src: '/2.jpg', label: 'Campaigns' },
              { src: '/3.jpg', label: 'Wallet' },
              { src: '/4.jpg', label: 'Campaign Card' },
            ].map(({ src, label }) => (
              <div key={label} style={s.screenshotItem}>
                <img src={src} alt={label} style={s.screenshotImg} />
                <p style={s.screenshotLabel}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={s.cta}>
          <h2 style={s.ctaTitle}>Start receiving tips today</h2>
          <p style={s.ctaSub}>Free to download. Available on Android.</p>
          <a href="https://play.google.com/store" style={s.btnPrimary} target="_blank" rel="noreferrer">
            Download on Google Play
          </a>
        </section>

        {/* FOOTER */}
        <footer style={s.footer}>
          <span style={s.logo}>am<span style={s.logoAccent}>Tips</span></span>
          <div style={s.footerLinks}>
            <a href="/privacy" style={s.footerLink}>Privacy Policy</a>
            <a href="/terms" style={s.footerLink}>Terms of Service</a>
            <a href="/delete-account" style={s.footerLink}>Delete Account</a>
            <a href="mailto:support@amtips.app" style={s.footerLink}>Contact</a>
          </div>
          <p style={s.footerCopy}>© {new Date().getFullYear()} amTips. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}

const PRIMARY = '#6C3FC5';
const DARK = '#1A1033';

const s: Record<string, React.CSSProperties> = {
  root: { fontFamily: 'system-ui, -apple-system, sans-serif', color: DARK, background: '#fff' },

  // Nav
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #f0edf8', position: 'sticky', top: 0, background: '#fff', zIndex: 100 },
  logo: { fontSize: 22, fontWeight: 800, color: DARK, textDecoration: 'none' },
  logoAccent: { color: PRIMARY },
  navCta: { background: PRIMARY, color: '#fff', padding: '10px 22px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 },

  // Hero
  hero: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '80px 40px', gap: 40, flexWrap: 'wrap' as const },
  heroText: { flex: '1 1 400px', maxWidth: 560 },
  h1: { fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px' },
  accent: { color: PRIMARY },
  heroSub: { fontSize: 18, color: '#555', lineHeight: 1.7, margin: '0 0 36px' },
  heroActions: { display: 'flex', gap: 16, flexWrap: 'wrap' as const },
  btnPrimary: { background: PRIMARY, color: '#fff', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'inline-block' },
  btnOutline: { border: `2px solid ${PRIMARY}`, color: PRIMARY, padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'inline-block' },

  // Phone mock
  heroVisual: { flex: '1 1 280px', display: 'flex', justifyContent: 'center' },
  phoneMock: { width: 260, background: DARK, borderRadius: 32, padding: 16, boxShadow: '0 24px 60px rgba(108,63,197,0.25)' },
  phoneMockInner: { background: '#fff', borderRadius: 20, overflow: 'hidden' as const },
  screenshotHero: { width: '100%', display: 'block', borderRadius: 20 },

  // Features
  features: { background: '#faf8ff', padding: '80px 40px' },
  sectionTitle: { textAlign: 'center' as const, fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: '0 0 48px' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto' },
  featureCard: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  featureIcon: { fontSize: 32, display: 'block', marginBottom: 12 },
  featureTitle: { fontWeight: 700, fontSize: 17, margin: '0 0 8px' },
  featureDesc: { color: '#666', fontSize: 14, lineHeight: 1.7, margin: 0 },

  // How it works
  how: { padding: '80px 40px' },
  steps: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, maxWidth: 1000, margin: '0 auto' },
  step: { textAlign: 'center' as const },
  stepNum: { width: 48, height: 48, borderRadius: '50%', background: PRIMARY, color: '#fff', fontWeight: 800, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  stepTitle: { fontWeight: 700, fontSize: 16, margin: '0 0 8px' },
  stepDesc: { color: '#666', fontSize: 14, lineHeight: 1.7, margin: 0 },

  // Screenshots
  screenshots: { padding: '80px 40px', background: '#faf8ff' },
  screenshotGrid: { display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' as const, maxWidth: 1100, margin: '0 auto' },
  screenshotItem: { textAlign: 'center' as const },
  screenshotImg: { width: 200, borderRadius: 20, boxShadow: '0 8px 32px rgba(108,63,197,0.18)', display: 'block' },
  screenshotLabel: { marginTop: 12, fontWeight: 600, fontSize: 14, color: '#555' },

  // CTA
  cta: { background: PRIMARY, padding: '80px 40px', textAlign: 'center' as const },
  ctaTitle: { color: '#fff', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, margin: '0 0 12px' },
  ctaSub: { color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '0 0 32px' },

  // Footer
  footer: { padding: '40px', borderTop: '1px solid #f0edf8', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 16 },
  footerLinks: { display: 'flex', gap: 24, flexWrap: 'wrap' as const, justifyContent: 'center' },
  footerLink: { color: '#888', textDecoration: 'none', fontSize: 14 },
  footerCopy: { color: '#bbb', fontSize: 13, margin: 0 },
};
