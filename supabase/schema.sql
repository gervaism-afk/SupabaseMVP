create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  image_url text not null,
  sport text not null default '',
  player text not null default '',
  year text not null default '',
  brand text not null default '',
  set_name text not null default '',
  card_number text not null default '',
  graded_company text not null default '',
  grade text not null default '',
  serial_number text not null default '',
  flags text[] not null default '{}',
  estimated_price_cad numeric null,
  price_source text not null default ''
);
alter table public.cards enable row level security;
drop policy if exists "public read" on public.cards;
create policy "public read" on public.cards for select using (true);
drop policy if exists "public insert" on public.cards;
create policy "public insert" on public.cards for insert with check (true);
