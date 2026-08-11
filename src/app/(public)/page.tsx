import Link from 'next/link';
import { staticFighters } from '@/shared/api/static-dataset';

const FACTS = [
  { label: 'Каталог', value: `${staticFighters.length} бойцов` },
  { label: 'Правки', value: 'Статы, имя, описание' },
  { label: 'Битвы', value: 'Команды 5×5' },
];

// This route reads no cookies()/headers() and does no fetch({ cache: 'no-store' }) -
// nothing here is per-request, so Next renders it once at build time (SSG) and
// serves it from the CDN for every visitor.
export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <span className="font-heading text-xl font-semibold">Arena</span>
        <Link
          href="/login"
          className="rounded-full bg-brand-amber px-6 py-2.5 text-sm font-semibold text-black"
        >
          Войти
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="font-heading text-2xl font-light text-white/60 italic">Собери. Прокачай.</p>
          <h1 className="font-heading text-6xl font-semibold tracking-tight sm:text-7xl">Arena</h1>
          <p className="max-w-lg text-base leading-relaxed text-white/60">
            Каталог бойцов на данных PokeAPI, редактируемые характеристики со сбросом к
            оригиналу, свои параметры сравнения и командные битвы, которые решает чистая
            детерминированная функция.
          </p>
        </div>

        <Link href="/login" className="rounded-full bg-brand-amber px-8 py-4 text-base font-semibold text-black">
          Начать
        </Link>

        <dl className="grid w-full max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {FACTS.map((fact) => (
            <div key={fact.label} className="rounded-3xl bg-card p-6">
              <dt className="font-mono text-xs tracking-wide text-white/40">{fact.label.toUpperCase()}</dt>
              <dd className="mt-2 font-heading text-lg font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </main>
    </div>
  );
}
