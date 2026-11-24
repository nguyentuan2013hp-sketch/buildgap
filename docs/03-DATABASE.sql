-- BuildGap Database Schema (PostgreSQL / Supabase)
create extension if not exists "pgcrypto";

create table if not exists raw_signals (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text not null,
  source_url text not null,
  author text,
  title text,
  body text not null,
  rating smallint,
  upvotes integer default 0,
  mentioned_product text,
  raw_meta jsonb default '{}'::jsonb,
  status text not null default 'pending',
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  unique (source, external_id)
);

create index if not exists idx_raw_signals_status on raw_signals(status);
create index if not exists idx_raw_signals_source on raw_signals(source);

create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  one_liner text not null,
  problem_summary text not null,
  industry_slug text not null,
  industry_name text not null,
  product_type text not null,
  build_time text not null,
  pain_score smallint not null check (pain_score between 1 and 100),
  willingness_to_pay text not null,
  evidence_count integer not null default 1,
  sources text[] not null default '{}',
  target_audience text not null,
  competitors jsonb not null default '[]'::jsonb,
  mvp_scope text[] not null default '{}',
  monetization_model text not null,
  build_spec_prd text not null,
  build_spec_schema text not null,
  build_spec_prompt text not null,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ideas_industry on ideas(industry_slug);
create index if not exists idx_ideas_product_type on ideas(product_type);
create index if not exists idx_ideas_pain_score on ideas(pain_score desc);
create index if not exists idx_ideas_published on ideas(is_published, created_at desc);

create table if not exists idea_evidence (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas(id) on delete cascade,
  raw_signal_id uuid references raw_signals(id) on delete set null,
  source text not null,
  quote text not null,
  source_url text not null,
  author text,
  published_at timestamptz,
  is_free_preview boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_idea_evidence_idea_id on idea_evidence(idea_id);

create table if not exists competitor_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  website_url text,
  summary text not null,
  top_complaints text[] not null default '{}',
  complaint_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists user_entitlements (
  user_id uuid primary key,
  email text not null,
  plan text not null default 'free',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source_page text,
  created_at timestamptz not null default now()
);

alter table ideas enable row level security;
alter table idea_evidence enable row level security;
alter table competitor_profiles enable row level security;
alter table user_entitlements enable row level security;

create policy "Public read published ideas" on ideas for select using (is_published = true);
create policy "Public read published competitors" on competitor_profiles for select using (true);
create policy "Users read own entitlement" on user_entitlements for select using (auth.uid() = user_id);
