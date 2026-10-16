import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// GET all posts (public gets published only, admin gets all)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const session = await getAdminSession();

    let posts;
    if (session) {
      if (category && category !== 'all') {
        posts = await sql`
          SELECT * FROM posts
          WHERE category = ${category}
          ORDER BY created_at DESC
        `;
      } else {
        posts = await sql`
          SELECT * FROM posts
          ORDER BY created_at DESC
        `;
      }
    } else {
      if (category && category !== 'all') {
        posts = await sql`
          SELECT id, slug, title, excerpt, cover_image, category, author, read_time, created_at
          FROM posts
          WHERE published = true AND category = ${category}
          ORDER BY created_at DESC
        `;
      } else {
        posts = await sql`
          SELECT id, slug, title, excerpt, cover_image, category, author, read_time, created_at
          FROM posts
          WHERE published = true
          ORDER BY created_at DESC
        `;
      }
    }

    return NextResponse.json({ posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST create a new blog post (admin only)
export async function POST(req) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, excerpt, content, cover_image, category, author, read_time, published } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    let slug = body.slug ? slugify(body.slug) : slugify(title);
    if (!slug) slug = 'post-' + Date.now();

    // Check slug collision
    const existing = await sql`SELECT id FROM posts WHERE slug = ${slug} LIMIT 1`;
    if (existing.length > 0) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const inserted = await sql`
      INSERT INTO posts (
        slug, title, excerpt, content, cover_image, category, author, read_time, published
      ) VALUES (
        ${slug},
        ${title},
        ${excerpt || title.slice(0, 160)},
        ${content},
        ${cover_image || '/assets/images/taf-headquarters.webp'},
        ${category || 'General Civil Engineering'},
        ${author || session.name || 'Heniten Engineering Bureau'},
        ${read_time || '4 min read'},
        ${published !== false}
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, post: inserted[0] });
  } catch (err) {
    console.error('Error creating post:', err);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
