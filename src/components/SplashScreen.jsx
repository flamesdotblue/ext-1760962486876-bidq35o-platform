import Spline from '@splinetool/react-spline';

export default function SplashScreen() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-violet-50 dark:from-black dark:via-neutral-950 dark:to-black">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 text-center px-6">
        <div className="mx-auto mb-6 h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-amber-400 shadow-2xl" />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 dark:from-indigo-300 dark:via-fuchsia-300 dark:to-amber-200">Illilem Chat</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-neutral-400">Local AI chat. Minimal. Fast. Private.</p>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 dark:to-black/50" />
    </div>
  );
}
