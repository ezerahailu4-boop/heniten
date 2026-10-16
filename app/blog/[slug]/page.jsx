import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { marked } from 'marked';
import ProjectEstimator from '@/components/ProjectEstimator';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const rows = await sql`
      SELECT title, excerpt, cover_image, category
      FROM posts
      WHERE slug = ${slug} AND published = true
      LIMIT 1
    `;
    if (!rows.length) return { title: 'Article Not Found | Heniten Construction' };
    const p = rows[0];
    return {
      title: `${p.title} | Heniten Construction PLC`,
      description: p.excerpt,
      openGraph: {
        title: p.title,
        description: p.excerpt,
        images: [p.cover_image || '/assets/images/taf-headquarters.webp'],
        type: 'article',
      },
    };
  } catch {
    return { title: 'Article | Heniten Construction' };
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  let post = null;
  let related = [];

  try {
    const postRows = await sql`
      SELECT * FROM posts
      WHERE slug = ${slug} AND published = true
      LIMIT 1
    `;

    if (!postRows.length) {
      notFound();
    }
    post = postRows[0];

    related = await sql`
      SELECT id, slug, title, cover_image, category, read_time, created_at
      FROM posts
      WHERE published = true AND slug != ${slug}
      ORDER BY created_at DESC
      LIMIT 3
    `;
  } catch (err) {
    console.error('Error fetching blog post:', err);
    notFound();
  }

  // Parse markdown content
  const htmlContent = marked.parse(post.content || '');

  return (
    <div style={{ minHeight: '100vh', background: '#080e1b', color: '#f1f5f9', fontFamily: 'Outfit, system-ui, sans-serif' }}>
      {/* Blog Top Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,24,43,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, padding: '16px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/assets/images/logo-white.svg" alt="Heniten Construction" style={{ height: '36px' }} />
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/blog" style={{ color: '#fdb913', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
              ← All Articles
            </Link>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              Main Site
            </Link>
            <Link
              href="/#contact"
              style={{
                background: 'linear-gradient(135deg, #fdb913, #e5a00d)',
                color: '#0b1f3a',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                textDecoration: 'none',
              }}
            >
              Request Quote
            </Link>
          </nav>
        </div>
      </header>

      {/* Article Header */}
      <article style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 24px 100px' }}>
        {/* Breadcrumb & Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <Link href="/blog" style={{ color: '#64748b', textDecoration: 'none', fontSize: '13px' }}>
            Articles
          </Link>
          <span style={{ color: '#475569' }}>/</span>
          <span style={{ background: 'rgba(253,185,19,0.12)', color: '#fdb913', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
            {post.category}
          </span>
          <span style={{ color: '#64748b', fontSize: '13px' }}>
            {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span style={{ color: '#475569' }}>·</span>
          <span style={{ color: '#64748b', fontSize: '13px' }}>{post.read_time}</span>
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 46px)', fontWeight: '800', lineHeight: '1.2', color: '#ffffff', marginBottom: '24px', letterSpacing: '-0.02em' }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '36px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #fdb913, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#0b1f3a', fontSize: '18px' }}>
            H
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>{post.author}</div>
            <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>Heniten Construction Technical Engineering Division</div>
          </div>
        </div>

        {/* Cover Photo */}
        {post.cover_image && (
          <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #1e293b' }}>
            <img
              src={post.cover_image}
              alt={post.title}
              style={{ width: '100%', maxHeight: '460px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Excerpt callout box */}
        {post.excerpt && (
          <div style={{ background: '#0d182b', borderLeft: '4px solid #fdb913', padding: '20px 24px', borderRadius: '0 12px 12px 0', marginBottom: '40px', color: '#cbd5e1', fontSize: '16.5px', lineHeight: '1.7', fontStyle: 'italic' }}>
            "{post.excerpt}"
          </div>
        )}

        {/* Article Markdown Body */}
        <div
          className="blog-prose"
          style={{
            fontSize: '17px',
            lineHeight: '1.85',
            color: '#cbd5e1',
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <style>{`
          .blog-prose h2 {
            font-size: 26px;
            color: #ffffff;
            font-weight: 800;
            margin-top: 48px;
            margin-bottom: 18px;
            letter-spacing: -0.01em;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            padding-bottom: 8px;
          }
          .blog-prose h3 {
            font-size: 20px;
            color: #fdb913;
            font-weight: 700;
            margin-top: 36px;
            margin-bottom: 14px;
          }
          .blog-prose p {
            margin-bottom: 24px;
          }
          .blog-prose ul, .blog-prose ol {
            margin-bottom: 24px;
            padding-left: 28px;
          }
          .blog-prose li {
            margin-bottom: 10px;
          }
          .blog-prose strong {
            color: #ffffff;
          }
          .blog-prose blockquote {
            border-left: 3px solid #38bdf8;
            margin: 28px 0;
            padding-left: 20px;
            color: #94a3b8;
            font-style: italic;
          }
        `}</style>

        {/* In-article Lead Conversion Block */}
        <div style={{ marginTop: '60px', padding: '36px', background: 'linear-gradient(135deg, #0d182b, #15243f)', border: '1px solid rgba(253,185,19,0.35)', borderRadius: '16px' }}>
          <div style={{ color: '#fdb913', fontWeight: '800', fontSize: '12px', letterSpacing: '0.08em', marginBottom: '8px' }}>
            ENGINEERING CONSULTATION
          </div>
          <h3 style={{ fontSize: '22px', color: '#fff', fontWeight: '800', marginBottom: '10px' }}>
            Need Expert Contractor Execution for Similar Works?
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.7', marginBottom: '24px' }}>
            Heniten Construction PLC manages turnkey execution under EBCS, BS, and ASTM standards. Discuss your structural drawings or Bill of Quantities with our senior project bureau.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              href="/#contact"
              style={{ background: 'linear-gradient(135deg, #fdb913, #e5a00d)', color: '#0b1f3a', padding: '12px 24px', borderRadius: '8px', fontWeight: '800', textDecoration: 'none', fontSize: '14px' }}
            >
              Request Official Quotation →
            </Link>
            <a
              href="tel:+251991999501"
              style={{ background: '#080e1b', color: '#fff', border: '1px solid #243553', padding: '12px 20px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}
            >
              📞 Call Addis Ababa Bureau: +251 991 999 501
            </a>
          </div>
        </div>

        {/* Interactive Scope & Quotation Estimator */}
        <ProjectEstimator />

        {/* Related Articles */}
        {related.length > 0 && (
          <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #1e293b' }}>
            <h3 style={{ fontSize: '22px', color: '#fff', fontWeight: '800', marginBottom: '24px' }}>
              Related Engineering Articles
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {related.map(r => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  style={{ textDecoration: 'none', background: '#0d182b', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}
                >
                  <img
                    src={r.cover_image || '/assets/images/taf-headquarters.webp'}
                    alt={r.title}
                    style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#fdb913', fontWeight: '700', marginBottom: '6px' }}>{r.category}</div>
                    <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.4', margin: 0 }}>{r.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', background: '#050912', padding: '36px 24px', textAlign: 'center', fontSize: '13.5px', color: '#64748b' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>© {new Date().getFullYear()} Heniten Construction PLC. Addis Ababa, Ethiopia.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
            <Link href="/blog" style={{ color: '#fdb913', textDecoration: 'none' }}>Blog Index</Link>
            <Link href="/admin" style={{ color: '#64748b', textDecoration: 'none' }}>Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
