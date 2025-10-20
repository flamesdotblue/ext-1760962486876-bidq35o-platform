import { useEffect, useMemo, useState, useCallback } from 'react';
import SplashScreen from './components/SplashScreen.jsx';
import Home from './components/Home.jsx';
import Models from './components/Models.jsx';
import Chat from './components/Chat.jsx';

function loadLocalModels() {
  try {
    const raw = localStorage.getItem('illilem_models');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return [];
  }
}

function saveLocalModels(models) {
  localStorage.setItem('illilem_models', JSON.stringify(models));
}

function loadSelectedModelId() {
  return localStorage.getItem('illilem_selected_model') || '';
}

function saveSelectedModelId(id) {
  localStorage.setItem('illilem_selected_model', id || '');
}

function loadTheme() {
  const saved = localStorage.getItem('illilem_theme');
  if (saved === 'dark' || saved === 'light') return saved;
  // System preference fallback
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function saveTheme(theme) {
  localStorage.setItem('illilem_theme', theme);
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [page, setPage] = useState('home'); // 'home' | 'models' | 'chat'
  const [models, setModels] = useState(loadLocalModels());
  const [selectedModelId, setSelectedModelId] = useState(loadSelectedModelId());
  const [theme, setTheme] = useState(loadTheme());

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Apply theme class
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveLocalModels(models);
  }, [models]);

  useEffect(() => {
    saveSelectedModelId(selectedModelId);
  }, [selectedModelId]);

  const selectedModel = useMemo(() => models.find(m => m.id === selectedModelId) || null, [models, selectedModelId]);

  const handleDeleteModel = useCallback((id) => {
    setModels(prev => prev.filter(m => m.id !== id));
    if (selectedModelId === id) setSelectedModelId('');
  }, [selectedModelId]);

  if (booting) {
    return <SplashScreen onDone={() => setBooting(false)} />;
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      {page === 'home' && (
        <Home
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onGoDownload={() => setPage('models')}
          onGoChat={() => setPage('chat')}
          onGoSettings={() => setPage('models')}
          selectedModel={selectedModel}
        />
      )}
      {page === 'models' && (
        <Models
          models={models}
          selectedModelId={selectedModelId}
          onBack={() => setPage('home')}
          onSaveModels={setModels}
          onSelectModel={setSelectedModelId}
          onDeleteModel={handleDeleteModel}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
      )}
      {page === 'chat' && (
        <Chat
          onBack={() => setPage('home')}
          model={selectedModel}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
      )}
    </div>
  );
}
