import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { USERS } from '@/shared/config/users';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: { username: {}, password: {} },
      authorize: (credentials) => {
        const { username, password } = credentials;
        if (typeof username !== 'string' || typeof password !== 'string') {
          return null;
        }

        const user = USERS.find((u) => u.username === username && u.password === password);
        return user ? { id: user.id, name: user.username } : null;
      },
    }),
  ],
  pages: { signIn: '/login' },
});
