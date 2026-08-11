import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(58% 62% at 50% 28%, rgba(214,40,40,0.16), transparent 72%)' }}
      />

      <header className="relative flex items-center px-6 py-5 sm:px-11">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8.5 w-8.5 place-items-center rounded-xl bg-brand-red font-mono text-[13px] font-semibold text-black">
            A
          </span>
          <span className="font-heading text-xl font-semibold">Arena</span>
        </Link>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-10">{children}</main>

      <footer className="relative mx-auto flex w-full max-w-[1560px] items-center gap-8 border-t border-white/8 px-6 py-7 text-[13px] text-white/45 sm:px-11">
        <span>Данные бойцов — локальный снимок покедекса</span>
        <span className="ml-auto font-mono">2026 · ТЕСТОВОЕ ЗАДАНИЕ</span>
      </footer>
    </div>
  );
}
