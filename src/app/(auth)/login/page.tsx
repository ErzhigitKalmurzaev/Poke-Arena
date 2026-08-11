import { LoginForm } from '@/features/auth-login';

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-semibold">Sign in to Arena</h1>
        <p className="text-sm text-muted-foreground">admin / admin123 or guest / guest123</p>
      </div>
      <LoginForm />
    </div>
  );
}
