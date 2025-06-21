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
      body: JSON.stringify({ name, email, is_attending: isAttending }),
      headers: { 'Content-Type': 'application/json' },
    });

    setName('');
    setEmail('');
    setIsAttending(false);
    await loadRSVPs();
    setLoading(false);
  };

  return (
    <>
    <section className="min-h-screen flex items-center relative">
        <div className="absolute inset-0 bg-[url('/images/castle.webp')] bg-contain bg-no-repeat bg-right z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10"></div>
        <div className="relative z-20 text-left max-w-4xl px-4 md:ml-16 md:max-w-[45%]">
            <p className="font-parochus text-3xl mb-2 text-secondary">Join us for our</p>
            <h1 className="font-parochus-original text-7xl md:text-8xl mb-6 text-white">Macy & Daniel</h1>
            <h1 className="font-parochus-original text-7xl md:text-8xl mb-6 text-white">Bauzon Graf</h1>
            <div className="w-32 h-[1px] bg-secondary mb-6"></div>
            <p className="font-cormorant text-2xl md:text-3xl mb-4 text-white">For our fairytale wedding in France</p>
            <p className="font-sans text-xl tracking-widest text-white">SEPTEMBER 15, 2026</p>
            <div className="mt-12">
                <a href="#rsvp" className="inline-block border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors duration-300 px-8 py-3 rounded-md font-sans text-xl">Save Your Seat</a>
            </div>
        </div>
    </section>

      <div
        className="relative flex h-screen items-center justify-center bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1465495976206-85757753841a?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative text-center">
          <h1 className="text-5xl font-bold">📖 Wedding Guestbook</h1>
          <p className="mt-4 text-xl">We're so glad you're here!</p>
        </div>
      </div>
      <main className="mx-auto max-w-xl px-4 py-10 text-center">
        <form onSubmit={handleSubmit} className="mb-10 space-y-4">
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
              <p className="mt-1">
                {rsvp.is_attending ? 'Attending' : 'Not Attending'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(rsvp.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}