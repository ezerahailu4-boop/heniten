const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://heniten.com';
export default function sitemap() { return [{ url: base, lastModified: new Date() }]; }
