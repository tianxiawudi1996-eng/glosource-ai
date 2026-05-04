import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const sql = neon(url);
  return drizzle(sql, { schema });
}

// 싱글턴 — Vercel 서버리스에서 cold start마다 재생성
export const db = getDb();
export * from './schema';
