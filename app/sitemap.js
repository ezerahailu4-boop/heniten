import { sql } from '@/lib/db';

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://heniten.com';

export default async function sitemap() {
  const routes = [
    { url: base, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
  ];

  try {
    const posts = await sql`
      SELECT slug, updated_at
      FROM posts
      WHERE published = true
    `;

    for (const post of posts) {
      routes.push({
        url: `${base}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || Date.now()),
      });
    }
  } catch (err) {
    console.error('Sitemap query error:', err);
  }

  return routes;
}
