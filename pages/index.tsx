import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

// ── Intersection Observer hook for scroll reveals ──────────────────────────
function useReveal() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ── Animated counter ───────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { ref, visible } = useReveal();
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(id); }
      else setVal(start);
    }, 16);
    return () => clearInterval(id);
  }, [visible, to]);
  return <span ref={ref as any}>{mounted ? val.toLocaleString() : val}{suffix}</span>;
}

export default function Home() {
  const heroReveal = useReveal();
  const featReveal = useReveal();
  const howReveal = useReveal();
  const ssReveal = useReveal();
  const statReveal = useReveal();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>amTips — Digital Tipping for Service Workers</title>
        <meta name="description" content="Receive digital tips instantly via QR code or personal link. No cash, no hassle. Built for service workers in Africa." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="amTips — Digital Tipping" />
        <meta property="og:description" content="Receive digital tips instantly. Share your QR code and get paid with ease." />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="root">

        {/* ── NAV ─────────────────────────────────────────────────────── */}
        <nav className="nav">
          <a href="/" className="logo" id="nav-logo">
            <img src="/logo.png" alt="amTips" height={32} />
          </a>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#features" className="nav-link" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how" className="nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#screenshots" className="nav-link" onClick={() => setMenuOpen(false)}>App</a>
            <a href="https://drive.google.com/uc?export=download&id=1xLDjQRtmndpRj7QS9Rbb-Yv7kjFpKXE2" className="btn-nav" target="_blank" rel="noreferrer" id="nav-download-btn">
              Download Free
            </a>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="menu" id="hamburger-btn">
            <span /><span /><span />
          </button>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────────── */}
        <section className={`hero ${heroReveal.visible ? 'revealed' : ''}`} ref={heroReveal.ref as any}>
          <div className="blob blob1" />
          <div className="blob blob2" />
          <div className="blob blob3" />

          <div className="hero-inner">
            <div className="hero-text">
              <div className="badge" id="hero-badge">
                <span className="badge-dot" />
                Now live in Burundi
              </div>
              <h1 className="h1" id="hero-title">
                The smarter way to<br />
                <span className="gradient-text">receive tips digitally.</span>
              </h1>
              <p className="hero-sub" id="hero-sub">
                amTips lets service workers receive digital tips instantly via QR code or personal link —
                no cash, no app needed on the customer&apos;s side.
              </p>
              <div className="hero-actions">
                <a href="https://drive.google.com/uc?export=download&id=1xLDjQRtmndpRj7QS9Rbb-Yv7kjFpKXE2" className="btn-primary" target="_blank" rel="noreferrer" id="hero-download-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76a1.5 1.5 0 0 0 2.05.56l12.4-7.17-2.93-2.92-11.52 9.53zM20.84 9.74 17.1 7.6 13.83 11l3.6 3.6 3.42-1.97a1.5 1.5 0 0 0-.01-2.89zM1.5.56A1.5 1.5 0 0 0 1 1.72v20.56a1.5 1.5 0 0 0 .5 1.16L13.1 12 1.5.56zM5.23.25 17.1 7.6l-3.27 3.37L2.6.24A1.5 1.5 0 0 0 5.23.25z" /></svg>
                  Get it on Google Play
                </a>
                <a href="#how" className="btn-outline" id="hero-how-btn">See how it works</a>
              </div>
            </div>

            <div className="hero-visual">
              <div className="phone-wrap">
                <div className="phone-glow" />
                <div className="phone">
                  <div className="phone-notch" />
                  <img src="/1.jpg" alt="amTips screen" className="phone-img" />
                </div>
                <div className="float-card float-card-1" id="float-card-tip">
                  <span className="float-icon">💸</span>
                  <div>
                    <div className="float-label">Tip received</div>
                    <div className="float-value">+5,000 BIF</div>
                  </div>
                </div>
                <div className="float-card float-card-2" id="float-card-rating">
                  <span className="float-icon">⭐</span>
                  <div>
                    <div className="float-label">Rating</div>
                    <div className="float-value">4.9 / 5.0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ───────────────────────────────────────────────────── */}
        <section className={`stats ${statReveal.visible ? 'revealed' : ''}`} ref={statReveal.ref as any}>
          <div className="stats-inner">
            {[
              { label: 'Tips Sent', to: 12000, suffix: '+' },
              { label: 'Workers Registered', to: 850, suffix: '+' },
              { label: 'Avg. Rating', to: 49, suffix: '/5' },
              { label: 'Countries', to: 3, suffix: '' },
            ].map((s, i) => (
              <div className="stat-item" key={i}>
                <div className="stat-num"><Counter to={s.to} suffix={s.suffix} /></div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────────── */}
        <section id="features" className={`features ${featReveal.visible ? 'revealed' : ''}`} ref={featReveal.ref as any}>
          <div className="section-header">
            <div className="section-tag">Features</div>
            <h2 className="section-title">Everything you need<br />to get tipped</h2>
            <p className="section-sub">A complete platform built specifically for service workers.</p>
          </div>
          <div className="feat-grid">
            {[
              { icon: '📲', title: 'QR Code & Link', desc: 'Share your personal QR code or link. Customers tip in seconds — no app required.', color: '#6C3FC5' },
              { icon: '💰', title: 'Instant Wallet', desc: 'All tips land in your amTips wallet. Track your full earnings history in one place.', color: '#10B981' },
              { icon: '📤', title: 'Easy Withdrawals', desc: 'Cash out to your mobile money account anytime, directly from the app.', color: '#F59E0B' },
              { icon: '📊', title: 'Analytics', desc: 'See your earnings, ratings, and performance over time with a clear dashboard.', color: '#3B82F6' },
              { icon: '🎯', title: 'Campaigns', desc: 'Create tipping campaigns for special events, goals, or promotions with shareable cards.', color: '#EF4444' },
              { icon: '🔔', title: 'Instant Notifications', desc: 'Get notified the moment a tip arrives so you never miss a payment.', color: '#8B5CF6' },
            ].map(f => (
              <div className="feat-card" key={f.title} style={{ '--feat-color': f.color } as any}>
                <div className="feat-icon-wrap"><span className="feat-icon">{f.icon}</span></div>
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
        <section id="how" className={`how ${howReveal.visible ? 'revealed' : ''}`} ref={howReveal.ref as any}>
          <div className="how-bg" />
          <div className="section-header">
            <div className="section-tag">Process</div>
            <h2 className="section-title">How it works</h2>
            <p className="section-sub">Up and running in under 5 minutes.</p>
          </div>
          <div className="steps">
            {[
              { n: '01', title: 'Create your profile', desc: 'Sign up, add your photo, profession, and workplace. Your personal page is ready instantly.' },
              { n: '02', title: 'Share your QR code', desc: 'Print it, display on your table or uniform, or send your link via WhatsApp.' },
              { n: '03', title: 'Receive tips', desc: 'Customers scan and tip instantly — no app download or account needed on their end.' },
              { n: '04', title: 'Withdraw anytime', desc: 'Cash out to mobile money whenever you want. Fast, simple, reliable.' },
            ].map((step, i) => (
              <div className="step" key={i}>
                <div className="step-num">{step.n}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── APP SCREENSHOTS ─────────────────────────────────────────── */}
        <section id="screenshots" className={`screenshots ${ssReveal.visible ? 'revealed' : ''}`} ref={ssReveal.ref as any}>
          <div className="section-header">
            <div className="section-tag">The App</div>
            <h2 className="section-title">See it in action</h2>
            <p className="section-sub">Designed to be beautiful, fast, and intuitive.</p>
          </div>
          <div className="ss-grid">
            {[
              { src: '/1.jpg', label: 'Dashboard', desc: 'Your earnings at a glance' },
              { src: '/2.jpg', label: 'Campaigns', desc: 'Create & share campaigns' },
              { src: '/3.jpg', label: 'Wallet', desc: 'Full transaction history' },
              { src: '/4.jpg', label: 'Campaign Card', desc: 'Beautiful shareable cards' },
            ].map(({ src, label, desc }) => (
              <div className="ss-item" key={label}>
                <div className="ss-phone">
                  <img src={src} alt={label} className="ss-img" />
                </div>
                <div className="ss-label">{label}</div>
                <div className="ss-desc">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIAL ─────────────────────────────────────────────── */}
        <section className="trust">
          <div className="trust-inner">
            <div className="quote-marks">&ldquo;</div>
            <blockquote className="quote">
              amTips changed how I receive tips. No more fumbling for change — my customers just scan and it&apos;s done.
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

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <section className="cta">
          <div className="cta-blob1" />
          <div className="cta-blob2" />
          <div className="cta-inner">
            <div className="cta-tag">Free to download</div>
            <h2 className="cta-title">Start receiving tips today.</h2>
            <p className="cta-sub">Available on Android. No subscription. No hidden fees.</p>
            <a href="https://drive.google.com/uc?export=download&id=1xLDjQRtmndpRj7QS9Rbb-Yv7kjFpKXE2" className="btn-cta" target="_blank" rel="noreferrer" id="cta-download-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76a1.5 1.5 0 0 0 2.05.56l12.4-7.17-2.93-2.92-11.52 9.53zM20.84 9.74 17.1 7.6 13.83 11l3.6 3.6 3.42-1.97a1.5 1.5 0 0 0-.01-2.89zM1.5.56A1.5 1.5 0 0 0 1 1.72v20.56a1.5 1.5 0 0 0 .5 1.16L13.1 12 1.5.56zM5.23.25 17.1 7.6l-3.27 3.37L2.6.24A1.5 1.5 0 0 0 5.23.25z" /></svg>
              Download on Google Play
            </a>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
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
                <a href="#screenshots" className="footer-link">App</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Legal</div>
                <a href="/privacy" className="footer-link">Privacy Policy</a>
                <a href="/terms" className="footer-link">Terms of Service</a>
                <a href="/delete-account" className="footer-link">Delete Account</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Contact</div>
                <a href="mailto:support@amtips.app" className="footer-link">support@amtips.app</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p suppressHydrationWarning>© {new Date().getFullYear()} amTips. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --primary: #6C3FC5;
          --primary-light: #8B5CF6;
          --primary-dark: #4C2D9C;
          --accent: #F59E0B;
          --dark: #0D0B1A;
          --dark2: #13102A;
          --dark3: #1C1838;
          --surface: #1E1A35;
          --border: rgba(255,255,255,0.08);
          --text: #F0EEFF;
          --text-2: rgba(240,238,255,0.65);
          --text-3: rgba(240,238,255,0.4);
          --radius: 16px;
        }

        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: var(--dark); color: var(--text); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .root { min-height: 100vh; }

        /* NAV */
        .nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 60px; position: sticky; top: 0; z-index: 100; background: rgba(13,11,26,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
        .logo { display: flex; align-items: center; text-decoration: none; }
        .nav-links { display: flex; align-items: center; gap: 36px; }
        .nav-link { color: var(--text-2); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: var(--text); }
        .btn-nav { background: var(--primary); color: #fff; padding: 10px 22px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; transition: background 0.2s, transform 0.15s; }
        .btn-nav:hover { background: var(--primary-light); transform: translateY(-1px); }
        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .hamburger span { display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px; }

        /* BLOBS */
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .blob1 { width: 500px; height: 500px; background: rgba(108,63,197,0.28); top: -100px; right: -100px; }
        .blob2 { width: 400px; height: 400px; background: rgba(139,92,246,0.15); top: 200px; left: -150px; }
        .blob3 { width: 300px; height: 300px; background: rgba(245,158,11,0.10); bottom: 0; right: 200px; }

        /* HERO */
        .hero { position: relative; min-height: 92vh; display: flex; align-items: center; overflow: hidden; padding: 60px; opacity: 0; transform: translateY(24px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .hero.revealed { opacity: 1; transform: none; }
        .hero-inner { display: flex; align-items: center; justify-content: space-between; gap: 60px; width: 100%; max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
        .hero-text { flex: 1 1 460px; max-width: 580px; }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(108,63,197,0.18); border: 1px solid rgba(108,63,197,0.35); color: var(--primary-light); padding: 6px 14px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-bottom: 28px; }
        .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #10B981; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
        .h1 { font-size: clamp(36px, 5vw, 58px); font-weight: 900; line-height: 1.12; letter-spacing: -1.5px; margin-bottom: 24px; }
        .gradient-text { background: linear-gradient(135deg, var(--primary-light), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-sub { font-size: 18px; color: var(--text-2); line-height: 1.75; margin-bottom: 40px; max-width: 480px; }
        .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
        .btn-primary { display: inline-flex; align-items: center; gap: 10px; background: var(--primary); color: #fff; padding: 16px 30px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: 0 8px 30px rgba(108,63,197,0.35); }
        .btn-primary:hover { background: var(--primary-light); transform: translateY(-2px); box-shadow: 0 12px 40px rgba(108,63,197,0.45); }
        .btn-outline { display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid rgba(255,255,255,0.18); color: var(--text); padding: 16px 30px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; transition: border-color 0.2s, background 0.2s, transform 0.15s; backdrop-filter: blur(8px); }
        .btn-outline:hover { border-color: var(--primary-light); background: rgba(108,63,197,0.1); transform: translateY(-2px); }

        /* PHONE */
        .hero-visual { flex: 1 1 280px; display: flex; justify-content: center; align-items: center; }
        .phone-wrap { position: relative; display: inline-block; }
        .phone-glow { position: absolute; inset: -40px; background: radial-gradient(circle, rgba(108,63,197,0.35) 0%, transparent 70%); border-radius: 50%; z-index: 0; animation: glow-pulse 3s ease-in-out infinite; }
        @keyframes glow-pulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        .phone { position: relative; z-index: 1; width: 260px; background: var(--dark3); border-radius: 38px; padding: 14px; border: 1.5px solid rgba(255,255,255,0.12); box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,63,197,0.2); }
        .phone-notch { width: 80px; height: 24px; background: var(--dark); border-radius: 12px; margin: 0 auto 12px; }
        .phone-img { width: 100%; border-radius: 24px; display: block; }

        /* FLOAT CARDS */
        .float-card { position: absolute; background: rgba(30,26,53,0.92); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 2; min-width: 160px; }
        .float-card-1 { left: -80px; top: 20%; animation: float1 4s ease-in-out infinite; }
        .float-card-2 { right: -70px; bottom: 22%; animation: float2 4s ease-in-out infinite 0.5s; }
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }
        .float-icon { font-size: 24px; }
        .float-label { font-size: 11px; color: var(--text-3); font-weight: 500; }
        .float-value { font-size: 15px; font-weight: 700; color: var(--text); }

        /* STATS */
        .stats { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 48px 60px; opacity: 0; transform: translateY(20px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .stats.revealed { opacity: 1; transform: none; }
        .stats-inner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .stat-item { text-align: center; }
        .stat-num { font-size: clamp(32px, 4vw, 48px); font-weight: 900; letter-spacing: -1px; background: linear-gradient(135deg, var(--primary-light), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .stat-label { font-size: 14px; color: var(--text-3); font-weight: 500; margin-top: 4px; }

        /* FEATURES */
        .features { padding: 100px 60px; opacity: 0; transform: translateY(24px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .features.revealed { opacity: 1; transform: none; }
        .section-header { text-align: center; margin-bottom: 64px; }
        .section-tag { display: inline-block; background: rgba(108,63,197,0.15); border: 1px solid rgba(108,63,197,0.3); color: var(--primary-light); padding: 5px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        .section-title { font-size: clamp(28px, 4vw, 42px); font-weight: 800; letter-spacing: -1px; line-height: 1.2; margin-bottom: 16px; }
        .section-sub { font-size: 16px; color: var(--text-2); max-width: 480px; margin: 0 auto; line-height: 1.7; }
        .feat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .feat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px; transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s; cursor: default; }
        .feat-card:hover { transform: translateY(-4px); border-color: var(--feat-color, var(--primary)); box-shadow: 0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px var(--feat-color, var(--primary)); }
        .feat-icon-wrap { width: 52px; height: 52px; background: rgba(108,63,197,0.12); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 24px; }
        .feat-title { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
        .feat-desc { font-size: 14px; color: var(--text-2); line-height: 1.7; }

        /* HOW */
        .how { position: relative; padding: 100px 60px; overflow: hidden; opacity: 0; transform: translateY(24px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .how.revealed { opacity: 1; transform: none; }
        .how-bg { position: absolute; inset: 0; background: var(--dark2); z-index: 0; }
        .how .section-header, .steps { position: relative; z-index: 1; }
        .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0; max-width: 1100px; margin: 0 auto; position: relative; }
        .steps::before { content: ''; position: absolute; top: 32px; left: 12.5%; right: 12.5%; height: 1px; background: linear-gradient(90deg, transparent, var(--primary), var(--primary-light), transparent); z-index: 0; }
        .step { text-align: center; padding: 0 20px; position: relative; z-index: 1; }
        .step-num { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: #fff; font-weight: 900; font-size: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; border: 3px solid var(--dark2); box-shadow: 0 0 0 2px var(--primary), 0 8px 24px rgba(108,63,197,0.4); }
        .step-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
        .step-desc { font-size: 14px; color: var(--text-2); line-height: 1.7; }

        /* SCREENSHOTS */
        .screenshots { padding: 100px 60px; opacity: 0; transform: translateY(24px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .screenshots.revealed { opacity: 1; transform: none; }
        .ss-grid { display: flex; justify-content: center; gap: 32px; flex-wrap: wrap; max-width: 1100px; margin: 0 auto; }
        .ss-item { text-align: center; }
        .ss-phone { width: 180px; background: var(--dark3); border-radius: 28px; padding: 10px; border: 1.5px solid var(--border); box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(108,63,197,0.15); margin-bottom: 16px; transition: transform 0.3s, box-shadow 0.3s; }
        .ss-phone:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,63,197,0.3); }
        .ss-img { width: 100%; border-radius: 20px; display: block; }
        .ss-label { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
        .ss-desc { font-size: 13px; color: var(--text-3); }

        /* TESTIMONIAL */
        .trust { padding: 80px 60px; background: var(--dark2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .trust-inner { max-width: 640px; margin: 0 auto; text-align: center; }
        .quote-marks { font-size: 80px; line-height: 1; color: var(--primary); opacity: 0.4; font-family: Georgia, serif; margin-bottom: -20px; }
        .quote { font-size: clamp(18px, 2.5vw, 24px); font-weight: 600; color: var(--text); line-height: 1.6; font-style: italic; margin-bottom: 32px; }
        .quote-author { display: inline-flex; align-items: center; gap: 14px; }
        .quote-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--primary-light)); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; color: #fff; }
        .quote-name { font-weight: 700; font-size: 15px; text-align: left; }
        .quote-role { font-size: 13px; color: var(--text-3); text-align: left; }

        /* CTA */
        .cta { position: relative; padding: 120px 60px; text-align: center; overflow: hidden; }
        .cta-blob1 { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: rgba(108,63,197,0.22); filter: blur(100px); top: -100px; left: -100px; pointer-events: none; }
        .cta-blob2 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: rgba(245,158,11,0.12); filter: blur(80px); bottom: -50px; right: 0; pointer-events: none; }
        .cta-inner { position: relative; z-index: 1; }
        .cta-tag { display: inline-block; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #10B981; padding: 5px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
        .cta-title { font-size: clamp(32px, 5vw, 52px); font-weight: 900; letter-spacing: -1.5px; margin-bottom: 16px; line-height: 1.1; }
        .cta-sub { font-size: 17px; color: var(--text-2); margin-bottom: 48px; }
        .btn-cta { display: inline-flex; align-items: center; gap: 12px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: #fff; padding: 18px 40px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 16px; box-shadow: 0 12px 48px rgba(108,63,197,0.45); transition: transform 0.2s, box-shadow 0.2s; }
        .btn-cta:hover { transform: translateY(-3px); box-shadow: 0 20px 60px rgba(108,63,197,0.55); }

        /* FOOTER */
        .footer { border-top: 1px solid var(--border); background: var(--dark); padding: 60px 60px 32px; }
        .footer-inner { display: flex; justify-content: space-between; gap: 48px; max-width: 1100px; margin: 0 auto 48px; flex-wrap: wrap; }
        .footer-brand { max-width: 280px; }
        .footer-tagline { font-size: 14px; color: var(--text-3); line-height: 1.7; margin-top: 14px; }
        .footer-links-group { display: flex; gap: 60px; flex-wrap: wrap; }
        .footer-col { display: flex; flex-direction: column; gap: 12px; }
        .footer-col-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-3); margin-bottom: 4px; }
        .footer-link { color: var(--text-2); text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .footer-link:hover { color: var(--text); }
        .footer-bottom { border-top: 1px solid var(--border); padding-top: 28px; text-align: center; color: var(--text-3); font-size: 13px; max-width: 1100px; margin: 0 auto; }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .nav { padding: 16px 24px; }
          .nav-links { display: none; flex-direction: column; align-items: flex-start; gap: 20px; position: absolute; top: 100%; left: 0; right: 0; background: rgba(13,11,26,0.98); backdrop-filter: blur(20px); padding: 24px; border-bottom: 1px solid var(--border); }
          .nav-links.open { display: flex; }
          .hamburger { display: flex; }
          .hero { padding: 60px 24px; min-height: auto; }
          .hero-inner { flex-direction: column; text-align: center; }
          .hero-sub { margin: 0 auto 40px; }
          .hero-actions { justify-content: center; }
          .stats { padding: 40px 24px; }
          .stats-inner { grid-template-columns: repeat(2, 1fr); }
          .features, .how, .screenshots, .trust, .cta { padding: 72px 24px; }
          .footer { padding: 48px 24px 28px; }
          .footer-inner { flex-direction: column; }
          .steps::before { display: none; }
        }
        @media (max-width: 500px) {
          .stats-inner { grid-template-columns: 1fr 1fr; gap: 16px; }
          .feat-grid { grid-template-columns: 1fr; }
          .ss-phone { width: 140px; }
          .footer-links-group { gap: 32px; }
          .float-card { display: none; }
        }
      `}</style>
    </>
  );
}
