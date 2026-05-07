import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

// ── NextAuth required tables ──────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccountType>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (t) => [primaryKey({ columns: [t.identifier, t.token] })]);

// ── 구독 (Toss Payments) ──────────────────────────────────────────────

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: text('plan', { enum: ['starter', 'pro', 'enterprise'] }).notNull(),
  status: text('status', { enum: ['active', 'canceled', 'past_due', 'trialing'] }).notNull().default('trialing'),
  // Toss Payments
  tossBillingKey: text('toss_billing_key'),
  tossCustomerKey: text('toss_customer_key'),
  tossOrderId: text('toss_order_id'),
  // 구독 기간
  currentPeriodStart: timestamp('current_period_start', { mode: 'date' }),
  currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  canceledAt: timestamp('canceled_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// ── 사용 로그 ─────────────────────────────────────────────────────────

export const usageLogs = pgTable('usage_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  ip: text('ip').notNull(),
  action: text('action', {
    enum: ['source', 'factory_direct', 'wechat', 'image_analyze'],
  }).notNull(),
  product: text('product'),
  supplierCount: integer('supplier_count'),
  durationMs: integer('duration_ms'),
  status: integer('status').notNull().default(200),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ── 결제 내역 ─────────────────────────────────────────────────────────

export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: text('subscription_id').references(() => subscriptions.id),
  tossPaymentKey: text('toss_payment_key').unique(),
  tossOrderId: text('toss_order_id').unique(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('KRW').notNull(),
  status: text('status', { enum: ['pending', 'done', 'canceled', 'failed'] }).notNull(),
  method: text('method'),
  approvedAt: timestamp('approved_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ── 플랜별 한도 ───────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  free:       { monthly: 10,  label: '무료 회원' }, // [C-4] 익명(일2회)보다 가입이 나은 구조
  starter:    { monthly: 30,  label: 'Starter' },
  pro:        { monthly: 60,  label: 'Pro' },
  enterprise: { monthly: 999, label: 'Enterprise' },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;
