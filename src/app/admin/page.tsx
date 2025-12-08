'use client';

import { useState, useEffect, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RSVP {
  id: string;
  party_id?: string | null;
  last_name?: string | null;
  member_id?: string | null;
  member_name?: string | null;
  email: string;
  is_attending: boolean;
  dietary_restrictions?: string | null;
  created_at: string;
  // Legacy fields
  name?: string;
}

function RSVPList() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRsvps = async () => {
      try {
        const res = await fetch('/api/rsvps');
        const result = await res.json();
        console.log('RSVP fetch response:', result);
        
        if (res.ok) {
          if (result.error) {
            console.error('API returned error:', result.error);
            setRsvps([]);
          } else {
            console.log('Setting RSVPs:', result.data);
            setRsvps(result.data || []);
          }
        } else {
          console.error('Failed to fetch RSVPs:', result.error || 'Unknown error');
          setRsvps([]);
        }
      } catch (error) {
        console.error('Error fetching RSVPs:', error);
        setRsvps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRsvps();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p>Loading RSVPs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Guestbook Entries</h2>
        <button
          onClick={handleSignOut}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
      {rsvps.length > 0 ? (
        (() => {
          // Group RSVPs by party (new format) or show individually (old format)
          const parties = rsvps.reduce((acc, rsvp) => {
            // Check if this is the new format with party_id
            if (rsvp.party_id || rsvp.last_name) {
              const key = rsvp.party_id || rsvp.last_name || 'unknown';
              if (!acc[key]) {
                acc[key] = {
                  partyId: rsvp.party_id || null,
                  lastName: rsvp.last_name || 'Unknown',
                  email: rsvp.email,
                  members: [],
                  created_at: rsvp.created_at,
                };
              }
              acc[key].members.push(rsvp);
            } else {
              // Old format - treat as individual RSVP
              const key = `individual-${rsvp.id}`;
              acc[key] = {
                partyId: null,
                lastName: (rsvp as any).name?.split(' ').pop() || 'Individual',
                email: rsvp.email,
                members: [rsvp],
                created_at: rsvp.created_at,
              };
            }
            return acc;
          }, {} as Record<string, { partyId: string | null; lastName: string; email: string; members: RSVP[]; created_at: string }>);

          return Object.values(parties).map((party, idx) => (
            <div key={party.partyId || `party-${idx}`} className="border rounded-lg p-4 shadow-md bg-white">
              <div className="mb-3 pb-3 border-b">
                <p className="font-bold text-xl">
                  {party.lastName} {party.partyId ? 'Party' : ''}
                </p>
                <p className="text-gray-600 text-sm">{party.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(party.created_at).toLocaleString()}
                </p>
              </div>
              <div className="space-y-3">
                {party.members.map((member) => (
                  <div key={member.member_id || member.id} className="pl-4 border-l-2 border-gray-200">
                    <p className="font-semibold">
                      {member.member_name || (member as any).name || 'Unknown'}
                    </p>
                    <p className={`text-sm font-medium ${member.is_attending ? 'text-green-600' : 'text-red-600'}`}>
                      {member.is_attending ? '✓ Attending' : '✗ Not Attending'}
                    </p>
                    {member.dietary_restrictions && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Dietary Restrictions:</span> {member.dietary_restrictions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ));
        })()
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-2">No RSVPs yet.</p>
          <p className="text-sm text-gray-400">
            Check the browser console for debugging information.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'An error occurred. Please try again.');
      } else {
        setMessage('Check your email for the magic link!');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking auth state
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <main className="container mx-auto px-4 py-10">
        <RSVPList />
      </main>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
          </div>
          {message && (
            <p className={`text-sm mb-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Enter your email to receive a secure login link
        </p>
      </div>
    </div>
  );
} 