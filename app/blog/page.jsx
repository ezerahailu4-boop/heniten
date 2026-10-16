import { sql } from '@/lib/db';
import Link from 'next/link';
import ProjectEstimator from '@/components/ProjectEstimator';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Engineering Insights & Construction Articles | Heniten Construction PLC',
  description: 'Technical articles, engineering case studies, structural codes (EBCS), fuel terminal standards, and construction project updates from Addis Ababa, Ethiopia.',
  openGraph: {
    title: 'Heniten Construction PLC - Engineering Insights & Blog',
    description: 'Field notes, seismic engineering, aviation fuel terminals, and industrial design across East Africa.',
    images: ['/assets/images/taf-headquarters.webp'],
  },
};

export default async function BlogIndexPage() {
  let posts = [];
  try {
    posts = await sql`
      SELECT id, slug, title, excerpt, cover_image, category, author, read_time, created_at
      FROM posts
      WHERE published = true
      ORDER BY created_at DESC
    `;
  } catch (err) {
    console.error('Failed to load blog posts from Neon:', err);
  }

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div style={{ minHeight: '100vh', background: '#080e1b', color: '#f1f5f9', fontFamily: 'Outfit, system-ui, sans-serif' }}>
      <style>{`
        .tilt-card {
          perspective: 1000px;
          transform-style: preserve-3d;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
          position: relative;
        }
        .tilt-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(450px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(253, 185, 19, 0.16), transparent 45%);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease;
          z-index: 5;
        }
        .tilt-card:hover::before {
          opacity: 1;
        }
        .tilt-card:hover {
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6);
          border-color: rgba(253, 185, 19, 0.5) !important;
        }
        .reveal-up {
          opacity: 0;
          transform: translateY(30px);
          filter: blur(6px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-up.is-revealed {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }
        .stagger-container > *:nth-child(1) { transition-delay: 0.05s; }
        .stagger-container > *:nth-child(2) { transition-delay: 0.12s; }
        .stagger-container > *:nth-child(3) { transition-delay: 0.19s; }
        .stagger-container > *:nth-child(4) { transition-delay: 0.26s; }
        .stagger-container > *:nth-child(5) { transition-delay: 0.33s; }
        .stagger-container > *:nth-child(6) { transition-delay: 0.40s; }
      `}</style>

      {/* Blog Top Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,24,43,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/assets/images/logo-white.svg" alt="Heniten Construction" style={{ height: '36px' }} />
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}>
              ← Return to Main Site
            </Link>
            <Link href="/#projects" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              Projects
            </Link>
            <Link href="#estimator" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              Cost Estimator
            </Link>
            <Link href="/#contact" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              Contact
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

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', background: 'radial-gradient(ellipse at 50% 0%, #172744 0%, #080e1b 75%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(253,185,19,0.1)', border: '1px solid rgba(253,185,19,0.3)', color: '#fdb913', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '20px' }}>
            <span>⚡</span> HENITEN TECHNICAL FIELD NOTES & ARTICLES
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: '800', lineHeight: '1.15', color: '#ffffff', maxWidth: '850px', margin: '0 auto 20px', letterSpacing: '-0.02em' }}>
            Engineering Standards, Structural Design & Infrastructure Updates
          </h1>
          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '650px', margin: '0 auto', lineHeight: '1.7' }}>
            Insights from our Addis Ababa engineering bureau covering high-rise concrete frameworks, retail fuel networks, seismic EBCS compliance, and industrial prefabrication.
          </p>
        </div>
      </section>

      {/* Content Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px 100px' }}>
        {/* Featured Top Story */}
        {featuredPost && (
          <div style={{ marginBottom: '60px' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.1em', color: '#fdb913', textTransform: 'uppercase', marginBottom: '16px' }}>
              FEATURED ANALYSIS
            </div>

            <Link
              href={`/blog/${featuredPost.slug}`}
              className="tilt-card reveal-up"
              style={{
                textDecoration: 'none',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                background: 'linear-gradient(145deg, #0d182b, #111e36)',
                border: '1px solid rgba(253,185,19,0.25)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ position: 'relative', minHeight: '340px' }}>
                <img
                  src={featuredPost.cover_image || '/assets/images/taf-headquarters.webp'}
                  alt={featuredPost.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(8,14,27,0.85) 100%)' }}></div>
              </div>

              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ background: '#fdb913', color: '#0b1f3a', fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    {featuredPost.category}
                  </span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {new Date(featuredPost.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} · {featuredPost.read_time}
                  </span>
                </div>

                <h2 style={{ fontSize: '28px', color: '#ffffff', fontWeight: '800', lineHeight: '1.3', marginBottom: '16px' }}>
                  {featuredPost.title}
                </h2>

                <p style={{ color: '#94a3b8', fontSize: '15.5px', lineHeight: '1.7', marginBottom: '24px' }}>
                  {featuredPost.excerpt}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                    By <strong style={{ color: '#fff' }}>{featuredPost.author}</strong>
                  </div>
                  <span style={{ color: '#fdb913', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Read Full Case Study →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
            All Engineering & Infrastructure Articles
          </h3>
        </div>

        {regularPosts.length === 0 && !featuredPost ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#0d182b', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <h4 style={{ color: '#fff', fontSize: '20px' }}>No blog articles published yet</h4>
            <p style={{ color: '#64748b' }}>Check back shortly or visit the admin portal to publish content.</p>
          </div>
        ) : (
          <div className="stagger-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '28px' }}>
            {regularPosts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="tilt-card reveal-up"
                style={{
                  textDecoration: 'none',
                  background: '#0d182b',
                  border: '1px solid #1e293b',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: '220px', position: 'relative', background: '#152238' }}>
                  <img
                    src={post.cover_image || '/assets/images/taf-headquarters.webp'}
                    alt={post.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                    <span style={{ background: 'rgba(11,31,58,0.85)', backdropFilter: 'blur(8px)', color: '#fdb913', fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '4px', border: '1px solid rgba(253,185,19,0.3)' }}>
                      {post.category}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                    {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} · {post.read_time}
                  </div>

                  <h3 style={{ fontSize: '19px', color: '#ffffff', fontWeight: '700', lineHeight: '1.4', marginBottom: '12px' }}>
                    {post.title}
                  </h3>

                  <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                    {post.excerpt ? post.excerpt.slice(0, 130) + '...' : ''}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #1a273f' }}>
                    <span style={{ fontSize: '12.5px', color: '#64748b' }}>{post.author}</span>
                    <span style={{ color: '#fdb913', fontSize: '13px', fontWeight: '700' }}>Read Article →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Interactive Project Quotation & Scope Estimator */}
        <ProjectEstimator />

        {/* Bottom CTA Banner */}
        <div style={{ marginTop: '80px', padding: '48px 40px', background: 'radial-gradient(circle at 10% 50%, #172744 0%, #0d182b 100%)', borderRadius: '16px', border: '1px solid rgba(253,185,19,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ color: '#fdb913', fontWeight: '800', fontSize: '12px', letterSpacing: '0.08em', marginBottom: '8px' }}>START YOUR PROJECT</div>
            <h3 style={{ color: '#fff', fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>Have a Commercial or Energy Construction Project?</h3>
            <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '580px', margin: 0 }}>
              Connect with our licensed civil engineers at TAF Headquarters in Wello Sefer for BOQ formulation and turnkey tenders.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/#contact"
              style={{ background: 'linear-gradient(135deg, #fdb913, #e5a00d)', color: '#0b1f3a', padding: '13px 26px', borderRadius: '8px', fontWeight: '800', textDecoration: 'none', fontSize: '14px' }}
            >
              Submit Tender Specs →
            </Link>
            <a
              href="tel:+251991999501"
              style={{ background: '#152238', color: '#fff', border: '1px solid #243553', padding: '13px 20px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}
            >
              📞 +251 991 999 501
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', background: '#050912', padding: '40px 24px', textAlign: 'center', fontSize: '13.5px', color: '#64748b' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>© {new Date().getFullYear()} Heniten Construction PLC. Grade 5 (BC-6) Licensed Contractor. Addis Ababa, Ethiopia.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
            <Link href="/blog" style={{ color: '#fdb913', textDecoration: 'none' }}>Articles</Link>
            <Link href="/admin" style={{ color: '#64748b', textDecoration: 'none' }}>Staff Login</Link>
          </div>
        </div>
      </footer>

      {/* Interactive 3D Perspective Card Tilt & Scroll Reveal Observer */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              // Scroll reveal
              var reveals = document.querySelectorAll('.reveal-up');
              if ('IntersectionObserver' in window) {
                var observer = new IntersectionObserver(function(entries, obs) {
                  entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                      entry.target.classList.add('is-revealed');
                      obs.unobserve(entry.target);
                    }
                  });
                }, { threshold: 0.1 });
                reveals.forEach(function(el) { observer.observe(el); });
              } else {
                reveals.forEach(function(el) { el.classList.add('is-revealed'); });
              }

              // 3D Perspective Tilt & Mouse Spotlight
              var tiltCards = document.querySelectorAll('.tilt-card');
              tiltCards.forEach(function(card) {
                card.addEventListener('pointermove', function(e) {
                  var rect = card.getBoundingClientRect();
                  var x = e.clientX - rect.left;
                  var y = e.clientY - rect.top;
                  var centerX = rect.width / 2;
                  var centerY = rect.height / 2;
                  var rotateX = ((y - centerY) / centerY) * -5;
                  var rotateY = ((x - centerX) / centerX) * 5;

                  card.style.setProperty('--mouse-x', x.toFixed(1) + 'px');
                  card.style.setProperty('--mouse-y', y.toFixed(1) + 'px');
                  card.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-8px)';
                });

                card.addEventListener('pointerleave', function() {
                  card.style.transform = '';
                });
              });
            });
          `,
        }}
      />
    </div>
  );
}
