'use client';
import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en', label: '🇬🇧 EN' },
  { code: 'es', label: '🇪🇸 ES' },
  { code: 'fr', label: '🇫🇷 FR' },
  { code: 'pt', label: '🇧🇷 PT' },
  { code: 'ar', label: '🇸🇦 AR' },
];

const WELCOME_MSGS = {
  en: "Hi! I'm EcoPulse AI 🌿 I monitor all 5 stadium sectors in real time. Ask me about sustainability, crowd management, or HVAC status!",
  es: "¡Hola! Soy EcoPulse AI 🌿 Monitoreo los 5 sectores del estadio en tiempo real. ¡Pregúntame sobre sostenibilidad o manejo de multitudes!",
  fr: "Bonjour! Je suis EcoPulse AI 🌿 Je surveille les 5 secteurs du stade en temps réel. Posez-moi des questions sur la durabilité!",
  pt: "Olá! Sou EcoPulse AI 🌿 Monitoro os 5 setores do estádio em tempo real. Pergunte-me sobre sustentabilidade!",
  ar: "مرحباً! أنا EcoPulse AI 🌿 أراقب جميع قطاعات الاستاد الخمسة في الوقت الفعلي. اسألني عن الاستدامة!",
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setMessages([{ role: 'bot', text: WELCOME_MSGS[lang] }]);
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) { setUnread(false); inputRef.current?.focus(); }
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language: lang }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Connection error. Please try again.' }]);
    }
    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <div className="chatbot-fab">
      {open && (
        <div className="chatbot-window" role="dialog" aria-label="EcoPulse AI Chat">
          <div className="chatbot-header">
            <div className="chatbot-avatar">🤖</div>
            <div className="chatbot-info">
              <div className="chatbot-name">EcoPulse AI</div>
              <div className="chatbot-status">● Multilingual Support Active</div>
            </div>
            <button
              className="portal-nav-logout"
              style={{ padding: '4px 10px', fontSize: '0.7rem' }}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >✕</button>
          </div>

          <div style={{ display: 'flex', gap: 4, padding: '8px 14px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                className={`lang-btn${lang === l.code ? ' active' : ''}`}
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="chatbot-messages" role="log" aria-live="polite">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role === 'bot' ? 'chat-msg-bot' : 'chat-msg-user'}`}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-typing">
                <div className="chat-typing-dot" />
                <div className="chat-typing-dot" />
                <div className="chat-typing-dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-input-area">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder={lang === 'ar' ? 'اكتب رسالتك...' : lang === 'es' ? 'Escribe tu mensaje...' : lang === 'fr' ? 'Tapez votre message...' : lang === 'pt' ? 'Digite sua mensagem...' : 'Ask about stadium operations...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
            <button className="chatbot-send" onClick={sendMessage} disabled={loading || !input.trim()} aria-label="Send message">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        className="chatbot-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle EcoPulse AI chat"
        aria-expanded={open}
      >
        {open ? '✕' : '💬'}
        {!open && unread && <div className="chatbot-badge" aria-hidden="true" />}
      </button>
    </div>
  );
}
