import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PRIMARY = '#7B5FEE';

const SUGGESTIONS = [
  "Quels sont les frais sur amTips ?",
  "Comment faire un retrait vers Lumicash ou EcoCash ?",
  "Le prompt EcoCash ne s'affiche pas, que faire ?",
  "J'ai oublié mon code PIN de retrait",
  "How do I tip a waiter with amTips?",
];

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis l assistant d aide amTips. Comment puis-je vous aider ?\n\nHello! I am the amTips support assistant. How can I help you?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error || 'Désolé, une erreur est survenue. Veuillez réessayer plus tard ou contacter support@amtips.app.',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Impossible de joindre le serveur. Vérifiez votre connexion internet ou écrivez à support@amtips.app.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>amTips Support & FAQ Assistant</title>
        <meta name="description" content="Besoin d'aide avec amTips ? Posez vos questions à notre assistant 24/7 pour tout savoir sur les pourboires, retraits et frais." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <Link href="/" style={styles.logoLink}>
            <span style={styles.logoText}>am<span style={{ color: PRIMARY }}>Tips</span></span>
          </Link>
          <div style={styles.headerBadge}>Support AI 24/7</div>
        </header>

        <main style={styles.chatCard}>
          <div style={styles.cardHeader}>
            <div style={styles.agentAvatar}>💬</div>
            <div>
              <h1 style={styles.cardTitle}>Centre d'Aide & Support amTips</h1>
              <p style={styles.cardSubtitle}>Posez vos questions en Français ou en Anglais</p>
            </div>
          </div>

          <div style={styles.messagesContainer}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.messageRow,
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    ...(m.role === 'user' ? styles.userBubble : styles.assistantBubble),
                  }}
                >
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                    {m.content}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
                <div style={{ ...styles.messageBubble, ...styles.assistantBubble, color: '#777' }}>
                  <span>Rédaction en cours...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div style={styles.suggestionsContainer}>
              <span style={styles.suggestionsLabel}>Suggestions rapides :</span>
              <div style={styles.chipList}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    style={styles.chip}
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            style={styles.inputArea}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez une question sur amTips..."
              style={styles.inputField}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                ...styles.sendButton,
                opacity: loading || !input.trim() ? 0.6 : 1,
              }}
            >
              Envoyer
            </button>
          </form>
        </main>

        <footer style={styles.footer}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#777' }}>
            Des questions urgentes ? Contactez-nous à{' '}
            <a href="mailto:support@amtips.app" style={{ color: PRIMARY, textDecoration: 'none', fontWeight: 600 }}>
              support@amtips.app
            </a>
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 12, color: '#999' }}>
            <Link href="/terms" style={styles.footerLink}>Conditions d'utilisation</Link>
            <span>•</span>
            <Link href="/privacy" style={styles.footerLink}>Politique de confidentialité</Link>
            <span>•</span>
            <Link href="/" style={styles.footerLink}>Accueil</Link>
          </div>
        </footer>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F9F8FE 0%, #FFFFFF 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 12px 32px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  header: {
    width: '100%',
    maxWidth: 680,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 4px 16px',
  },
  logoLink: {
    textDecoration: 'none',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 900,
    color: '#1A1033',
    letterSpacing: -0.5,
  },
  headerBadge: {
    background: 'rgba(123, 95, 238, 0.1)',
    color: PRIMARY,
    fontWeight: 700,
    fontSize: 12,
    padding: '6px 12px',
    borderRadius: 20,
  },
  chatCard: {
    width: '100%',
    maxWidth: 680,
    background: '#FFFFFF',
    borderRadius: 20,
    boxShadow: '0 8px 30px rgba(123, 95, 238, 0.08), 0 2px 8px rgba(0,0,0,0.04)',
    border: '1px solid rgba(123, 95, 238, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    height: '76vh',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    borderBottom: '1px solid #F0EEF9',
    background: '#FAF9FE',
  },
  agentAvatar: {
    fontSize: 24,
    width: 44,
    height: 44,
    borderRadius: 12,
    background: '#EDE8FD',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1A1033',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#777',
    margin: '2px 0 0',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: 16,
    fontSize: 14,
    wordBreak: 'break-word',
  },
  userBubble: {
    background: PRIMARY,
    color: '#FFFFFF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    background: '#F3F1FA',
    color: '#1A1033',
    borderBottomLeftRadius: 4,
    border: '1px solid #EAE6F7',
  },
  suggestionsContainer: {
    padding: '8px 16px 12px',
    borderTop: '1px solid #F0EEF9',
    background: '#FAF9FE',
  },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    display: 'block',
    marginBottom: 6,
  },
  chipList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    background: '#FFFFFF',
    border: '1px solid #DDD6FE',
    color: PRIMARY,
    borderRadius: 16,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
  },
  inputArea: {
    display: 'flex',
    gap: 8,
    padding: '12px 16px',
    borderTop: '1px solid #F0EEF9',
    background: '#FFFFFF',
  },
  inputField: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid #DDD6FE',
    fontSize: 14,
    outline: 'none',
    color: '#1A1033',
  },
  sendButton: {
    background: PRIMARY,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 12,
    padding: '0 20px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
  },
  footerLink: {
    color: '#777',
    textDecoration: 'none',
  },
};
