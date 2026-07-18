import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import type { Provider } from 'next-auth/providers';
import bcrypt from 'bcryptjs';
import { db, users, subscriptions } from '@/app/lib/db';
import { checkLoginRateLimit } from '@/app/lib/loginRateLimit';
import { isPasswordSessionInvalidated } from '@/app/lib/session-security';
import { and, eq, gt } from 'drizzle-orm';

// [C-3] bcrypt 기반 해싱 — SHA-256(legacy) 대비 GPU 브루트포스 저항
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

// bcrypt hash (starts with $2b$) or legacy SHA-256 (base64, 44 chars) 모두 검증
async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
    return bcrypt.compare(plain, hash);
  }
  // legacy SHA-256 fallback — 로그인 성공 시 bcrypt로 자동 업그레이드
  const encoder = new TextEncoder();
  const data = encoder.encode(plain + process.env.AUTH_SECRET);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(digest).toString('base64') === hash;
}

const providers: Provider[] = [
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: '이메일', type: 'email' },
      password: { label: '비밀번호', type: 'password' },
    },
    async authorize(credentials, request) {
      if (!credentials?.email || !credentials?.password) return null;
      const allowed = await checkLoginRateLimit(credentials.email as string, request.headers);
      if (!allowed) return null;
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, credentials.email as string))
        .limit(1);
      if (!user?.passwordHash) return null;
      const valid = await verifyPassword(credentials.password as string, user.passwordHash);
      if (!valid) return null;

      // legacy SHA-256 해시 → bcrypt 자동 업그레이드
      if (!user.passwordHash.startsWith('$2')) {
        const newHash = await hashPassword(credentials.password as string);
        await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
      }

      return { id: user.id, email: user.email, name: user.name };
    },
  }),
];

// Google OAuth — 키가 있을 때만 활성화
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sessionIssuedAtMs = Date.now();
        return token;
      }
      if (token.id) {
        const [account] = await db
          .select({ passwordSetAt: users.passwordSetAt })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1);
        if (!account || isPasswordSessionInvalidated(
          typeof token.sessionIssuedAtMs === 'number' ? token.sessionIssuedAtMs : undefined,
          account.passwordSetAt,
        )) {
          return null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;

        // [H-1] 구독 상태를 JWT 캐시 대신 DB에서 실시간 검증
        const now = new Date();
        const [sub] = await db
          .select()
          .from(subscriptions)
          .where(
            and(
              eq(subscriptions.userId, token.id as string),
              eq(subscriptions.status, 'active'),
              gt(subscriptions.currentPeriodEnd, now),
            ),
          )
          .limit(1);

        session.user.plan = sub?.plan ?? 'free';
        session.user.subscriptionStatus = sub?.status ?? null;
      }
      return session;
    },
  },
});
