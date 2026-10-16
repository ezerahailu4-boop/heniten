-- Heniten Construction PLC - Neon PostgreSQL Schema

-- 1. Inquiries & Tender RFPs
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text UNIQUE NOT NULL,
  source text NOT NULL CHECK (source IN ('contact', 'quotation')),
  name text NOT NULL,
  phone text,
  email text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'quoted', 'won', 'lost')),
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inquiries_ip_created_idx ON inquiries(ip, created_at);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON inquiries(status);

-- 2. Staff Admins
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL DEFAULT 'Heniten Admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Engineering Blog & Articles
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  cover_image text,
  category text NOT NULL DEFAULT 'Engineering & Construction',
  author text NOT NULL DEFAULT 'Heniten Engineering Bureau',
  read_time text NOT NULL DEFAULT '4 min read',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(published, created_at DESC);
