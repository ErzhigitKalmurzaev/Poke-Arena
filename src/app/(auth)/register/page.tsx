import Image from 'next/image';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth-register';
import { staticFighters } from '@/shared/api/static-dataset';

const PREVIEW_IDS = ['144', '145', '146', '150'];
const PREVIEW = PREVIEW_IDS.map((id) => staticFighters.find((f) => f.id === id)).filter((f) => f !== undefined);

export default function RegisterPage() {
  return (
    <div className="grid w-full max-w-[980px] grid-cols-1 overflow-hidden rounded-[40px] shadow-[0_50px_110px_rgba(0,0,0,0.55)] md:grid-cols-[1.05fr_1fr]">
      <div className="flex flex-col gap-8 bg-brand-mint p-10 text-black sm:p-12">
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-black/55">
          <span className="h-1.5 w-1.5 rounded-full bg-black/45" />
          {staticFighters.length} БОЙЦОВ В БАЗЕ
        </div>
        <div>
          <h1 className="font-heading text-[38px] font-semibold" style={{ letterSpacing: '-.03em', lineHeight: 1.05 }}>
            Стань
            <br />
            капитаном
          </h1>
          <p className="mt-3.5 max-w-[300px] text-[15px] leading-relaxed text-black/70">
            Заведи аккаунт, собери шестёрку и выведи её на первый бой.
          </p>
        </div>
        <div className="mt-auto flex gap-2.5">
          {PREVIEW.map((fighter) => (
            <div key={fighter.id} className="flex-1 overflow-hidden rounded-2xl bg-black/10">
              <div className="grid h-20 place-items-center">
                {fighter.sprite && (
                  <Image src={fighter.sprite} alt="" width={52} height={52} className="object-contain" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-7 bg-card p-10 sm:p-12">
        <div>
          <span className="font-mono text-[11px] tracking-[0.16em] text-white/45">НОВЫЙ АККАУНТ</span>
          <h2 className="mt-2 font-heading text-2xl font-semibold">Придумай данные</h2>
          <p className="mt-1.5 text-sm text-white/45">Логин — минимум 3 символа, пароль — минимум 6</p>
        </div>
        <RegisterForm />
        <p className="text-sm text-white/45">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
