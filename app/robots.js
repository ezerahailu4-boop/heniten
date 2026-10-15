const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://heniten.com';
export default function robots() { return { rules: [{ userAgent: '*', allow: '/', disallow: '/admin' }], sitemap: base + '/sitemap.xml' }; }
