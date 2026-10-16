import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

// GET a single post
export async function GET(req, { params }) {
  const { id } = await params;
  try {
    const posts = await sql`
      SELECT * FROM posts
      WHERE id::text = ${id} OR slug = ${id}
      LIMIT 1
    `;
    if (!posts.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ post: posts[0] });
  } catch (err) {
    console.error('Error fetching post:', err);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PUT/PATCH update post (admin only)
export async function PUT(req, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { title, excerpt, content, cover_image, category, author, read_time, published } = body;

    const updated = await sql`
      UPDATE posts
      SET
        title = COALESCE(${title}, title),
        excerpt = COALESCE(${excerpt}, excerpt),
        content = COALESCE(${content}, content),
        cover_image = COALESCE(${cover_image}, cover_image),
        category = COALESCE(${category}, category),
        author = COALESCE(${author}, author),
        read_time = COALESCE(${read_time}, read_time),
        published = COALESCE(${published}, published),
        updated_at = NOW()
      WHERE id::text = ${id} OR slug = ${id}
      RETURNING *
    `;

    if (!updated.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post: updated[0] });
  } catch (err) {
    console.error('Error updating post:', err);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE post (admin only)
export async function DELETE(req, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    await sql`
      DELETE FROM posts
      WHERE id::text = ${id} OR slug = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting post:', err);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
