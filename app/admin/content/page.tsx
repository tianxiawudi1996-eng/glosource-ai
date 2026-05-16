'use client';

import { useState } from 'react';

interface PostMeta {
  id: string;
  slug: string;
  title: string;
  category: string;
  lang: string;
  publishedAt: string;
  readingTimeMin: number;
  published: boolean;
  createdAt: string;
}

export default function AdminContentPage() {
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  async function fetchPosts(secret: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/blog-posts', {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.status === 401) { setError('Invalid token'); setAuthed(false); return; }
      const data = await res.json() as { posts: PostMeta[] };
      setPosts(data.posts ?? []);
      setAuthed(true);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnpublish(slug: string) {
    setActionMsg('');
    const res = await fetch(`/api/admin/blog-posts?slug=${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setActionMsg(`Unpublished: ${slug}`);
      setPosts(prev => prev.map(p => p.slug === slug ? { ...p, published: false } : p));
    } else {
      setActionMsg(`Error unpublishing ${slug}`);
    }
  }

  async function handleRepublish(slug: string) {
    setActionMsg('');
    const post = posts.find(p => p.slug === slug);
    if (!post) return;
    const res = await fetch('/api/admin/blog-posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, published: true }),
    });
    if (res.ok) {
      setActionMsg(`Published: ${slug}`);
      setPosts(prev => prev.map(p => p.slug === slug ? { ...p, published: true } : p));
    } else {
      setActionMsg(`Error republishing ${slug}`);
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-gray-900 rounded-xl p-8 w-full max-w-sm border border-white/10">
          <h1 className="text-white text-xl font-bold mb-6">Admin — Blog Content</h1>
          <input
            type="password"
            placeholder="ADMIN_PUBLISH_SECRET"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-white text-sm mb-4 outline-none focus:border-blue-500"
            onKeyDown={e => e.key === 'Enter' && fetchPosts(token)}
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            onClick={() => fetchPosts(token)}
            disabled={loading || !token}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
          >
            {loading ? 'Loading…' : 'Sign in'}
          </button>
        </div>
      </main>
    );
  }

  const published = posts.filter(p => p.published);
  const drafts = posts.filter(p => !p.published);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Blog Content Dashboard</h1>
          <button
            onClick={() => fetchPosts(token)}
            className="text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
          >
            Refresh
          </button>
        </div>

        {actionMsg && (
          <div className="mb-4 bg-blue-900/40 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-300 text-sm">
            {actionMsg}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total</p>
            <p className="text-3xl font-bold text-white">{posts.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Published</p>
            <p className="text-3xl font-bold text-green-400">{published.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Drafts</p>
            <p className="text-3xl font-bold text-yellow-400">{drafts.length}</p>
          </div>
        </div>

        {posts.length === 0 && (
          <p className="text-gray-500 text-center py-12">No posts yet. Use the office publish script to add content.</p>
        )}

        {posts.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Lang</th>
                  <th className="text-left px-4 py-3">Published At</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <a
                        href={`/en/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-blue-400 transition-colors"
                      >
                        {post.title.length > 60 ? post.title.slice(0, 60) + '…' : post.title}
                      </a>
                      <p className="text-gray-500 text-xs mt-0.5">{post.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{post.category}</td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full uppercase">
                        {post.lang}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      {post.published ? (
                        <span className="bg-green-900/40 text-green-400 text-xs px-2 py-0.5 rounded-full">Live</span>
                      ) : (
                        <span className="bg-yellow-900/40 text-yellow-400 text-xs px-2 py-0.5 rounded-full">Draft</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {post.published ? (
                        <button
                          onClick={() => handleUnpublish(post.slug)}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 rounded px-2 py-1 transition-colors"
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRepublish(post.slug)}
                          className="text-xs text-green-400 hover:text-green-300 border border-green-500/20 rounded px-2 py-1 transition-colors"
                        >
                          Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
