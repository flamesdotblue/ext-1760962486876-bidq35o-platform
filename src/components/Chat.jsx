import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';

function loadHistory() {
  try {
    const raw = localStorage.getItem('illilem_chat_history');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveHistory(list) {
  localStorage.setItem('illilem_chat_history', JSON.stringify(list));
}

function mockLocalInference(model, prompt) {
  // Simple deterministic pseudo-response for demo
  const name = model?.prettyName || model?.id || 'local-model';
  const suffix = `\n\n[Model: ${name}]\n[Mode: Offline demo]`;
  if (!prompt) return '...';
  const base = `You said: "${prompt}". Here is an insightful response with steps, tips, and a concise summary.`;
  const hints = [
    '1) Understand the problem 2) Break it down 3) Iterate and verify.',
    'Tip: Keep prompts clear and specific for better results.',
    'Summary: Prioritize correctness, then optimize for performance.',
  ];
  const pick = hints[prompt.length % hints.length];
  return `${base}\n${pick}${suffix}`;
}

export default function Chat({ onBack, model, theme, onToggleTheme }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(loadHistory());
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef(null);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages]);

  async function onSend() {
    if (!model) {
      alert('Please download a model first.');
      return;
    }
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setInput('');
    const userMsg = { role: 'user', content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    // Simulate local inference delay
    await new Promise(r => setTimeout(r, 400));
    const reply = mockLocalInference(model, text);
    const aiMsg = { role: 'assistant', content: reply, ts: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setBusy(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 min-h-screen">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900"><ArrowLeft className="w-4 h-4"/></button>
          <div>
            <div className="font-semibold">Chat</div>
            <div className="text-xs text-slate-500 dark:text-neutral-500">{model ? `Model: ${model.prettyName || model.id}` : 'Please download a model first.'}</div>
          </div>
        </div>
        <button onClick={onToggleTheme} className="text-sm px-3 py-1.5 rounded-md border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>

      <section className="border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col h-[70vh] bg-white/70 dark:bg-neutral-950/60">
        <div ref={scrollerRef} className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-sm text-slate-500 dark:text-neutral-500">Start a conversation with your offline model.</div>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${m.role === 'assistant' ? '' : 'flex-row-reverse text-right'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${m.role==='assistant' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-neutral-800'}`}>
                {m.role === 'assistant' ? <Bot className="w-4 h-4"/> : <User className="w-4 h-4"/>}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${m.role==='assistant' ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-900/50 text-slate-800 dark:text-neutral-100' : 'bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 dark:border-neutral-800 p-3 flex items-center gap-2">
          <input
            disabled={!model || busy}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onSend(); }}
            placeholder={model ? 'Type a message…' : 'Please download a model first.'}
            className="flex-1 px-3 py-2 rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none text-sm"
          />
          <button onClick={onSend} disabled={!model || busy} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-50">
            <Send className="w-4 h-4"/> Send
          </button>
        </div>
      </section>
    </div>
  );
}
