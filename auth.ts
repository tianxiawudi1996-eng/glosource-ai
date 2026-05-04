import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { db, users, subscriptions } from '@/app/lib/db';
import { eq } from 'drizzle-orm';

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = Buffer.from(hash, 'base64');
  const digest = await crypto.subtle.digest('SHA-256', data);
  const digestBuffer = Buffer.from(digest);
  return digestBuffer.toString('base64') === hashBuffer.toString('base64');
}

export async function hashPassword(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain + process.env.AUTH_SECRET);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(digest).toString('base64');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);
        if (!user?.passwordHash) return null;
        const valid = await verifyPassword(
          credentials.password as string,
          user.passwordHash,
        );
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        // 구독 상태 주입
        const [sub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, token.id as string))
          .limit(1);
        session.user.plan = sub?.plan ?? 'free';
        session.user.subscriptionStatus = sub?.status ?? null;
      }
      return session;
    },
  },
});
