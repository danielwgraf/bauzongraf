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

interface PartyMember {
  id: string;
  first_name: string;
  last_name: string;
}

interface Party {
  id: string;
  last_name: string;
  created_at: string;
  party_members: PartyMember[];
}

interface PartyWithStatus extends Party {
  rsvps: RSVP[];
  hasResponded: boolean;
  allMembersResponded: boolean;
  attendingCount: number;
  totalMembers: number;
  email?: string;
  lastUpdated?: string;
}

function RSVPList() {
  const [parties, setParties] = useState<PartyWithStatus[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});
  const [historyData, setHistoryData] = useState<Record<string, HistoryEntry[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all parties and all RSVPs in parallel
        const [partiesRes, rsvpsRes] = await Promise.all([
          fetch('/api/parties'),
          fetch('/api/rsvps'),
        ]);

        const partiesResult = await partiesRes.json();
        const rsvpsResult = await rsvpsRes.json();

        if (partiesRes.ok && partiesResult.data) {
          const partiesData: Party[] = partiesResult.data;
          
          if (rsvpsRes.ok && rsvpsResult.data) {
            setRsvps(rsvpsResult.data || []);
          }

          // Match RSVPs to parties
          const partiesWithStatus: PartyWithStatus[] = partiesData.map((party) => {
            const partyRsvps = (rsvpsResult.data || []).filter(
              (rsvp: RSVP) => rsvp.party_id === party.id
            );

            const memberIds = new Set(party.party_members.map(m => m.id));
            const respondedMemberIds = new Set(partyRsvps.map((r: RSVP) => r.member_id));
            const attendingCount = partyRsvps.filter((r: RSVP) => r.is_attending).length;

            const hasResponded = partyRsvps.length > 0;
            const allMembersResponded = party.party_members.length > 0 && 
              party.party_members.every(m => respondedMemberIds.has(m.id));

            // Get the most recent update time
            const lastUpdated = partyRsvps.length > 0
              ? partyRsvps.reduce((latest: string | null, rsvp: RSVP) => {
                  if (!latest) return rsvp.updated_at || rsvp.created_at;
                  if (!rsvp.updated_at) return latest;
                  return new Date(rsvp.updated_at) > new Date(latest) 
                    ? rsvp.updated_at 
                    : latest;
                }, null)
              : undefined;

            return {
              ...party,
              rsvps: partyRsvps,
              hasResponded,
              allMembersResponded,
              attendingCount,
              totalMembers: party.party_members.length,
              email: partyRsvps[0]?.email,
              lastUpdated,
            };
          });

          setParties(partiesWithStatus);
        } else {
          console.error('Failed to fetch parties:', partiesResult.error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Calculate summary statistics
  const totalParties = parties.length;
  const respondedParties = parties.filter(p => p.hasResponded).length;
  const notRespondedParties = totalParties - respondedParties;
  const totalAttending = parties.reduce((sum, p) => sum + p.attendingCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-300">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">RSVP Dashboard</h2>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Total Invited:</span>{' '}
              <span className="text-gray-900">{totalParties} parties</span>
            </div>
            <div>
              <span className="font-semibold text-green-700">Responded:</span>{' '}
              <span className="text-green-900">{respondedParties}</span>
            </div>
            <div>
              <span className="font-semibold text-red-700">Not Responded:</span>{' '}
              <span className="text-red-900">{notRespondedParties}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-700">Total Attending:</span>{' '}
              <span className="text-blue-900">{totalAttending} people</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
        >
          Sign Out
        </button>
      </div>
      {parties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parties.map((party) => {
          const partyKey = party.id;
          const isHistoryExpanded = expandedHistory[partyKey] || false;
            
            const fetchHistory = async () => {
              if (historyData[partyKey]) return; // Already loaded
              
              try {
                const response = await fetch(`/api/rsvps/history?party_id=${party.id || ''}`);
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
            <div key={partyKey} className={`border-2 rounded-lg p-5 shadow-lg ${
              party.hasResponded 
                ? party.allMembersResponded 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-yellow-400 bg-yellow-50'
                : 'border-gray-300 bg-white'
            }`}>
              <div className="mb-4 pb-4 border-b-2 border-gray-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-2xl text-gray-900">
                        {party.last_name} Party
                      </p>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        party.hasResponded
                          ? party.allMembersResponded
                            ? 'bg-green-200 text-green-900'
                            : 'bg-yellow-200 text-yellow-900'
                          : 'bg-red-200 text-red-900'
                      }`}>
                        {party.hasResponded
                          ? party.allMembersResponded
                            ? '✓ Complete'
                            : '⚠ Partial'
                          : '✗ No Response'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                      <div>
                        <span className="font-semibold text-gray-700">Members:</span>{' '}
                        <span className="text-gray-900">
                          {party.party_members.map(m => `${m.first_name} ${m.last_name}`).join(', ')}
                        </span>
                      </div>
                      {party.hasResponded && (
                        <>
                          <div>
                            <span className="font-semibold text-gray-700">Attending:</span>{' '}
                            <span className="text-green-700 font-bold">{party.attendingCount} / {party.totalMembers}</span>
                          </div>
                          {party.email && (
                            <div>
                              <span className="font-semibold text-gray-700">Email:</span>{' '}
                              <span className="text-gray-900">{party.email}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-xs">
                      {party.lastUpdated && (
                        <p className="text-blue-700 font-semibold">
                          <span className="font-bold">Last Updated:</span> {new Date(party.lastUpdated).toLocaleString()}
                        </p>
                      )}
                      {!party.hasResponded && (
                        <p className="text-red-700 font-semibold">No RSVP submitted yet</p>
                      )}
                    </div>
                  </div>
                  {party.hasResponded && (
                    <button
                      onClick={toggleHistory}
                      className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline px-3 py-1 rounded bg-blue-50 border border-blue-200 ml-4"
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
              {party.hasResponded ? (
                <div className="space-y-4">
                  {party.party_members.map((member) => {
                    const memberRsvp = party.rsvps.find(r => r.member_id === member.id);
                    return (
                      <div key={member.id} className="pl-4 border-l-4 border-gray-400 bg-gray-50 p-3 rounded-r">
                        <p className="font-bold text-lg text-gray-900 mb-2">
                          {member.first_name} {member.last_name}
                        </p>
                        {memberRsvp ? (
                          <>
                            <p className={`text-base font-bold mb-2 ${memberRsvp.is_attending ? 'text-green-700' : 'text-red-700'}`}>
                              {memberRsvp.is_attending ? '✓ Attending' : '✗ Not Attending'}
                            </p>
                            {memberRsvp.dietary_restrictions && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-sm text-gray-900">
                                  <span className="font-bold">Dietary Restrictions:</span> {memberRsvp.dietary_restrictions}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-600 italic">No response submitted</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-600">
                  <p className="font-semibold">Awaiting RSVP</p>
                  <p className="text-sm mt-1">No response has been submitted for this party yet.</p>
                </div>
              )}
            </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-800 text-lg font-semibold mb-2">No parties found.</p>
          <p className="text-sm text-gray-700">
            Make sure you have imported your invite list into the database.
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