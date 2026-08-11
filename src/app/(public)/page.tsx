import Image from 'next/image';
import Link from 'next/link';
import { staticFighters } from '@/shared/api/static-dataset';

function statTotal(stats: Record<string, number>): number {
  return Object.values(stats).reduce((sum, value) => sum + value, 0);
}

// index 3 goes dark for the same alternating rhythm the design uses across its card grids.
const PREVIEW_TINTS = [
  'bg-brand-amber text-black',
  'bg-brand-blue text-black',
  'bg-brand-mint text-black',
  'bg-black text-white',
];

const previewFighters = staticFighters.slice(0, 6).map((fighter, index) => ({
  ...fighter,
  total: statTotal(fighter.stats),
  tint: PREVIEW_TINTS[index === 3 ? 3 : index % 3],
}));

const typeChips = Array.from(new Set(staticFighters.flatMap((fighter) => fighter.types))).slice(0, 10);

// This route reads no cookies()/headers() and does no fetch({ cache: 'no-store' }) -
// nothing here is per-request, so Next renders it once at build time (SSG) and
// serves it from the CDN for every visitor.
export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <span className="font-heading text-xl font-semibold">Arena</span>
        <Link href="/login" className="rounded-full bg-brand-amber px-6 py-2.5 text-sm font-semibold text-black">
          Войти
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[1560px] flex-1 px-6 py-10 sm:px-10">
        <div className="grid grid-cols-1 items-stretch gap-7 lg:grid-cols-[1fr_1.15fr]">
          <div className="relative overflow-hidden rounded-[36px] bg-card p-11">
            <div className="absolute -top-10 -left-24 h-72 w-72 rounded-full bg-brand-amber/20 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div>
                <p className="font-heading text-2xl font-light text-white/60 italic">Собери. Прокачай.</p>
                <h1 className="mt-1 font-heading text-6xl font-semibold leading-[0.98] tracking-tight sm:text-7xl">
                  Arena
                </h1>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/55">
                  Каталог бойцов на данных PokeAPI, редактируемые характеристики со сбросом к
                  оригиналу, свои параметры сравнения и командные битвы, которые решает чистая
                  детерминированная функция.
                </p>
                <Link
                  href="/login"
                  className="mt-7 inline-block rounded-full bg-brand-amber px-8 py-3.5 text-[14.5px] font-semibold text-black"
                >
                  Начать
                </Link>
              </div>
              <div>
                <div className="flex max-w-[290px] flex-wrap gap-1.5">
                  {typeChips.map((type) => (
                    <span
                      key={type}
                      className="rounded-full bg-white/[0.07] px-3.5 py-2 font-mono text-[11px] text-white/70 uppercase"
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <p className="mt-5 font-mono text-xs text-white/40">{staticFighters.length} БОЙЦОВ В КАТАЛОГЕ</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {previewFighters.map((fighter) => (
              <div key={fighter.id} className={`overflow-hidden rounded-[28px] ${fighter.tint}`}>
                <div className="relative grid h-[150px] place-items-center bg-black/10">
                  {fighter.sprite && (
                    <Image src={fighter.sprite} alt={fighter.name} width={112} height={112} className="object-contain" />
                  )}
                  <span className="absolute top-3 right-3 font-mono text-xs opacity-50">#{fighter.id}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-heading text-lg font-semibold capitalize">{fighter.name}</span>
                    <span className="font-mono text-[13px] font-semibold opacity-70">{fighter.total}</span>
                  </div>
                  <div className="mt-2.5 flex gap-1.5">
                    {fighter.types.map((type) => (
                      <span key={type} className="rounded-full bg-black/10 px-2.5 py-1 font-mono text-[10px] uppercase">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
