# Heniten Construction PLC – Next.js + Neon Postgres

High-performance digital presence, quotation engine, engineering blog, and management console for Heniten Construction PLC (Grade 5 BC-6 licensed contractor in Addis Ababa, Ethiopia).

## Features
- **Cinematic Homepage**: Daylight architectural slides, real-time welding spark atmospheric canvas, dynamic cost estimator, interactive 5-category portfolio case studies.
- **Neon Serverless Postgres**: Powered by `@neondatabase/serverless` with sub-10ms queries, automatic connection pooling, and resilient schema.
- **Engineering Blog & Whitepapers**: Full-featured blog at `/blog` and dynamic articles at `/blog/[slug]` with markdown parsing, categories, read times, and author credentials.
- **Admin Management Console**: Access at `/admin` to view/filter/export client RFPs & inquiries, publish/edit blog articles, and manage project statuses.
- **Inquiry Notification Engine**: Automated rate-limiting, honeypot protection, optional Resend email dispatch, and Telegram bot alerts.

## Environment Variables (.env.local)
```env
NEXT_PUBLIC_SITE_URL=https://heniten.com
DATABASE_URL=postgresql://neondb_owner:npg_...ep-...aws.neon.tech/neondb?sslmode=require
ADMIN_JWT_SECRET=heniten-super-secure-jwt-key-2026-production

# Optional integrations:
RESEND_API_KEY=
MAIL_FROM=Heniten Website <noreply@heniten.com>
NOTIFY_EMAIL=henitenc@gmail.com,tenders@heniten.com
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## Default Admin Credentials
- **Email**: `admin@heniten.com`
- **Password**: `heniten2026!`

## Run Locally
```bash
npm install
npm run dev
```
- Main website: `http://localhost:3000`
- Blog portal: `http://localhost:3000/blog`
- Admin dashboard: `http://localhost:3000/admin`

## Production Deployment
Deploy to Vercel and supply the `DATABASE_URL` and `ADMIN_JWT_SECRET` environment variables.
