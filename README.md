# Heniten Construction – Next.js + Supabase

1. Create a Supabase project, run `supabase/schema.sql` in the SQL editor, add yourself: `insert into admins values ('you@example.com');`
2. Supabase Auth: create your admin user (email + password) and disable public sign-ups.
3. Copy `.env.example` to `.env.local` and fill it in (Resend / Telegram are optional).
4. `npm install && npm run dev` -> site at `/`, admin at `/admin`.
5. Deploy to Vercel and add the same env vars.
