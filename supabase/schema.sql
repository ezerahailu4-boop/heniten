create table if not exists admins(email text primary key);
create table if not exists inquiries(
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  source text not null check (source in ('contact','quotation')),
  name text not null, phone text, email text,
  payload jsonb not null default '{}',
  status text not null default 'new' check (status in ('new','reviewed','quoted','won','lost')),
  ip text, created_at timestamptz not null default now());
create index if not exists inquiries_ip_idx on inquiries(ip, created_at);
alter table admins enable row level security;
alter table inquiries enable row level security;
create policy "self" on admins for select to authenticated using (email = auth.jwt()->>'email');
create policy "admins read" on inquiries for select to authenticated
  using (exists(select 1 from admins a where a.email = auth.jwt()->>'email'));
create policy "admins update" on inquiries for update to authenticated
  using (exists(select 1 from admins a where a.email = auth.jwt()->>'email'))
  with check (exists(select 1 from admins a where a.email = auth.jwt()->>'email'));
-- Then add yourself:  insert into admins values ('you@example.com');
-- Inserts happen only through the API route (service role). Disable public sign-ups in Supabase Auth.
