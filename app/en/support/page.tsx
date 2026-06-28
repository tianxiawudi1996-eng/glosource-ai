'use client';

import { useState } from 'react';

export default function SupportPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-16 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Contact Support</h1>
        <p className="text-slate-500 text-sm mb-8">
          We typically respond within a few hours. For billing issues, please include your account email.
        </p>

        {status === 'sent' ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <p className="text-emerald-700 font-semibold text-lg mb-1">Message received!</p>
            <p className="text-emerald-600 text-sm">
              Check your inbox — our AI assistant sent an initial reply. A human reviews billing and complex issues within 1 business day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                required
                rows={6}
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>
            {status === 'error' && (
              <p className="text-red-500 text-sm">Something went wrong. Please email support@glosourceai.com directly.</p>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-[#EA580C] text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          Or email directly:{' '}
          <a href="mailto:support@glosourceai.com" className="text-[#EA580C] hover:underline">
            support@glosourceai.com
          </a>
        </p>
      </div>
    </main>
  );
}
