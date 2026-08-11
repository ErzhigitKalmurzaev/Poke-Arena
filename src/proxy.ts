import { auth } from '@/auth';

/**
 * Next.js 16 renamed Middleware to Proxy (same runtime contract, new file
 * name/export). This is the app's auth guard: everything except /, /login,
 * and /register requires a session.
 */
export default auth((req) => {
  const isPublic = ['/', '/login', '/register'].includes(req.nextUrl.pathname);
  if (!req.auth && !isPublic) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|data).*)'],
};
