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
  updated_at?: string | null;
  // Legacy fields
  name?: string;
}

interface HistoryEntry {
  id: string;
  rsvp_id: string;
  party_id: string;
  member_id: string;
  member_name: string;
  is_attending: boolean;
  dietary_restrictions: string | null;
  action: string;
  changed_at: string;
  previous_values: any;
}

function RSVPList() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});
  const [historyData, setHistoryData] = useState<Record<string, HistoryEntry[]>>({});

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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-300">
        <h2 className="text-4xl font-bold text-gray-900">Guestbook Entries</h2>
        <button
          onClick={handleSignOut}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
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
                  updated_at: rsvp.updated_at || null,
                };
              }
              acc[key].members.push(rsvp);
              // Track the most recent updated_at across all members
              if (rsvp.updated_at && (!acc[key].updated_at || new Date(rsvp.updated_at) > new Date(acc[key].updated_at))) {
                acc[key].updated_at = rsvp.updated_at;
              }
            } else {
              // Old format - treat as individual RSVP
              const key = `individual-${rsvp.id}`;
              acc[key] = {
                partyId: null,
                lastName: (rsvp as any).name?.split(' ').pop() || 'Individual',
                email: rsvp.email,
                members: [rsvp],
                created_at: rsvp.created_at,
                updated_at: rsvp.updated_at || null,
              };
            }
            return acc;
          }, {} as Record<string, { partyId: string | null; lastName: string; email: string; members: RSVP[]; created_at: string; updated_at: string | null }>);

          return Object.values(parties).map((party, idx) => {
            const partyKey = party.partyId || `party-${idx}`;
            const isHistoryExpanded = expandedHistory[partyKey] || false;
            
            const fetchHistory = async () => {
              if (historyData[partyKey]) return; // Already loaded
              
              try {
                const response = await fetch(`/api/rsvps/history?party_id=${party.partyId || ''}`);
                const result = await response.json();
                if (result.data) {
                  setHistoryData(prev => ({
                    ...prev,
                    [partyKey]: result.data,
                  }));
                }
              } catch (error) {
                console.error('Error fetching history:', error);
              }
            };

            const toggleHistory = () => {
              if (!isHistoryExpanded) {
                fetchHistory();
              }
              setExpandedHistory(prev => ({
                ...prev,
                [partyKey]: !prev[partyKey],
              }));
            };

            return (
            <div key={partyKey} className="border-2 border-gray-300 rounded-lg p-5 shadow-lg bg-white">
              <div className="mb-4 pb-4 border-b-2 border-gray-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-2xl text-gray-900 mb-1">
                      {party.lastName} {party.partyId ? 'Party' : ''}
                    </p>
                    <p className="text-gray-800 text-base font-medium mb-2">{party.email}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Created:</span> {new Date(party.created_at).toLocaleString()}
                      </p>
                      {party.updated_at && (
                        <p className="text-sm text-blue-700 font-semibold">
                          <span className="font-bold">Updated:</span> {new Date(party.updated_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {party.partyId && (
                    <button
                      onClick={toggleHistory}
                      className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline px-3 py-1 rounded bg-blue-50 border border-blue-200"
                    >
                      {isHistoryExpanded ? 'Hide' : 'View'} History
                    </button>
                  )}
                </div>
              </div>
              {isHistoryExpanded && historyData[partyKey] && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-base mb-3 text-gray-900">Change History</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {historyData[partyKey].length > 0 ? (
                      historyData[partyKey].map((entry) => (
                        <div key={entry.id} className="text-sm border-l-4 border-blue-400 pl-3 py-2 bg-white rounded-r">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-900 mb-1">{entry.member_name}</p>
                              <p className="text-gray-800 text-xs mb-1">
                                <span className="font-semibold">{entry.action === 'created' ? 'Created' : 'Updated'}</span> on{' '}
                                {new Date(entry.changed_at).toLocaleString()}
                              </p>
                              {entry.previous_values && (
                                <div className="mt-2 text-xs text-gray-700 bg-gray-100 p-2 rounded">
                                  <p className="font-semibold">Previous:</p>
                                  <p>• {entry.previous_values.is_attending ? 'Attending' : 'Not Attending'}</p>
                                  {entry.previous_values.dietary_restrictions && (
                                    <p>• Dietary: {entry.previous_values.dietary_restrictions}</p>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded ${
                              entry.is_attending ? 'bg-green-200 text-green-900 border border-green-400' : 'bg-red-200 text-red-900 border border-red-400'
                            }`}>
                              {entry.is_attending ? 'Attending' : 'Not Attending'}
                            </span>
                          </div>
          </div>
        ))
                    ) : (
                      <p className="text-sm text-gray-700 font-medium">No history available</p>
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {party.members.map((member) => (
                  <div key={member.member_id || member.id} className="pl-4 border-l-4 border-gray-400 bg-gray-50 p-3 rounded-r">
                    <p className="font-bold text-lg text-gray-900 mb-2">
                      {member.member_name || (member as any).name || 'Unknown'}
                    </p>
                    <p className={`text-base font-bold mb-2 ${member.is_attending ? 'text-green-700' : 'text-red-700'}`}>
                      {member.is_attending ? '✓ Attending' : '✗ Not Attending'}
                    </p>
                    {member.dietary_restrictions && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-gray-900">
                          <span className="font-bold">Dietary Restrictions:</span> {member.dietary_restrictions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            );
          });
        })()
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-800 text-lg font-semibold mb-2">No RSVPs yet.</p>
          <p className="text-sm text-gray-700">
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