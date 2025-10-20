import { Download, MessagesSquare, Settings } from 'lucide-react';

export default function Home({ onGoDownload, onGoChat, onGoSettings, theme, onToggleTheme, selectedModel }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-amber-400" />
          <div>
            <h2 className="font-semibold">Illilem Chat</h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">Local AI on your device</p>
          </div>
        </div>
        <button onClick={onToggleTheme} className="text-sm px-3 py-1.5 rounded-md border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>

      <section className="rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 bg-white/70 dark:bg-neutral-950/60 backdrop-blur">
        <h3 className="text-lg font-semibold mb-1">Welcome</h3>
        <p className="text-sm text-slate-600 dark:text-neutral-400 mb-6">Choose an action to get started.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={onGoDownload} className="group rounded-xl border border-slate-200 dark:border-neutral-800 p-5 hover:shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 text-left">
            <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-3" />
            <div className="font-medium">Download Model</div>
            <div className="text-xs text-slate-500 dark:text-neutral-500">Browse Hugging Face and store locally</div>
          </button>
          <button onClick={onGoChat} className="group rounded-xl border border-slate-200 dark:border-neutral-800 p-5 hover:shadow-sm hover:border-fuchsia-300 dark:hover:border-fuchsia-700 text-left">
            <MessagesSquare className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400 mb-3" />
            <div className="font-medium">Chat</div>
            <div className="text-xs text-slate-500 dark:text-neutral-500">Talk to your offline model</div>
          </button>
          <button onClick={onGoSettings} className="group rounded-xl border border-slate-200 dark:border-neutral-800 p-5 hover:shadow-sm hover:border-amber-300 dark:hover:border-amber-700 text-left">
            <Settings className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-3" />
            <div className="font-medium">Settings</div>
            <div className="text-xs text-slate-500 dark:text-neutral-500">Theme, models, and more</div>
          </button>
        </div>

        <div className="mt-6 text-sm text-slate-600 dark:text-neutral-400">
          <span className="font-medium">Current model:</span> {selectedModel ? selectedModel.prettyName || selectedModel.id : 'None selected'}
        </div>
      </section>

      <footer className="mt-8 text-center text-xs text-slate-500 dark:text-neutral-500">v0.1.0 • Optimized for Android & Web demo</footer>
    </div>
  );
}
