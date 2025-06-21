'use client';

import { useEffect, useState } from 'react';

type RSVP = {
  id: string;
  name: string;
  email: string;
  is_attending: boolean;
  created_at: string;
};

export default function Home() {
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAttending, setIsAttending] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadRSVPs = async () => {
    const res = await fetch('/api/rsvps');
    const { data } = await res.json();
    setRSVPs(data || []);
  };

  useEffect(() => {
    loadRSVPs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch('/api/rsvps', {
      method: 'POST',
      body: JSON.stringify({ name, email, isAttending }),
      headers: { 'Content-Type': 'application/json' },
    });

    setName('');
    setEmail('');
    setIsAttending(false);
    await loadRSVPs();
    setLoading(false);
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-10 text-center">
      <h1 className="text-3xl font-bold mb-6">📖 Wedding Guestbook</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
        <textarea
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
        <input
          type="checkbox"
          checked={isAttending}
          onChange={(e) => setIsAttending(e.target.checked)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Sign Guestbook'}
        </button>
      </form>

      <div className="text-left space-y-4">
        {rsvps.map((rsvp) => (
          <div key={rsvp.id} className="border rounded p-4">
            <p className="text-sm text-gray-600">
              <strong>{rsvp.name}</strong> wrote:
            </p>
            <p className="mt-1">{rsvp.email}</p>
            <p className="mt-1">{rsvp.is_attending ? 'Attending' : 'Not Attending'}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(rsvp.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}