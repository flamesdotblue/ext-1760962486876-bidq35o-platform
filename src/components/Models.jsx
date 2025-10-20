import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, Loader2, Trash, CheckCircle2, Info, Moon, Sun } from 'lucide-react';

const HF_API = 'https://huggingface.co/api/models';

function formatBytes(bytes = 0) {
  if (!bytes || bytes <= 0) return '—';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

async function fetchModels(query = 'llama') {
  const url = `${HF_API}?search=${encodeURIComponent(query)}&limit=24`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch models');
  const data = await res.json();
  // Keep only lightweight or known repos to avoid huge downloads; we will still only fetch small files per repo
  return data
    .filter(m => !m.private)
    .map(m => ({
      id: m.id,
      tags: m.tags || [],
      likes: m.likes || 0,
      downloads: m.downloads || 0,
    }));
}

// Simulated downloader: picks a tiny file to store as proof-of-download, tracks fake progress
async function tinyFileForRepo(repoId) {
  // Try common small files in order
  const candidates = [
    'resolve/main/README.md',
    'resolve/main/config.json',
    'raw/main/README.md',
  ];
  for (const c of candidates) {
    const url = `https://huggingface.co/${repoId}/${c}`;
    const head = await fetch(url, { method: 'HEAD' });
    if (head.ok) return { url, size: Number(head.headers.get('content-length') || '4096') };
  }
  // Fallback to an ultra tiny known file
  return { url: 'https://huggingface.co/hf-internal-testing/tiny-random-LlamaForCausalLM/resolve/main/config.json', size: 2048 };
}

export default function Models({ onBack, models, onSaveModels, selectedModelId, onSelectModel, onDeleteModel, theme, onToggleTheme }) {
  const [tab, setTab] = useState('download'); // 'download' | 'settings'
  const [query, setQuery] = useState('llama');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [progressById, setProgressById] = useState({});

  const selected = useMemo(() => models.find(m => m.id === selectedModelId) || null, [models, selectedModelId]);

  useEffect(() => {
    let ignore = false;
    async function run() {
      setLoading(true);
      setError('');
      try {
        const r = await fetchModels(query);
        if (!ignore) setResults(r);
      } catch (e) {
        if (!ignore) setError('Unable to load models from Hugging Face.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => { ignore = true; };
  }, [query]);

  async function handleDownload(repoId) {
    if (models.some(m => m.id === repoId)) return;
    setProgressById(p => ({ ...p, [repoId]: 0 }));
    try {
      const tiny = await tinyFileForRepo(repoId);
      // Fake progress while fetching the tiny file
      let pct = 0;
      const timer = setInterval(() => {
        pct = Math.min(95, pct + Math.random() * 18);
        setProgressById(p => ({ ...p, [repoId]: Math.floor(pct) }));
      }, 160);
      const res = await fetch(tiny.url);
      const blob = await res.blob();
      clearInterval(timer);
      // Store in Cache Storage to emulate local file storage
      const cache = await caches.open('illilem-model-cache');
      await cache.put(tiny.url, new Response(blob));
      setProgressById(p => ({ ...p, [repoId]: 100 }));
      const entry = {
        id: repoId,
        prettyName: repoId.split('/').pop(),
        storedAt: Date.now(),
        bytes: tiny.size || blob.size,
        files: [{ url: tiny.url }],
      };
      onSaveModels([entry, ...models]);
      if (!selectedModelId) onSelectModel(entry.id);
    } catch (e) {
      setProgressById(p => ({ ...p, [repoId]: 0 }));
      alert('Download failed. Please try another model or check your connection.');
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900"><ArrowLeft className="w-4 h-4"/></button>
          <h2 className="text-lg font-semibold">Models & Settings</h2>
        </div>
        <button onClick={onToggleTheme} className="text-sm px-3 py-1.5 rounded-md border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 flex items-center gap-2">
          {theme === 'dark' ? (<><Sun className="w-4 h-4"/> Light</>) : (<><Moon className="w-4 h-4"/> Dark</>)}
        </button>
      </header>

      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => setTab('download')} className={`px-3 py-1.5 rounded-md text-sm border ${tab==='download' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900'}`}>Download</button>
        <button onClick={() => setTab('settings')} className={`px-3 py-1.5 rounded-md text-sm border ${tab==='settings' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900'}`}>Settings</button>
      </div>

      {tab === 'download' && (
        <section className="rounded-2xl border border-slate-200 dark:border-neutral-800 p-5 bg-white/70 dark:bg-neutral-950/60">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Browse Hugging Face</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-500">We list public repos. Download stores a tiny file to enable offline demo.</p>
            </div>
            <div className="flex items-center gap-2">
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search models (e.g., llama, mistral)" className="px-3 py-2 rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none"/>
            </div>
          </div>

          <div className="mt-4">
            {loading && (
              <div className="flex items-center gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin"/> Loading models…</div>
            )}
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            )}
            {!loading && !error && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map(r => {
                  const isDownloaded = models.some(m => m.id === r.id);
                  const pct = progressById[r.id] || 0;
                  return (
                    <li key={r.id} className="border border-slate-200 dark:border-neutral-800 rounded-xl p-4 bg-white/60 dark:bg-neutral-950/50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium break-all">{r.id}</div>
                          <div className="text-xs text-slate-500 dark:text-neutral-500">Tags: {(r.tags||[]).slice(0,5).join(', ') || '—'}</div>
                        </div>
                        <div className="text-right">
                          {isDownloaded ? (
                            <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 gap-1"><CheckCircle2 className="w-4 h-4"/> Downloaded</span>
                          ) : pct > 0 ? (
                            <div className="w-28">
                              <div className="h-2 w-full rounded bg-slate-200 dark:bg-neutral-800 overflow-hidden">
                                <div className="h-2 bg-indigo-600" style={{ width: `${pct}%` }} />
                              </div>
                              <div className="text-[10px] mt-1 text-slate-500 dark:text-neutral-500">{pct}%</div>
                            </div>
                          ) : (
                            <button onClick={() => handleDownload(r.id)} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900">
                              <Download className="w-4 h-4"/> Download
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      )}

      {tab === 'settings' && (
        <section className="rounded-2xl border border-slate-200 dark:border-neutral-800 p-5 bg-white/70 dark:bg-neutral-950/60">
          <h3 className="font-semibold mb-2">Settings</h3>
          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium mb-2">Theme</div>
              <div className="flex items-center gap-2">
                <button onClick={() => onToggleTheme()} className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 text-sm">Toggle {theme === 'dark' ? 'Light' : 'Dark'}</button>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Downloaded Models</div>
              {models.length === 0 && (
                <div className="text-sm text-slate-500 dark:text-neutral-500">No models downloaded yet.</div>
              )}
              <ul className="space-y-2">
                {models.map(m => (
                  <li key={m.id} className="flex items-center justify-between gap-3 border border-slate-200 dark:border-neutral-800 rounded-lg p-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{m.prettyName || m.id}</div>
                      <div className="text-xs text-slate-500 dark:text-neutral-500">{m.id}</div>
                      <div className="text-[10px] text-slate-500 dark:text-neutral-500">Stored {new Date(m.storedAt).toLocaleString()} • {formatBytes(m.bytes)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onSelectModel(m.id)} className={`px-3 py-1.5 rounded-md border text-sm ${selectedModelId===m.id ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900'}`}>{selectedModelId===m.id ? 'Selected' : 'Select'}</button>
                      <button onClick={() => onDeleteModel(m.id)} className="p-2 rounded-md border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900" title="Delete">
                        <Trash className="w-4 h-4"/>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Chat History</div>
              <button onClick={() => { localStorage.removeItem('illilem_chat_history'); alert('Chat history cleared.'); }} className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 text-sm">Clear chat history</button>
            </div>
            <div className="text-xs text-slate-500 dark:text-neutral-500 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5"/>
              <div>
                This web demo stores a tiny file from the selected model repo to simulate offline availability and demonstrate UI/UX. On mobile (React Native/Flutter), replace with real GGUF/GGML/ONNX downloads and on-device inference.
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-neutral-500">App version: v0.1.0</div>
          </div>
        </section>
      )}
    </div>
  );
}
