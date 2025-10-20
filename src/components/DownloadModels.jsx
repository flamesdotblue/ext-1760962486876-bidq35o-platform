import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Download, Loader2, Trash2 } from 'lucide-react';

const HF_API = 'https://huggingface.co/api/models?search=gguf&limit=24';

export default function DownloadModels({ onBack, onDownload, onDelete, onSelect, models, activeModelId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [q, setQ] = useState('gguf');
  const [downloading, setDownloading] = useState({}); // id -> progress

  const ownedIds = useMemo(() => new Set(models.map(m => m.id)), [models]);

  useEffect(() => {
    let ignore = false;
    const fetchModels = async () => {
      setLoading(true);
      setError('');
      try {
        const url = `https://huggingface.co/api/models?search=${encodeURIComponent(q)}&limit=24`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch models');
        const data = await res.json();
        // Filter to relevant models (have gguf, ggml, or onnx tag or filename hints)
        const filtered = data.filter(m => {
          const tags = m.tags || [];
          return tags.includes('gguf') || tags.includes('ggml') || tags.includes('onnx') || /gguf|ggml|onnx/i.test(m.modelId);
        }).slice(0, 24);
        if (!ignore) setResults(filtered);
      } catch (e) {
        if (!ignore) setError(e.message || 'Error');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchModels();
    return () => { ignore = true; };
  }, [q]);

  const simulateDownload = async (model) => {
    // Simulate progressive download
    setDownloading(prev => ({ ...prev, [model.id]: 0 }));
    const steps = 20;
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, 120));
      setDownloading(prev => ({ ...prev, [model.id]: Math.round((i / steps) * 100) }));
    }
    await onDownload({ id: model.id, name: model.name || model.id });
    setDownloading(prev => ({ ...prev, [model.id]: undefined }));
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent">
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="text-lg font-semibold">Download Models</h2>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search models (e.g., gguf, llama, mistral, onnx)"
          className="flex-1 rounded-lg border bg-background px-3 py-2 outline-none focus:ring"
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={16} /> Loading models...</div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {results.map((m) => {
          const id = m.id || m.modelId || m._id || m.name;
          const name = m.modelId || m.id || 'model';
          const owned = ownedIds.has(id);
          const isActive = activeModelId === id;
          const prog = downloading[id];
          return (
            <div key={id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium break-words">{name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{(m.tags || []).slice(0, 6).join(' · ')}</p>
                </div>
                {owned ? (
                  <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 size={16} /> Saved</span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!owned && (
                  <button
                    onClick={() => simulateDownload({ id, name })}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent"
                    disabled={typeof prog === 'number'}
                  >
                    {typeof prog === 'number' ? (
                      <>
                        <Loader2 className="animate-spin" size={16} /> Downloading {prog}%
                      </>
                    ) : (
                      <>
                        <Download size={16} /> Download
                      </>
                    )}
                  </button>
                )}
                {owned && !isActive && (
                  <button onClick={() => onSelect(id)} className="rounded-lg border px-3 py-2 text-sm hover:bg-accent">Set Active</button>
                )}
                {owned && (
                  <button onClick={() => onDelete(id)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent">
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                {isActive && (
                  <span className="rounded-lg bg-secondary px-2 py-1 text-xs">Active</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h4 className="mb-2 text-sm font-medium">My Models</h4>
        {models.length === 0 ? (
          <p className="text-sm text-muted-foreground">No models downloaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {models.map(m => (
              <li key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  {activeModelId === m.id ? (
                    <span className="rounded bg-secondary px-2 py-1 text-xs">Active</span>
                  ) : (
                    <button onClick={() => onSelect(m.id)} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-accent">Set Active</button>
                  )}
                  <button onClick={() => onDelete(m.id)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs hover:bg-accent">
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
