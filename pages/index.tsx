import Head from 'next/head';
import { useEffect, useState } from 'react';

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 80);
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(id); }
      else setVal(start);
    }, 16);
    return () => clearInterval(id);
  }, [to]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <Head>
        <title>amTips — Digital Tipping for Service Workers</title>
        <meta name="description" content="Receive digital tips instantly via QR code or personal link. No cash, no hassle. Built for service workers in Africa." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <div className="root">

        {/* ── NAV ── */}
        <nav className="nav">
          <a href="/" className="logo">
            <img src="/logo.png" alt="amTips" height={32} />
          </a>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#features" className="nav-link" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how" className="nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#app" className="nav-link" onClick={() => setMenuOpen(false)}>App</a>
            <a href="https://play.google.com/store/apps/details?id=app.amtips.official" className="nav-cta" target="_blank" rel="noreferrer">
              Download
            </a>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="menu">
            <span /><span /><span />
          </button>
        </nav>

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-bg-glow" />
          <div className="hero-inner">
            <div className="hero-badge">🇧🇮 Now live in Burundi</div>
            <h1 className="hero-title">
              The smarter way to<br />
              <span className="hero-accent">receive tips digitally.</span>
            </h1>
            <p className="hero-sub">
              amTips lets service workers receive digital tips instantly via QR code
              or personal link — no cash, no app needed on the customer&apos;s side.
            </p>
            <div className="hero-actions">
              <a href="https://play.google.com/store/apps/details?id=app.amtips.official" className="btn-primary" target="_blank" rel="noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.28a2 2 0 0 0 2.84 0l11.2-11.2-2.83-2.83L3.18 20.44a2 2 0 0 0 0 2.84zM20.53 9.47l-2.6-1.5L15.3 10.6l2.83 2.83 2.4-1.38a1.76 1.76 0 0 0 0-3.06L20.53 9.47zM2.01 1.6A2 2 0 0 0 1 3.38v17.24a2 2 0 0 0 1.01 1.77l.1.06 9.65-9.65v-.23L2.11 1.54l-.1.06z"/></svg>
                Get it on Google Play
              </a>
              <a href="#how" className="btn-ghost">See how it works →</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="phone-frame">
              <div className="phone-notch" />
              <img src="/1.jpg" alt="amTips app screenshot" className="phone-img" />
            </div>
            <div className="phone-glow" />
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="stats">
          <div className="stats-inner">
            {[
              { label: 'Tips Sent', to: 12000, suffix: '+' },
              { label: 'Workers Registered', to: 850, suffix: '+' },
              { label: 'Avg. Rating', to: 49, suffix: '/5' },
              { label: 'Countries', to: 3, suffix: '' },
            ].map((s, i) => (
              <div className="stat-item" key={i}>
                <div className="stat-num">{mounted ? <Counter to={s.to} suffix={s.suffix} /> : `${s.to}${s.suffix}`}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="section feat-section">
          <div className="section-inner">
            <div className="section-label">Features</div>
            <h2 className="section-title">Everything you need<br />to <span className="text-accent">get tipped</span></h2>
            <p className="section-sub">A complete platform built specifically for service workers.</p>
            <div className="feat-grid">
              {[
                { icon: '📲', title: 'QR Code & Link', desc: 'Share your personal QR code or link. Customers tip in seconds — no app required on their end.', color: '#6366f1' },
                { icon: '💰', title: 'Instant Wallet', desc: 'All tips land in your amTips wallet. Track your full earnings history in one place.', color: '#10b981' },
                { icon: '📤', title: 'Easy Withdrawals', desc: 'Cash out to your mobile money account anytime, directly from the app.', color: '#f59e0b' },
                { icon: '📊', title: 'Analytics', desc: 'See your earnings, ratings, and performance over time with a beautiful dashboard.', color: '#3b82f6' },
                { icon: '🎯', title: 'Campaigns', desc: 'Create tipping campaigns for special events, goals, or promotions.', color: '#ec4899' },
                { icon: '🔔', title: 'Instant Notifications', desc: 'Get notified the moment a tip arrives so you never miss a payment.', color: '#8b5cf6' },
              ].map(f => (
                <div className="feat-card" key={f.title}>
                  <div className="feat-icon-wrap" style={{ background: f.color + '18', border: `1px solid ${f.color}30` }}>
                    <span className="feat-icon">{f.icon}</span>
                  </div>
                  <h3 className="feat-title">{f.title}</h3>
                  <p className="feat-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="section how-section">
          <div className="how-bg" />
          <div className="section-inner" style={{ position: 'relative', zIndex: 1 }}>
            <div className="section-label light">Process</div>
            <h2 className="section-title light">How it <span className="text-accent">works</span></h2>
            <p className="section-sub light">Up and running in under 5 minutes.</p>
            <div className="steps">
              {[
                { n: '01', title: 'Create your profile', desc: 'Sign up, add your photo, profession, and workplace. Your personal page is ready instantly.', icon: '👤' },
                { n: '02', title: 'Share your QR code', desc: 'Print it, display on your table or uniform, or send your link via WhatsApp.', icon: '📸' },
                { n: '03', title: 'Receive tips', desc: 'Customers scan and tip instantly — no app download or account needed on their end.', icon: '💸' },
                { n: '04', title: 'Withdraw anytime', desc: 'Cash out to mobile money whenever you want. Fast, simple, reliable.', icon: '🏦' },
              ].map((step, i) => (
                <div className="step-card" key={i}>
                  <div className="step-num-badge">{step.n}</div>
                  <div className="step-icon">{step.icon}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                  {i < 3 && <div className="step-arrow">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── APP SCREENSHOTS ── */}
        <section id="app" className="section app-section">
          <div className="section-inner">
            <div className="section-label">The App</div>
            <h2 className="section-title">See it <span className="text-accent">in action</span></h2>
            <p className="section-sub">Designed to be beautiful, fast, and intuitive.</p>
            <div className="ss-grid">
              {[
                { src: '/1.jpg', label: 'Dashboard', desc: 'Your earnings at a glance' },
                { src: '/2.jpg', label: 'Campaigns', desc: 'Create & share campaigns' },
                { src: '/3.jpg', label: 'Wallet', desc: 'Full transaction history' },
                { src: '/4.jpg', label: 'Campaign Card', desc: 'Beautiful shareable cards' },
              ].map(({ src, label, desc }) => (
                <div className="ss-item" key={label}>
                  <div className="ss-phone-wrap">
                    <div className="ss-phone">
                      <div className="ss-notch" />
                      <img src={src} alt={label} className="ss-img" />
                    </div>
                    <div className="ss-phone-shadow" />
                  </div>
                  <div className="ss-label">{label}</div>
                  <div className="ss-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL ── */}
        <section className="trust">
          <div className="trust-inner">
            <div className="quote-stars">★★★★★</div>
            <blockquote className="quote">
              &ldquo;amTips changed how I receive tips. No more fumbling for change — my customers just scan and it&apos;s done.&rdquo;
            </blockquote>
            <div className="quote-author">
              <div className="quote-avatar">JK</div>
              <div>
                <div className="quote-name">Jean-Klébert M.</div>
                <div className="quote-role">Waiter, Bujumbura</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta">
          <div className="cta-glow" />
          <div className="cta-inner">
            <h2 className="cta-title">Start receiving tips <span className="text-accent">today.</span></h2>
            <p className="cta-sub">Available on Android. No subscription. No hidden fees.</p>
            <a href="https://play.google.com/store/apps/details?id=app.amtips.official" className="btn-primary" target="_blank" rel="noreferrer">
              Download on Google Play
            </a>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <img src="/logo.png" alt="amTips" height={28} />
              <p className="footer-tagline">Digital tipping for the people who make your experience better.</p>
            </div>
            <div className="footer-links-group">
              <div className="footer-col">
                <div className="footer-col-title">Product</div>
                <a href="#features" className="footer-link">Features</a>
                <a href="#how" className="footer-link">How it works</a>
                <a href="#app" className="footer-link">App</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Legal</div>
                <a href="/privacy" className="footer-link">Privacy Policy</a>
                <a href="/terms" className="footer-link">Terms of Service</a>
                <a href="/delete-account" className="footer-link">Delete Account</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Support</div>
                <a href="/support" className="footer-link">AI Help Assistant</a>
                <a href="mailto:info@amtips.app" className="footer-link">info@amtips.app</a>
              </div>
            </div>
          </div>
          <p className="footer-copy" suppressHydrationWarning>© {new Date().getFullYear()} amTips. All rights reserved.</p>
        </footer>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue: #4F52FF;
          --blue-light: #6B7BFF;
          --blue-dark: #3B3ECC;
          --dark: #0a0a0f;
          --dark2: #13131f;
          --dark3: #1c1c2e;
          --surface: #f8f8fc;
          --surface2: #f0f0f8;
          --border: #e4e4f0;
          --text: #0a0a0f;
          --text2: #555570;
          --text3: #9090aa;
          --radius: 16px;
          --radius-lg: 24px;
        }

        html { scroll-behavior: smooth; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #fff;
          color: var(--text);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* ── NAV ── */
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 64px;
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .logo { display: flex; align-items: center; text-decoration: none; }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          color: var(--text2); text-decoration: none; font-size: 14px;
          font-weight: 500; padding: 7px 14px; border-radius: 8px;
          transition: all 0.2s; letter-spacing: 0.01em;
        }
        .nav-link:hover { color: var(--blue); background: #f0f0ff; }
        .nav-cta {
          display: inline-block; background: var(--blue); color: #fff !important;
          text-decoration: none; font-size: 13px; font-weight: 700;
          padding: 8px 18px; border-radius: 8px; margin-left: 8px;
          transition: background 0.2s, transform 0.15s;
        }
        .nav-cta:hover { background: var(--blue-dark); transform: translateY(-1px); }
        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .hamburger span { display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px; transition: all 0.2s; }

        /* ── HERO ── */
        .hero {
          display: flex; align-items: center; justify-content: space-between;
          gap: 60px; padding: 100px 64px 80px;
          max-width: 1200px; margin: 0 auto;
          position: relative;
        }
        .hero-bg-glow {
          position: absolute; top: 10%; right: 5%; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(79,82,255,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-inner { flex: 1 1 480px; max-width: 560px; position: relative; z-index: 1; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #f0f0ff, #e8e8ff);
          border: 1px solid #d0d0ff;
          border-radius: 100px; padding: 7px 18px;
          font-size: 13px; font-weight: 600; color: var(--blue);
          margin-bottom: 32px;
        }
        .hero-title {
          font-size: clamp(38px, 5vw, 62px); font-weight: 900;
          line-height: 1.08; letter-spacing: -2px;
          margin-bottom: 24px; color: var(--dark);
        }
        .hero-accent {
          background: linear-gradient(135deg, var(--blue) 0%, #8b5cf6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-accent {
          background: linear-gradient(135deg, var(--blue) 0%, #8b5cf6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub { font-size: 17px; color: var(--text2); line-height: 1.8; margin-bottom: 44px; }
        .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }

        /* phone frame */
        .hero-visual { flex: 1 1 260px; display: flex; justify-content: center; position: relative; z-index: 1; }
        .phone-frame {
          width: 240px; background: var(--dark); border-radius: 36px;
          padding: 14px 10px; border: 3px solid rgba(255,255,255,0.12);
          box-shadow: 0 40px 80px rgba(79,82,255,0.18), 0 0 0 1px rgba(0,0,0,0.08);
          position: relative;
        }
        .phone-notch {
          width: 60px; height: 10px; background: rgba(255,255,255,0.08);
          border-radius: 10px; margin: 0 auto 10px;
        }
        .phone-img { width: 100%; border-radius: 22px; display: block; }
        .phone-glow {
          position: absolute; bottom: -30px; left: 50%; transform: translateX(-50%);
          width: 200px; height: 60px;
          background: radial-gradient(ellipse, rgba(79,82,255,0.3) 0%, transparent 70%);
          filter: blur(16px);
        }

        /* ── BUTTONS ── */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--blue); color: #fff;
          padding: 14px 28px; border-radius: var(--radius);
          text-decoration: none; font-weight: 700; font-size: 15px;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(79,82,255,0.3);
        }
        .btn-primary:hover { background: var(--blue-dark); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(79,82,255,0.4); }
        .btn-ghost {
          display: inline-flex; align-items: center;
          color: var(--blue); font-weight: 600; font-size: 15px;
          text-decoration: none;
        }
        .btn-ghost:hover { text-decoration: underline; }

        /* ── STATS ── */
        .stats {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 56px 64px; background: var(--surface);
        }
        .stats-inner {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 24px; max-width: 1100px; margin: 0 auto;
        }
        .stat-item {
          text-align: center; padding: 24px;
          background: #fff; border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .stat-num { font-size: clamp(32px, 4vw, 48px); font-weight: 900; letter-spacing: -1.5px; color: var(--blue); }
        .stat-label { font-size: 13px; color: var(--text3); font-weight: 500; margin-top: 6px; }

        /* ── SECTIONS ── */
        .section { padding: 100px 64px; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-label {
          display: inline-block;
          font-size: 11px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 2px; color: var(--blue);
          background: #f0f0ff; border: 1px solid #d8d8ff;
          padding: 5px 14px; border-radius: 100px; margin-bottom: 20px;
        }
        .section-label.light { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.9); }
        .section-title {
          font-size: clamp(30px, 4vw, 48px); font-weight: 900;
          letter-spacing: -1.5px; line-height: 1.15; margin-bottom: 16px; color: var(--dark);
        }
        .section-title.light { color: #fff; }
        .section-sub { font-size: 16px; color: var(--text2); line-height: 1.75; max-width: 500px; margin-bottom: 64px; }
        .section-sub.light { color: rgba(255,255,255,0.7); }

        /* ── FEATURES ── */
        .feat-section { background: #fff; }
        .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .feat-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 28px;
          transition: all 0.25s; cursor: default;
        }
        .feat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(79,82,255,0.1); border-color: #c0c0ff; }
        .feat-icon-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .feat-icon { font-size: 26px; line-height: 1; }
        .feat-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; color: var(--dark); }
        .feat-desc { font-size: 14px; color: var(--text2); line-height: 1.7; }

        /* ── HOW IT WORKS ── */
        .how-section { background: var(--dark); position: relative; overflow: hidden; }
        .how-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #0d0d1a 0%, #1a1040 50%, #0d0d1a 100%);
          pointer-events: none;
        }
        .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative; }
        .step-card {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-lg); padding: 32px 24px;
          position: relative; transition: all 0.25s;
        }
        .step-card:hover { background: rgba(255,255,255,0.08); transform: translateY(-4px); }
        .step-card:not(:last-child) { margin-right: 16px; }
        .step-num-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--blue); color: #fff;
          font-size: 12px; font-weight: 900; letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        .step-icon { font-size: 32px; margin-bottom: 16px; display: block; }
        .step-title { font-size: 15px; font-weight: 700; margin-bottom: 10px; color: #fff; }
        .step-desc { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.7; }
        .step-arrow {
          position: absolute; right: -28px; top: 50%; transform: translateY(-50%);
          font-size: 22px; color: rgba(255,255,255,0.2); z-index: 2;
          display: none;
        }

        /* ── APP SCREENSHOTS ── */
        .app-section { background: var(--surface); }
        .ss-grid { display: flex; justify-content: center; gap: 32px; flex-wrap: wrap; }
        .ss-item { text-align: center; }
        .ss-phone-wrap { position: relative; margin-bottom: 16px; display: inline-block; }
        .ss-phone {
          width: 160px; background: var(--dark);
          border-radius: 28px; padding: 10px 8px;
          border: 2px solid rgba(0,0,0,0.08);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
          transition: transform 0.3s ease; position: relative;
        }
        .ss-phone:hover { transform: translateY(-10px) scale(1.02); }
        .ss-notch {
          width: 40px; height: 8px; background: rgba(255,255,255,0.08);
          border-radius: 8px; margin: 0 auto 8px;
        }
        .ss-phone-shadow {
          position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%);
          width: 120px; height: 30px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.2) 0%, transparent 70%);
          filter: blur(8px);
        }
        .ss-img { width: 100%; border-radius: 18px; display: block; }
        .ss-label { font-size: 14px; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
        .ss-desc { font-size: 12px; color: var(--text3); }

        /* ── TESTIMONIAL ── */
        .trust { padding: 100px 64px; background: #fff; }
        .trust-inner { max-width: 680px; margin: 0 auto; text-align: center; }
        .quote-stars { font-size: 24px; color: #f59e0b; letter-spacing: 4px; margin-bottom: 24px; }
        .quote {
          font-size: clamp(18px, 2.5vw, 22px); font-weight: 600;
          color: var(--dark); line-height: 1.7; font-style: italic;
          margin-bottom: 32px;
        }
        .quote-author { display: inline-flex; align-items: center; gap: 12px; }
        .quote-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, var(--blue), #8b5cf6);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 14px; flex-shrink: 0;
        }
        .quote-name { font-weight: 700; font-size: 15px; text-align: left; color: var(--dark); }
        .quote-role { font-size: 13px; color: var(--text3); text-align: left; }

        /* ── CTA ── */
        .cta {
          padding: 100px 64px;
          background: linear-gradient(135deg, #0d0d1a, #1a1040);
          position: relative; overflow: hidden;
        }
        .cta-glow {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 600px; height: 300px;
          background: radial-gradient(ellipse, rgba(79,82,255,0.3) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-inner { max-width: 700px; margin: 0 auto; text-align: center; position: relative; z-index: 1; }
        .cta-title {
          font-size: clamp(32px, 4vw, 52px); font-weight: 900;
          letter-spacing: -1.5px; margin-bottom: 16px; color: #fff;
        }
        .cta-sub { font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 40px; }

        /* ── FOOTER ── */
        .footer { padding: 60px 64px 32px; background: var(--dark2); border-top: 1px solid rgba(255,255,255,0.06); }
        .footer-inner {
          display: flex; justify-content: space-between; gap: 48px;
          max-width: 1100px; margin: 0 auto 40px; flex-wrap: wrap;
        }
        .footer-brand { max-width: 260px; }
        .footer-tagline { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.7; margin-top: 14px; }
        .footer-links-group { display: flex; gap: 60px; flex-wrap: wrap; }
        .footer-col { display: flex; flex-direction: column; gap: 10px; }
        .footer-col-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.3); margin-bottom: 4px; }
        .footer-link { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .footer-link:hover { color: #fff; }
        .footer-copy {
          text-align: center; font-size: 12px; color: rgba(255,255,255,0.25);
          max-width: 1100px; margin: 0 auto; padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 960px) {
          .nav { padding: 14px 24px; }
          .nav-links { display: none; flex-direction: column; align-items: flex-start; gap: 4px; position: absolute; top: 100%; left: 0; right: 0; background: rgba(255,255,255,0.98); backdrop-filter: blur(20px); padding: 16px 24px; border-bottom: 1px solid var(--border); z-index: 99; }
          .nav-links.open { display: flex; }
          .hamburger { display: flex; }
          .hero { flex-direction: column; padding: 60px 24px 48px; text-align: center; }
          .hero-actions { justify-content: center; }
          .hero-bg-glow { display: none; }
          .stats { padding: 40px 24px; }
          .stats-inner { grid-template-columns: repeat(2, 1fr); }
          .section { padding: 72px 24px; }
          .section-sub { margin-bottom: 48px; }
          .feat-grid { grid-template-columns: 1fr 1fr; }
          .steps { grid-template-columns: 1fr 1fr; gap: 16px; }
          .step-card { margin-right: 0 !important; }
          .trust, .cta { padding: 72px 24px; }
          .footer { padding: 48px 24px 24px; }
          .footer-inner { flex-direction: column; }
        }
        @media (max-width: 520px) {
          .stats-inner { grid-template-columns: 1fr 1fr; gap: 12px; }
          .feat-grid { grid-template-columns: 1fr; }
          .steps { grid-template-columns: 1fr; }
          .ss-phone { width: 130px; }
          .footer-links-group { gap: 32px; }
        }
      `}</style>
    </>
  );
}
