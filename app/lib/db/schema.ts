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
  // Polar.sh 자동 생성 계정 추적 (DOA 방지) — webhook이 임시 비밀번호로 만든 계정 표시
  polarProvisioned: boolean('polar_provisioned').default(false).notNull(),
  // 사용자가 직접 비밀번호를 설정한 시점 (null = 아직 임시 비밀번호 상태)
  passwordSetAt: timestamp('password_set_at', { mode: 'date' }),
  // 48h 리마인드 메일 1회 발송 기록 (멱등)
  welcomeReminderSentAt: timestamp('welcome_reminder_sent_at', { mode: 'date' }),
  tosConsentAt: timestamp('tos_consent_at', { mode: 'date' }),
  dataConsentAt: timestamp('data_consent_at', { mode: 'date' }),
  gdprConsentAt: timestamp('gdpr_consent_at', { mode: 'date' }),
  ageConfirmedAt: timestamp('age_confirmed_at', { mode: 'date' }),
  marketingConsentAt: timestamp('marketing_consent_at', { mode: 'date' }),
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

// ── 구독 (Toss Payments KO / Polar.sh EN) ────────────────────────────

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: text('plan', { enum: ['starter', 'pro', 'enterprise'] }).notNull(),
  status: text('status', { enum: ['active', 'canceled', 'past_due', 'trialing'] }).notNull().default('trialing'),
  // Toss Payments (KO)
  tossBillingKey: text('toss_billing_key'),
  tossCustomerKey: text('toss_customer_key'),
  tossOrderId: text('toss_order_id'),
  // Polar.sh (EN)
  polarSubscriptionId: text('polar_subscription_id').unique(),
  polarCustomerId: text('polar_customer_id'),
  polarProductId: text('polar_product_id'),
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
  polarPaymentId: text('polar_payment_id').unique(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('KRW').notNull(),
  status: text('status', { enum: ['pending', 'done', 'canceled', 'failed'] }).notNull(),
  method: text('method'),
  approvedAt: timestamp('approved_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ── 남용 신호 / 계정군 추적 ──────────────────────────────────────────

export const abuseIdentities = pgTable('abuse_identities', {
  id: text('id').primaryKey(),
  identityType: text('identity_type', {
    enum: ['ip', 'email_domain', 'email_local', 'polar_customer', 'toss_customer'],
  }).notNull(),
  identityHash: text('identity_hash').notNull(),
  riskScore: integer('risk_score').default(0).notNull(),
  eventCount: integer('event_count').default(0).notNull(),
  userCount: integer('user_count').default(0).notNull(),
  firstSeenAt: timestamp('first_seen_at', { mode: 'date' }).defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at', { mode: 'date' }).defaultNow().notNull(),
});

export const abuseEvents = pgTable('abuse_events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  identityId: text('identity_id').references(() => abuseIdentities.id, { onDelete: 'set null' }),
  event: text('event', {
    enum: [
      'signup_created',
      'signup_rate_limited',
      'email_verified',
      'free_search_used',
      'quota_blocked',
      'duplicate_query_cluster',
      'market_risk_flagged',
      'supplier_revealed',
      'supplier_url_clicked',
      'rfq_copied',
      'export_clicked',
      'subscription_created',
      'subscription_canceled',
      'payment_done',
    ],
  }).notNull(),
  severity: integer('severity').default(1).notNull(),
  emailDomain: text('email_domain'),
  ip: text('ip'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ── 베타 웨이트리스트 ─────────────────────────────────────────────────

export const waitlist = pgTable('waitlist', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  source: text('source').default('landing').notNull(),
  ip: text('ip'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ── 검증 공급자 DB (수동 검증된 실제 공급자) ─────────────────────────
export const verifiedSuppliers = pgTable('verified_suppliers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  platform: text('platform').notNull(), // EC21, BuyKorea, tradeKorea, Direct
  url: text('url'),
  category: text('category').notNull(), // K-Beauty, K-Food, K-Fashion, Electronics, Industrial
  country: text('country').default('KR').notNull(),
  moqMin: integer('moq_min'),
  leadTimeDays: integer('lead_time_days'),
  certifications: text('certifications'), // comma-separated: MFDS,HACCP,KC,KS,ISO
  trustScore: integer('trust_score'), // 수동 검증 점수 0-100
  notes: text('notes'),
  active: boolean('active').default(true).notNull(),
  verifiedAt: timestamp('verified_at', { mode: 'date' }).defaultNow().notNull(),
  addedBy: text('added_by'), // admin email
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// ── 식약처(MFDS) 등록 화장품 기업 (실데이터: 제조/책임판매 · 사업자번호 · 등록일 · 공장주소) ──
export const krCosmeticsFirms = pgTable('kr_cosmetics_firms', {
  entpSeq: text('entp_seq').primaryKey(),
  name: text('name').notNull(),
  nameNorm: text('name_norm').notNull(), // 매칭용 정규화 상호
  induty: text('induty').notNull(),      // 화장품제조 | 화장품책임판매
  isManufacturer: boolean('is_manufacturer').notNull(),
  bossName: text('boss_name'),
  permitDate: text('permit_date'),       // YYYYMMDD (등록일 → 업력)
  factoryAddr: text('factory_addr'),
  bizrno: text('bizrno'),                // 사업자등록번호
  fetchedAt: timestamp('fetched_at', { mode: 'date' }).defaultNow(),
});

// ── HACCP 인증 식품 제조사 (한국식품안전관리인증원, 업체명 매칭) ──
export const krHaccpFirms = pgTable('kr_haccp_firms', {
  appointno: text('appointno').primaryKey(), // HACCP 지정번호
  company: text('company').notNull(),
  companyNorm: text('company_norm').notNull(),
  productGb: text('product_gb'),       // 식품 | 축산물
  businessItem: text('business_item'), // 품목명
  companykindNm: text('companykind_nm'),
  area1: text('area1'),
  area2: text('area2'),
  issueDate: text('issue_date'),
});

// ── 플랜별 한도 ───────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  free:       { monthly: 10,  label: '무료 회원' }, // [C-4] 가입 회원 월 10회 — 익명 체험(kv.ts FREE_DAILY_LIMIT=일 5회)보다 가입이 나은 구조
  starter:    { monthly: 30,  label: 'Starter' },
  pro:        { monthly: 60,  label: 'Pro' },
  enterprise: { monthly: 999, label: 'Enterprise' },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;

export type VerifiedSupplier = typeof verifiedSuppliers.$inferSelect;

// ── 소셜 미디어 자동화 발행 로그 ──────────────────────────────────────
export const socialPosts = pgTable('social_posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  articleUrl: text('article_url').notNull().unique(),
  articleTitle: text('article_title').notNull(),
  threadsPostId: text('threads_post_id'),
  twitterPostId: text('twitter_post_id'),
  status: text('status', { enum: ['published', 'partial', 'failed'] }).notNull().default('published'),
  publishedAt: timestamp('published_at', { mode: 'date' }).defaultNow().notNull(),
});

export type SocialPost = typeof socialPosts.$inferSelect;

// ── 블로그 포스트 ──────────────────────────────────────────────────────
export const blogPosts = pgTable('blog_posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  lang: text('lang', { enum: ['en', 'ko'] }).notNull().default('en'),
  publishedAt: timestamp('published_at', { mode: 'date' }).notNull(),
  readingTimeMin: integer('reading_time_min').notNull().default(5),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

// ── 검색 히스토리 (AI 소싱 결과 전체 저장) ────────────────────────────
export const searchHistory = pgTable('search_history', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  product: text('product').notNull(),
  region: text('region').notNull(), // 'korea' | 'china' | 'any'
  supplierCount: integer('supplier_count').notNull().default(0),
  // top 3 supplier names for quick display (comma-separated)
  topSuppliers: text('top_suppliers'),
  // full JSON result blob (SourcingOutput)
  resultJson: text('result_json'),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export type SearchHistory = typeof searchHistory.$inferSelect;
