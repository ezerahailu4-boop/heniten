'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react';

const STATUS_LIST = ['new', 'reviewed', 'quoted', 'won', 'lost'];
const CATEGORIES = [
  'Aviation & Energy Infrastructure',
  'Industrial Engineering',
  'Commercial Construction',
  'Fuel Station Facilities',
  'Residential & Real Estate',
  'General Civil Engineering',
];

const csvExport = rows => [
  ['Ref', 'Date', 'Source', 'Name', 'Phone', 'Email', 'Status', 'Payload'],
  ...rows.map(r => [
    r.ref,
    new Date(r.created_at).toLocaleString(),
    r.source,
    r.name,
    r.phone || '',
    r.email || '',
    r.status,
    JSON.stringify(r.payload || {}),
  ])
]
  .map(l => l.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
  .join('\n');

export default function AdminPage() {
  const [sessionUser, setSessionUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inquiries'); // 'inquiries' | 'posts' | 'new-post'

  // Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openInquiryId, setOpenInquiryId] = useState(null);

  // Blog Posts State
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    category: CATEGORIES[0],
    cover_image: '/assets/images/taf-headquarters.webp',
    excerpt: '',
    content: '',
    author: 'Heniten Engineering Bureau',
    read_time: '4 min read',
    published: true,
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  // Check auth on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setSessionUser(data.user);
          loadData();
        }
      }
    } catch (err) {
      console.error('Session check failed', err);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [inqRes, postRes] = await Promise.all([
        fetch('/api/inquiries'),
        fetch('/api/posts'),
      ]);

      if (inqRes.ok) {
        const inqData = await inqRes.json();
        setInquiries(inqData.rows || []);
      }
      if (postRes.ok) {
        const pData = await postRes.json();
        setPosts(pData.posts || []);
      }
    } catch (err) {
      console.error('Data load error', err);
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed');
      } else {
        setSessionUser(data.user);
        loadData();
      }
    } catch (err) {
      setLoginError('Could not reach server. Verify database credentials.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSessionUser(null);
  };

  const updateInquiryStatus = async (id, status) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setInquiries(prev => prev.map(item => (item.id === id ? { ...item, status } : item)));
        showNotice(`Inquiry status updated to ${status}`);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSavePost = async e => {
    e.preventDefault();
    try {
      const isEdit = Boolean(editingPost);
      const url = isEdit ? `/api/posts/${editingPost.id}` : '/api/posts';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postForm),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error saving post');
      } else {
        showNotice(isEdit ? 'Article updated successfully!' : 'New article published!');
        setEditingPost(null);
        resetPostForm();
        setActiveTab('posts');
        loadData();
      }
    } catch (err) {
      alert('Failed to save article.');
    }
  };

  const handleDeletePost = async id => {
    if (!confirm('Are you sure you want to permanently delete this article?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
        showNotice('Article deleted');
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const startEditPost = post => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      cover_image: post.cover_image,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      read_time: post.read_time,
      published: post.published,
    });
    setActiveTab('new-post');
  };

  const resetPostForm = () => {
    setPostForm({
      title: '',
      slug: '',
      category: CATEGORIES[0],
      cover_image: '/assets/images/taf-headquarters.webp',
      excerpt: '',
      content: '',
      author: 'Heniten Engineering Bureau',
      read_time: '4 min read',
      published: true,
    });
    setEditingPost(null);
  };

  const showNotice = msg => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const downloadCsv = () => {
    const blob = new Blob([csvExport(inquiries)], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `heniten-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(item => {
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.ref.toLowerCase().includes(q) ||
        (item.phone && item.phone.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [inquiries, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1329', color: '#fdb913', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '2px', marginBottom: '12px' }}>HENITEN MANAGEMENT CONSOLE</div>
          <p style={{ color: '#94a3b8' }}>Connecting to Neon Postgres...</p>
        </div>
      </div>
    );
  }

  // Login view
  if (!sessionUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top, #152238 0%, #080d1a 100%)', fontFamily: 'system-ui', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: '#0d182b', border: '1px solid rgba(253,185,19,0.25)', borderRadius: '16px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #fdb913, #e5a00d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#0b1f3a', fontSize: '20px' }}>H</div>
            <div>
              <div style={{ color: '#fff', fontWeight: '800', fontSize: '18px', letterSpacing: '0.04em' }}>HENITEN CONSTRUCTION</div>
              <div style={{ color: '#fdb913', fontSize: '11px', letterSpacing: '0.08em', fontWeight: '700' }}>ENGINEERING & BLOG PORTAL</div>
            </div>
          </div>

          <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '8px' }}>Sign in to Admin</h2>
          <p style={{ color: '#94a3b8', fontSize: '13.5px', marginBottom: '28px' }}>Manage live client inquiries, tender quotes, and engineering blog articles.</p>

          {loginError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12.5px', fontWeight: '600', marginBottom: '6px' }}>Official Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="admin@heniten.com"
                style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', background: '#080e1b', border: '1px solid #243553', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12.5px', fontWeight: '600', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', background: '#080e1b', border: '1px solid #243553', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg, #fdb913, #e5a00d)', color: '#0b1f3a', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}
            >
              Sign In to Dashboard →
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #1e293b', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
            Powered by Neon Serverless Postgres (AWS us-east-2)
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div style={{ minHeight: '100vh', background: '#080e1b', color: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Navigation Bar */}
      <header style={{ background: '#0d182b', borderBottom: '1px solid #1e293b', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fdb913', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#0b1f3a' }}>H</div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px', letterSpacing: '0.04em' }}>HENITEN ADMINISTRATION</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#10b981' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Neon Postgres Online · {sessionUser.email}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px', padding: '7px 12px', border: '1px solid #243553', borderRadius: '6px' }}
          >
            ↗ View Main Site
          </a>
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#fdb913', textDecoration: 'none', fontSize: '13px', padding: '7px 12px', border: '1px solid rgba(253,185,19,0.3)', borderRadius: '6px' }}
          >
            ↗ View Blog
          </a>
          <button
            onClick={handleLogout}
            style={{ background: '#1e293b', border: 'none', color: '#ef4444', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px' }}>
        {actionNotice && (
          <div style={{ background: '#064e3b', border: '1px solid #059669', color: '#a7f3d0', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>
            ✓ {actionNotice}
          </div>
        )}

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('inquiries')}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'inquiries' ? '#fdb913' : '#152238',
              color: activeTab === 'inquiries' ? '#0b1f3a' : '#cbd5e1',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📋 Inquiries & Tenders ({inquiries.length})
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'posts' ? '#fdb913' : '#152238',
              color: activeTab === 'posts' ? '#0b1f3a' : '#cbd5e1',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ✍️ Blog Articles ({posts.length})
          </button>

          <button
            onClick={() => {
              resetPostForm();
              setActiveTab('new-post');
            }}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'new-post' ? '#10b981' : '#152238',
              color: activeTab === 'new-post' ? '#080e1b' : '#34d399',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginLeft: 'auto',
            }}
          >
            + Write New Article
          </button>
        </div>

        {/* =========================================================================
            TAB 1: INQUIRIES & TENDER REQUESTS
            ========================================================================= */}
        {activeTab === 'inquiries' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Filter Status:</span>
                {['all', ...STATUS_LIST].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: statusFilter === st ? '#fdb913' : '#243553',
                      background: statusFilter === st ? '#fdb913' : '#0d182b',
                      color: statusFilter === st ? '#0b1f3a' : '#cbd5e1',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search name, phone, ref..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '8px 14px', background: '#0d182b', border: '1px solid #243553', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none', width: '220px' }}
                />
                <button
                  onClick={downloadCsv}
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={loadData}
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {filteredInquiries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#0d182b', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📬</div>
                <h3 style={{ fontSize: '18px', color: '#e2e8f0' }}>No inquiries found</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Inquiries submitted via the quotation calculator or contact forms will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {filteredInquiries.map(item => (
                  <div
                    key={item.id}
                    style={{
                      background: '#0d182b',
                      border: '1px solid #1e293b',
                      borderRadius: '10px',
                      padding: '16px 20px',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '800', fontSize: '16px', color: '#fff' }}>{item.name}</span>
                          <span style={{ background: '#fdb913', color: '#0b1f3a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                            {item.ref}
                          </span>
                          <span style={{ background: item.source === 'quotation' ? '#3b82f6' : '#8b5cf6', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                            {item.source.toUpperCase()}
                          </span>
                          <span style={{ color: '#64748b', fontSize: '12px' }}>
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', fontSize: '13.5px', color: '#94a3b8' }}>
                          {item.phone && <span>📞 {item.phone}</span>}
                          {item.email && <span>✉️ {item.email}</span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <select
                          value={item.status}
                          onChange={e => updateInquiryStatus(item.id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            background: '#152238',
                            border: '1px solid #243553',
                            borderRadius: '6px',
                            color: '#fdb913',
                            fontWeight: '700',
                            fontSize: '12.5px',
                            cursor: 'pointer',
                          }}
                        >
                          {STATUS_LIST.map(st => (
                            <option key={st} value={st}>
                              Status: {st.toUpperCase()}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => setOpenInquiryId(openInquiryId === item.id ? null : item.id)}
                          style={{
                            padding: '6px 14px',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: '#cbd5e1',
                            borderRadius: '6px',
                            fontSize: '12.5px',
                            cursor: 'pointer',
                          }}
                        >
                          {openInquiryId === item.id ? 'Hide Details' : 'View Payload'}
                        </button>
                      </div>
                    </div>

                    {openInquiryId === item.id && (
                      <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #1e293b', background: '#080e1b', borderRadius: '8px', padding: '14px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>DETAILED SUBMISSION PARAMETERS:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', fontSize: '13px' }}>
                          {Object.entries(item.payload || {}).map(([k, v]) => (
                            <div key={k} style={{ background: '#0d182b', padding: '8px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                              <strong style={{ color: '#fdb913' }}>{k}:</strong> <span style={{ color: '#e2e8f0' }}>{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: BLOG POSTS LIST
            ========================================================================= */}
        {activeTab === 'posts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Published & Draft Articles</h3>
                <p style={{ color: '#94a3b8', fontSize: '13.5px' }}>These engineering insights appear on your public website at <code>/blog</code>.</p>
              </div>
              <button
                onClick={() => {
                  resetPostForm();
                  setActiveTab('new-post');
                }}
                style={{ background: '#fdb913', color: '#0b1f3a', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
              >
                + Write Article
              </button>
            </div>

            {posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#0d182b', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <h3>No articles found</h3>
                <p style={{ color: '#64748b' }}>Click "+ Write Article" to publish your first post.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {posts.map(p => (
                  <div
                    key={p.id}
                    style={{
                      background: '#0d182b',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <img
                      src={p.cover_image || '/assets/images/taf-headquarters.webp'}
                      alt={p.title}
                      style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', background: '#1e293b' }}
                    />

                    <div style={{ flex: '1', minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ background: '#152238', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                          {p.category}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(p.created_at).toLocaleDateString()} · {p.read_time}
                        </span>
                        <span style={{ background: p.published ? '#064e3b' : '#7f1d1d', color: p.published ? '#34d399' : '#fca5a5', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                          {p.published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '16px', color: '#fff', marginBottom: '6px' }}>{p.title}</h4>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                        {p.excerpt ? p.excerpt.slice(0, 140) + '...' : ''}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <a
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '7px 12px', background: '#152238', color: '#38bdf8', borderRadius: '6px', fontSize: '12.5px', textDecoration: 'none', fontWeight: '600' }}
                      >
                        Preview ↗
                      </a>
                      <button
                        onClick={() => startEditPost(p)}
                        style={{ padding: '7px 14px', background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePost(p.id)}
                        style={{ padding: '7px 12px', background: '#2d151e', border: '1px solid #7f1d1d', color: '#f87171', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: CREATE / EDIT BLOG POST
            ========================================================================= */}
        {activeTab === 'new-post' && (
          <div style={{ background: '#0d182b', border: '1px solid #1e293b', borderRadius: '14px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px', color: '#fff' }}>
                  {editingPost ? 'Edit Blog Article' : 'Draft New Engineering Article'}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '13.5px' }}>
                  Write high-quality technical insights with Markdown formatting (headings, lists, bold text).
                </p>
              </div>
              <button
                onClick={() => {
                  resetPostForm();
                  setActiveTab('posts');
                }}
                style={{ background: '#1e293b', border: 'none', color: '#94a3b8', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSavePost} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Article Title *</label>
                  <input
                    type="text"
                    required
                    value={postForm.title}
                    onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="e.g. Modern Fuel Station Design: Safety Standards and Environmental Protection"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: '#080e1b', border: '1px solid #243553', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>URL Slug (Auto-generated if blank)</label>
                  <input
                    type="text"
                    value={postForm.slug}
                    onChange={e => setPostForm({ ...postForm, slug: e.target.value })}
                    placeholder="modern-fuel-station-design"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: '#080e1b', border: '1px solid #243553', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Category *</label>
                  <select
                    value={postForm.category}
                    onChange={e => setPostForm({ ...postForm, category: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: '#080e1b', border: '1px solid #243553', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Author Name</label>
                  <input
                    type="text"
                    value={postForm.author}
                    onChange={e => setPostForm({ ...postForm, author: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: '#080e1b', border: '1px solid #243553', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Read Time</label>
                  <input
                    type="text"
                    value={postForm.read_time}
                    onChange={e => setPostForm({ ...postForm, read_time: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: '#080e1b', border: '1px solid #243553', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Cover Image Path / URL</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    value={postForm.cover_image}
                    onChange={e => setPostForm({ ...postForm, cover_image: e.target.value })}
                    placeholder="/assets/images/dealers-fuel-station.webp"
                    style={{ flex: 1, padding: '10px 14px', background: '#080e1b', border: '1px solid #243553', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
                  />
                  <select
                    onChange={e => { if (e.target.value) setPostForm({ ...postForm, cover_image: e.target.value }); }}
                    style={{ padding: '10px 14px', background: '#152238', border: '1px solid #243553', borderRadius: '8px', color: '#cbd5e1', fontSize: '13px' }}
                  >
                    <option value="">Quick Select Image...</option>
                    <option value="/assets/images/dealers-fuel-station.webp">Fuel Station</option>
                    <option value="/assets/images/taf-headquarters.webp">TAF HQ Tower</option>
                    <option value="/assets/images/soten-factory.webp">SOTEN Factory</option>
                    <option value="/assets/images/jet-aviation-depot.webp">Aviation Depot</option>
                    <option value="/assets/images/residential-complex.webp">Residential Complex</option>
                    <option value="/assets/images/hero-daylight-crane.webp">Crane Construction</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Short Excerpt (Summary for Cards & SEO) *</label>
                <textarea
                  rows={2}
                  required
                  value={postForm.excerpt}
                  onChange={e => setPostForm({ ...postForm, excerpt: e.target.value })}
                  placeholder="A concise 2-sentence synopsis of this engineering case study or article..."
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: '#080e1b', border: '1px solid #243553', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Full Article Content (Markdown format) *</label>
                <textarea
                  rows={14}
                  required
                  value={postForm.content}
                  onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="## Heading 2&#10;&#10;Write your in-depth engineering analysis here. You can use Markdown like ### Subheadings, lists, and bold text."
                  style={{ width: '100%', boxSizing: 'border-box', padding: '14px', background: '#080e1b', border: '1px solid #243553', borderRadius: '8px', color: '#fff', fontSize: '14px', fontFamily: 'monospace', lineHeight: '1.6' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={postForm.published}
                    onChange={e => setPostForm({ ...postForm, published: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Publish immediately to live website</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #fdb913, #e5a00d)', color: '#0b1f3a', border: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
                >
                  {editingPost ? 'Save Article Changes' : 'Publish Article to Website'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetPostForm();
                    setActiveTab('posts');
                  }}
                  style={{ background: '#1e293b', border: 'none', color: '#94a3b8', padding: '12px 20px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
