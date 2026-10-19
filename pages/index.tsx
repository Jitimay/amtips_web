import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

function useReveal() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { ref, visible } = useReveal();
  useEffect(() => { setMounted(true); }, []);
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
  const [menuOpen, setMenuOpen] = useState(false);
  const featReveal = useReveal();
  const howReveal = useReveal();
  const ssReveal = useReveal();
  const statReveal = useReveal();

  return (
    <>
      <Head>
        <title>amTips — Digital Tipping for Service Workers</title>
        <meta name="description" content="Receive digital tips instantly via QR code or personal link. No cash, no hassle. Built for service workers in Africa." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="root">

        {/* NAV */}
        <nav className="nav">
          <a href="/" className="logo">
            <img src="/logo.png" alt="amTips" height={30} />
          </a>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#features" className="nav-link" onClick={() => setMenuOpen(false)}>Features</a>
            <span className="nav-sep">|</span>
            <a href="#how" className="nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
            <span className="nav-sep">|</span>
            <a href="#screenshots" className="nav-link" onClick={() => setMenuOpen(false)}>App</a>
            <span className="nav-sep">|</span>
            <a href="https://play.google.com/store/apps/details?id=app.amtips.official" className="nav-link nav-cta" target="_blank" rel="noreferrer">Download</a>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="menu">
            <span /><span /><span />
          </button>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-badge">Now live in Burundi 🇧🇮</div>
            <h1 className="hero-title">
              The smarter way to<br />
              <span className="hero-accent">receive tips digitally.</span>
            </h1>
            <p className="hero-sub">
              amTips lets service workers receive digital tips instantly via QR code or personal link —
              no cash, no app needed on the customer&apos;s side.
            </p>
            <div className="hero-actions">
              <a href="https://play.google.com/store/apps/details?id=app.amtips.official" className="btn-primary" target="_blank" rel="noreferrer">
                Get it on Google Play
              </a>
              <a href="#how" className="btn-ghost">See how it works →</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="phone">
              <img src="/1.jpg" alt="amTips app" className="phone-img" />
            </div>
          </div>
          <div className="hero-divider" />
        </section>

        {/* STATS */}
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

        {/* FEATURES */}
        <section id="features" className={`section ${featReveal.visible ? 'revealed' : ''}`} ref={featReveal.ref as any}>
          <div className="section-inner">
          <div className="section-divider" />
          <div className="section-header">
            <p className="section-tag">Features</p>
            <h2 className="section-title">Everything you need<br />to <span className="underline-accent">get tipped</span></h2>
            <p className="section-sub">A complete platform built specifically for service workers.</p>
          </div>
          <div className="feat-grid">
            {[
              { icon: '📲', title: 'QR Code & Link', desc: 'Share your personal QR code or link. Customers tip in seconds — no app required.' },
              { icon: '💰', title: 'Instant Wallet', desc: 'All tips land in your amTips wallet. Track your full earnings history in one place.' },
              { icon: '📤', title: 'Easy Withdrawals', desc: 'Cash out to your mobile money account anytime, directly from the app.' },
              { icon: '📊', title: 'Analytics', desc: 'See your earnings, ratings, and performance over time with a clear dashboard.' },
              { icon: '🎯', title: 'Campaigns', desc: 'Create tipping campaigns for special events, goals, or promotions.' },
              { icon: '🔔', title: 'Instant Notifications', desc: 'Get notified the moment a tip arrives so you never miss a payment.' },
            ].map(f => (
              <div className="feat-card" key={f.title}>
                <span className="feat-icon">{f.icon}</span>
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className={`section how-section ${howReveal.visible ? 'revealed' : ''}`} ref={howReveal.ref as any}>
          <div className="section-inner">
          <div className="section-divider" />
          <div className="section-header">
            <p className="section-tag">Process</p>
            <h2 className="section-title">How it <span className="underline-accent">works</span></h2>
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
          </div>
        </section>

        {/* SCREENSHOTS */}
        <section id="screenshots" className={`section ${ssReveal.visible ? 'revealed' : ''}`} ref={ssReveal.ref as any}>
          <div className="section-inner">
          <div className="section-divider" />
          <div className="section-header">
            <p className="section-tag">The App</p>
            <h2 className="section-title">See it <span className="underline-accent">in action</span></h2>
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
          </div>
        </section>

        {/* TESTIMONIAL */}
        <section className="trust">
          <div className="trust-inner">
            <div className="section-divider" />
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

        {/* CTA */}
        <section className="cta">
          <div className="cta-inner">
            <div className="section-divider" />
            <h2 className="cta-title">Start receiving tips <span className="underline-accent">today.</span></h2>
            <p className="cta-sub">Available on Android. No subscription. No hidden fees.</p>
            <a href="https://play.google.com/store/apps/details?id=app.amtips.official" className="btn-primary" target="_blank" rel="noreferrer">
              Download on Google Play
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-divider" />
          <div className="footer-inner">
            <div className="footer-brand">
              <img src="/logo.png" alt="amTips" height={26} />
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
          <p className="footer-copy" suppressHydrationWarning>© {new Date().getFullYear()} amTips. All rights reserved.</p>
        </footer>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue: #3B4EF0;
          --blue-light: #6B7BFF;
          --dark: #111;
          --gray: #f5f5f7;
          --gray2: #e8e8ec;
          --text: #111;
          --text2: #555;
          --text3: #999;
          --radius: 12px;
        }

        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #fff; color: var(--text); -webkit-font-smoothing: antialiased; overflow-x: hidden; }

        /* NAV */
        .nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 60px; position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--gray2); }
        .logo { display: flex; align-items: center; text-decoration: none; }
        .nav-links { display: flex; align-items: center; gap: 8px; }
        .nav-sep { color: var(--gray2); font-size: 18px; margin: 0 4px; }
        .nav-link { color: var(--text2); text-decoration: none; font-size: 14px; font-weight: 500; padding: 6px 12px; transition: color 0.2s; letter-spacing: 0.02em; }
        .nav-link:hover { color: var(--blue); }
        .nav-cta { color: var(--blue) !important; font-weight: 700; }
        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .hamburger span { display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px; }

        /* HERO */
        .hero { display: flex; align-items: center; justify-content: space-between; gap: 60px; padding: 80px 60px 60px; max-width: 1200px; margin: 0 auto; position: relative; }
        .hero-inner { flex: 1 1 480px; max-width: 560px; }
        .hero-badge { display: inline-block; background: var(--gray); border-radius: 100px; padding: 6px 16px; font-size: 13px; font-weight: 600; color: var(--text2); margin-bottom: 28px; }
        .hero-title { font-size: clamp(36px, 5vw, 58px); font-weight: 900; line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 24px; color: var(--dark); }
        .hero-accent { color: var(--blue); position: relative; display: inline-block; }
        .hero-accent::after { content: ''; position: absolute; left: 0; bottom: -4px; width: 100%; height: 4px; background: var(--blue); border-radius: 2px; opacity: 0.35; }
        .hero-sub { font-size: 17px; color: var(--text2); line-height: 1.75; margin-bottom: 40px; }
        .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
        .hero-visual { flex: 1 1 260px; display: flex; justify-content: center; }
        .hero-divider { position: absolute; bottom: 0; left: 60px; right: 60px; height: 3px; background: var(--blue); border-radius: 2px; opacity: 0.7; }

        /* PHONE */
        .phone { width: 240px; background: var(--gray); border-radius: 32px; padding: 12px; border: 1px solid var(--gray2); }
        .phone-img { width: 100%; border-radius: 22px; display: block; }

        /* BUTTONS */
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: var(--blue); color: #fff; padding: 14px 28px; border-radius: var(--radius); text-decoration: none; font-weight: 700; font-size: 15px; transition: background 0.2s, transform 0.15s; }
        .btn-primary:hover { background: var(--blue-light); transform: translateY(-1px); }
        .btn-ghost { display: inline-flex; align-items: center; color: var(--blue); font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 4px; border-bottom: 2px solid transparent; transition: border-color 0.2s; }
        .btn-ghost:hover { border-color: var(--blue); }

        /* STATS */
        .stats { border-top: 1px solid var(--gray2); border-bottom: 1px solid var(--gray2); padding: 48px 60px; opacity: 0; transform: translateY(16px); transition: opacity 0.6s, transform 0.6s; }
        .stats.revealed { opacity: 1; transform: none; }
        .stats-inner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .stat-item { text-align: center; }
        .stat-num { font-size: clamp(32px, 4vw, 48px); font-weight: 900; letter-spacing: -1px; color: var(--blue); }
        .stat-label { font-size: 13px; color: var(--text3); font-weight: 500; margin-top: 4px; }

        /* SECTIONS */
        .section { padding: 80px 60px; opacity: 0; transform: translateY(20px); transition: opacity 0.7s, transform 0.7s; }
        .section.revealed { opacity: 1; transform: none; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-divider { max-width: 1100px; margin: 0 auto 48px; height: 3px; background: var(--blue); border-radius: 2px; opacity: 0.7; }
        .section-header { margin-bottom: 56px; }
        .section-tag { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text3); margin-bottom: 12px; }
        .section-title { font-size: clamp(28px, 4vw, 42px); font-weight: 800; letter-spacing: -1px; line-height: 1.2; margin-bottom: 14px; color: var(--dark); }
        .section-sub { font-size: 16px; color: var(--text2); line-height: 1.7; max-width: 480px; }

        /* underline accent — hand-drawn feel */
        .underline-accent { position: relative; display: inline-block; }
        .underline-accent::after { content: ''; position: absolute; left: -2px; right: -2px; bottom: -3px; height: 10px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='10'%3E%3Cpath d='M2 7 Q50 2 100 6 Q150 10 198 5' stroke='%233B4EF0' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") repeat-x center / auto 100%; opacity: 0.6; }

        /* FEATURES */
        .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .feat-card { background: var(--gray); border-radius: var(--radius); padding: 28px; transition: transform 0.2s; }
        .feat-card:hover { transform: translateY(-3px); }
        .feat-icon { font-size: 28px; display: block; margin-bottom: 14px; line-height: 1; }
        .feat-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: var(--dark); }
        .feat-desc { font-size: 14px; color: var(--text2); line-height: 1.65; }

        /* HOW */
        .how-section { background: #fff; }
        .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; }
        .step-num { font-size: 13px; font-weight: 800; color: var(--blue); letter-spacing: 1px; margin-bottom: 12px; }
        .step-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: var(--dark); }
        .step-desc { font-size: 14px; color: var(--text2); line-height: 1.65; }

        /* SCREENSHOTS */
        .ss-grid { display: flex; justify-content: center; gap: 28px; flex-wrap: wrap; }
        .ss-item { text-align: center; }
        .ss-phone { width: 160px; background: var(--gray); border-radius: 24px; padding: 8px; border: 1px solid var(--gray2); margin-bottom: 12px; transition: transform 0.25s; }
        .ss-phone:hover { transform: translateY(-6px); }
        .ss-img { width: 100%; border-radius: 18px; display: block; }
        .ss-label { font-size: 14px; font-weight: 700; color: var(--dark); margin-bottom: 3px; }
        .ss-desc { font-size: 12px; color: var(--text3); }

        /* TESTIMONIAL */
        .trust { padding: 80px 60px; }
        .trust-inner { max-width: 700px; margin: 0 auto; text-align: center; }
        .quote { font-size: clamp(18px, 2.5vw, 22px); font-weight: 600; color: var(--dark); line-height: 1.65; font-style: italic; margin-bottom: 28px; }
        .quote-author { display: inline-flex; align-items: center; gap: 12px; }
        .quote-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--blue); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; }
        .quote-name { font-weight: 700; font-size: 14px; text-align: left; }
        .quote-role { font-size: 12px; color: var(--text3); text-align: left; }

        /* CTA */
        .cta { padding: 80px 60px; }
        .cta-inner { max-width: 700px; margin: 0 auto; text-align: center; }
        .cta-title { font-size: clamp(30px, 4vw, 46px); font-weight: 900; letter-spacing: -1px; margin-bottom: 14px; color: var(--dark); }
        .cta-sub { font-size: 16px; color: var(--text2); margin-bottom: 36px; }

        /* FOOTER */
        .footer { padding: 48px 60px 32px; border-top: 1px solid var(--gray2); }
        .footer-divider { max-width: 1100px; margin: 0 auto 40px; height: 3px; background: var(--blue); border-radius: 2px; opacity: 0.7; }
        .footer-inner { display: flex; justify-content: space-between; gap: 40px; max-width: 1100px; margin: 0 auto 40px; flex-wrap: wrap; }
        .footer-brand { max-width: 260px; }
        .footer-tagline { font-size: 13px; color: var(--text3); line-height: 1.7; margin-top: 12px; }
        .footer-links-group { display: flex; gap: 56px; flex-wrap: wrap; }
        .footer-col { display: flex; flex-direction: column; gap: 10px; }
        .footer-col-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); margin-bottom: 4px; }
        .footer-link { color: var(--text2); text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .footer-link:hover { color: var(--blue); }
        .footer-copy { text-align: center; font-size: 12px; color: var(--text3); max-width: 1100px; margin: 0 auto; padding-top: 24px; border-top: 1px solid var(--gray2); }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .nav { padding: 16px 24px; }
          .nav-links { display: none; flex-direction: column; align-items: flex-start; gap: 4px; position: absolute; top: 100%; left: 0; right: 0; background: #fff; padding: 20px 24px; border-bottom: 1px solid var(--gray2); }
          .nav-links.open { display: flex; }
          .nav-sep { display: none; }
          .hamburger { display: flex; }
          .hero { flex-direction: column; padding: 48px 24px 40px; text-align: center; }
          .hero-actions { justify-content: center; }
          .hero-divider { left: 24px; right: 24px; }
          .stats { padding: 40px 24px; }
          .stats-inner { grid-template-columns: repeat(2, 1fr); }
          .section { padding: 60px 24px; }
          .feat-grid { grid-template-columns: 1fr 1fr; }
          .trust, .cta { padding: 60px 24px; }
          .footer { padding: 40px 24px 24px; }
          .footer-inner { flex-direction: column; }
        }
        @media (max-width: 500px) {
          .stats-inner { grid-template-columns: 1fr 1fr; gap: 16px; }
          .feat-grid { grid-template-columns: 1fr; }
          .ss-phone { width: 130px; }
          .footer-links-group { gap: 28px; }
        }
      `}</style>
    </>
  );
}
