'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DESSERT_OPTIONS, ENTREE_OPTIONS, MEAL_APPETIZER } from '../types';
import { registryFundLabel } from '../registry-funds';

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
  entree_choice?: string | null;
  dessert_choice?: string | null;
  /** Stored on the first member row per party when anyone is attending */
  accommodation?: string | null;
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
  accommodation?: string | null;
}

function entreeLabel(id?: string | null) {
  if (!id) return '—';
  const opt = ENTREE_OPTIONS.find((o) => o.id === id);
  return opt?.label ?? id;
}

function dessertLabel(id?: string | null) {
  if (!id) return '—';
  const opt = DESSERT_OPTIONS.find((o) => o.id === id);
  return opt?.label ?? id;
}

function accommodationLabel(v?: string | null) {
  if (v === 'chateau') return 'Château';
  if (v === 'elsewhere') return 'Elsewhere';
  return v ? v : '—';
}

type AdminView = 'guests' | 'summary' | 'registry';

interface RegistryIntentRow {
  id: string;
  created_at: string;
  fund: string;
  amount_usd: number;
  charged_amount_usd: number | null;
  cover_stripe_fees: boolean;
  note: string | null;
  payment_channel: string;
  venmo_recipient: string | null;
  stripe_checkout_session_id: string | null;
  status: string;
}

function formatRegistryMoney(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n));
}

function venmoRecipientLabel(id: string | null) {
  if (!id) return '—';
  if (id === 'macy') return 'Macy';
  if (id === 'daniel') return 'Daniel';
  return id;
}

function RegistryIntentsPanel() {
  const [rows, setRows] = useState<RegistryIntentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          if (!cancelled) {
            setError('Not signed in.');
            setLoading(false);
          }
          return;
        }
        const res = await fetch('/api/registry-intents', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = (await res.json()) as { data?: RegistryIntentRow[]; error?: string };
        if (!res.ok) {
          if (!cancelled) setError(json.error ?? 'Failed to load registry gifts.');
          return;
        }
        if (!cancelled) setRows(json.data ?? []);
      } catch {
        if (!cancelled) setError('Failed to load registry gifts.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-stone-800">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
        <p className="font-medium">Loading registry…</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-700 font-medium">
        {error}{' '}
        <span className="text-stone-600 font-normal text-sm">
          (Run <code className="bg-stone-200 px-1 rounded text-xs">sql/registry_intents.sql</code> in Supabase if the
          table is missing.)
        </span>
      </p>
    );
  }

  if (rows.length === 0) {
    return <p className="text-stone-700">No registry submissions yet.</p>;
  }

  return (
    <div className="border-2 border-stone-200 rounded-lg overflow-hidden bg-white">
      <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
        <h3 className="text-lg font-bold text-primary">Registry gifts</h3>
        <p className="text-xs text-stone-600 mt-1">
          Logged when guests start Stripe checkout or open Venmo with your form. Payment completion for Venmo is not
          tracked here.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Channel</th>
              <th className="px-3 py-2">Fund</th>
              <th className="px-3 py-2">Gift $</th>
              <th className="px-3 py-2">Charged $</th>
              <th className="px-3 py-2">Cover fees</th>
              <th className="px-3 py-2">Venmo</th>
              <th className="px-3 py-2">Stripe session</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 min-w-[12rem]">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-stone-100 hover:bg-stone-50/80 align-top">
                <td className="px-3 py-2 whitespace-nowrap text-stone-800">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-3 py-2 capitalize">{r.payment_channel}</td>
                <td className="px-3 py-2">{registryFundLabel(r.fund)}</td>
                <td className="px-3 py-2">{formatRegistryMoney(r.amount_usd)}</td>
                <td className="px-3 py-2">{formatRegistryMoney(r.charged_amount_usd)}</td>
                <td className="px-3 py-2">{r.cover_stripe_fees ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2">{venmoRecipientLabel(r.venmo_recipient)}</td>
                <td className="px-3 py-2 font-mono text-xs max-w-[8rem] truncate" title={r.stripe_checkout_session_id ?? ''}>
                  {r.stripe_checkout_session_id ?? '—'}
                </td>
                <td className="px-3 py-2 text-xs">{r.status}</td>
                <td className="px-3 py-2 text-stone-700 whitespace-pre-wrap break-words">{r.note?.trim() || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function incrementCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function SummaryPanel({ parties }: { parties: PartyWithStatus[] }) {
  const stats = useMemo(() => {
    let totalInvitedMembers = 0;
    let totalAttending = 0;
    let totalNotAttending = 0;
    let totalNoResponse = 0;
    const entreeCounts = new Map<string, number>();
    const dessertCounts = new Map<string, number>();
    let chateauParties = 0;
    let elsewhereParties = 0;
    let unknownAccommParties = 0;

    const attendingRows: {
      party: PartyWithStatus;
      member: PartyMember;
      rsvp: RSVP;
    }[] = [];

    for (const p of parties) {
      totalInvitedMembers += p.totalMembers;

      for (const m of p.party_members) {
        const rsvp = p.rsvps.find((r) => r.member_id === m.id);
        if (!rsvp) {
          totalNoResponse++;
          continue;
        }
        if (rsvp.is_attending) {
          totalAttending++;
          incrementCount(entreeCounts, rsvp.entree_choice?.trim() ? rsvp.entree_choice : '—');
          incrementCount(dessertCounts, rsvp.dessert_choice?.trim() ? rsvp.dessert_choice : '—');
          attendingRows.push({ party: p, member: m, rsvp });
        } else {
          totalNotAttending++;
        }
      }

      if (p.attendingCount > 0) {
        if (p.accommodation === 'chateau') chateauParties++;
        else if (p.accommodation === 'elsewhere') elsewhereParties++;
        else unknownAccommParties++;
      }
    }

    const entreeSorted = [...entreeCounts.entries()].sort((a, b) => b[1] - a[1]);
    const dessertSorted = [...dessertCounts.entries()].sort((a, b) => b[1] - a[1]);

    return {
      totalInvitedMembers,
      totalAttending,
      totalNotAttending,
      totalNoResponse,
      entreeSorted,
      dessertSorted,
      chateauParties,
      elsewhereParties,
      unknownAccommParties,
      attendingRows,
    };
  }, [parties]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border-2 border-stone-200 rounded-lg p-4 bg-white">
          <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Invited (people)</p>
          <p className="text-3xl font-bold text-primary mt-1">{stats.totalInvitedMembers}</p>
        </div>
        <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
          <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">Attending</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{stats.totalAttending}</p>
        </div>
        <div className="border-2 border-stone-200 rounded-lg p-4 bg-white">
          <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Not attending</p>
          <p className="text-3xl font-bold text-stone-800 mt-1">{stats.totalNotAttending}</p>
        </div>
        <div className="border-2 border-amber-200 rounded-lg p-4 bg-amber-50">
          <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">No response yet</p>
          <p className="text-3xl font-bold text-amber-950 mt-1">{stats.totalNoResponse}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border-2 border-stone-200 rounded-lg p-5 bg-white">
          <h3 className="text-lg font-bold text-primary mb-3">Entrées (attending)</h3>
          <p className="text-xs text-stone-600 mb-3">Appetizer for everyone: {MEAL_APPETIZER}</p>
          {stats.entreeSorted.length === 0 ? (
            <p className="text-sm text-stone-600">No entrée selections yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.entreeSorted.map(([id, count]) => (
                <li key={id} className="flex justify-between gap-4 text-sm border-b border-stone-100 pb-2">
                  <span className="text-stone-800 flex-1">{entreeLabel(id === '—' ? null : id)}</span>
                  <span className="font-bold text-primary shrink-0">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-2 border-stone-200 rounded-lg p-5 bg-white">
          <h3 className="text-lg font-bold text-primary mb-3">Desserts (attending)</h3>
          {stats.dessertSorted.length === 0 ? (
            <p className="text-sm text-stone-600">No dessert selections yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.dessertSorted.map(([id, count]) => (
                <li key={id} className="flex justify-between gap-4 text-sm border-b border-stone-100 pb-2">
                  <span className="text-stone-800 flex-1">{dessertLabel(id === '—' ? null : id)}</span>
                  <span className="font-bold text-primary shrink-0">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border-2 border-stone-200 rounded-lg p-5 bg-white">
        <h3 className="text-lg font-bold text-primary mb-3">Accommodation (parties with ≥1 attending)</h3>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="font-semibold text-stone-700">Château:</span>{' '}
            <span className="text-green-800 font-bold">{stats.chateauParties}</span>
          </div>
          <div>
            <span className="font-semibold text-stone-700">Elsewhere:</span>{' '}
            <span className="text-blue-800 font-bold">{stats.elsewhereParties}</span>
          </div>
          <div>
            <span className="font-semibold text-stone-700">Not set / N/A:</span>{' '}
            <span className="text-amber-800 font-bold">{stats.unknownAccommParties}</span>
          </div>
        </div>
      </div>

      <div className="border-2 border-stone-200 rounded-lg overflow-hidden bg-white">
        <div className="px-5 py-4 border-b-2 border-stone-200 bg-stone-50">
          <h3 className="text-lg font-bold text-primary">Attending guest roster &amp; meals</h3>
          <p className="text-xs text-stone-600 mt-1">All guests who RSVP&apos;d yes, with meal choices.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
              <tr>
                <th className="px-4 py-3">Party</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Entrée</th>
                <th className="px-4 py-3">Dessert</th>
                <th className="px-4 py-3">Dietary</th>
                <th className="px-4 py-3">Accommodation</th>
              </tr>
            </thead>
            <tbody>
              {stats.attendingRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-stone-600 text-center">
                    No attending guests yet.
                  </td>
                </tr>
              ) : (
                stats.attendingRows.map(({ party, member, rsvp }) => (
                  <tr key={`${party.id}-${member.id}`} className="border-b border-stone-100 hover:bg-stone-50/80">
                    <td className="px-4 py-3 font-medium text-primary">{party.last_name}</td>
                    <td className="px-4 py-3">
                      {member.first_name} {member.last_name}
                    </td>
                    <td className="px-4 py-3 text-stone-800 max-w-xs">{entreeLabel(rsvp.entree_choice)}</td>
                    <td className="px-4 py-3 text-stone-800 max-w-xs">{dessertLabel(rsvp.dessert_choice)}</td>
                    <td className="px-4 py-3 text-stone-700">{rsvp.dietary_restrictions?.trim() || '—'}</td>
                    <td className="px-4 py-3 text-stone-700">{accommodationLabel(party.accommodation)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RSVPList() {
  const [parties, setParties] = useState<PartyWithStatus[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminView, setAdminView] = useState<AdminView>('guests');
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

            const accommodation =
              partyRsvps.find((r: RSVP) => r.accommodation != null && r.accommodation !== '')?.accommodation ?? null;

            return {
              ...party,
              rsvps: partyRsvps,
              hasResponded,
              allMembersResponded,
              attendingCount,
              totalMembers: party.party_members.length,
              email: partyRsvps[0]?.email,
              lastUpdated,
              accommodation,
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
      <div className="text-center py-10 text-stone-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="font-medium">Loading RSVPs...</p>
      </div>
    );
  }

  // Calculate summary statistics
  const totalParties = parties.length;
  const respondedParties = parties.filter(p => p.hasResponded).length;
  const notRespondedParties = totalParties - respondedParties;
  const totalAttending = parties.reduce((sum, p) => sum + p.attendingCount, 0);

  return (
    <div className="space-y-6 text-stone-800">
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-stone-200">
        <div>
          <h2 className="text-4xl font-bold text-primary mb-2">RSVP Dashboard</h2>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-semibold text-stone-700">Total Invited:</span>{' '}
              <span className="text-stone-900">{totalParties} parties</span>
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

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setAdminView('guests')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            adminView === 'guests'
              ? 'bg-primary text-white'
              : 'bg-white text-stone-800 border-2 border-stone-200 hover:border-primary/40'
          }`}
        >
          By party
        </button>
        <button
          type="button"
          onClick={() => setAdminView('summary')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            adminView === 'summary'
              ? 'bg-primary text-white'
              : 'bg-white text-stone-800 border-2 border-stone-200 hover:border-primary/40'
          }`}
        >
          Summary
        </button>
        <button
          type="button"
          onClick={() => setAdminView('registry')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            adminView === 'registry'
              ? 'bg-primary text-white'
              : 'bg-white text-stone-800 border-2 border-stone-200 hover:border-primary/40'
          }`}
        >
          Registry
        </button>
      </div>

      {adminView === 'registry' ? <RegistryIntentsPanel /> : null}

      {adminView === 'summary' && parties.length > 0 ? <SummaryPanel parties={parties} /> : null}
      {adminView === 'summary' && parties.length === 0 ? (
        <p className="text-stone-700">No party data to summarize.</p>
      ) : null}

      {parties.length > 0 && adminView === 'guests' ? (
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
            <div key={partyKey} className={`border-2 rounded-lg p-5 shadow-sm ${
              party.hasResponded 
                ? party.allMembersResponded 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-amber-400 bg-amber-50'
                : 'border-stone-200 bg-white'
            }`}>
              <div className="mb-4 pb-4 border-b-2 border-stone-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-2xl text-primary">
                        {party.last_name} Party
                      </p>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        party.hasResponded
                          ? party.allMembersResponded
                            ? 'bg-green-200 text-green-900'
                            : 'bg-amber-200 text-amber-900'
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
                        <span className="font-semibold text-stone-700">Members:</span>{' '}
                        <span className="text-stone-900">
                          {party.party_members.map(m => `${m.first_name} ${m.last_name}`).join(', ')}
                        </span>
                      </div>
                      {party.hasResponded && (
                        <>
                          <div>
                            <span className="font-semibold text-stone-700">Attending:</span>{' '}
                            <span className="text-green-700 font-bold">{party.attendingCount} / {party.totalMembers}</span>
                          </div>
                          {party.email && (
                            <div>
                              <span className="font-semibold text-stone-700">Email:</span>{' '}
                              <span className="text-stone-900">{party.email}</span>
                            </div>
                          )}
                          {party.attendingCount > 0 && (
                            <div>
                              <span className="font-semibold text-stone-700">Accommodation:</span>{' '}
                              <span className="text-stone-900">{accommodationLabel(party.accommodation)}</span>
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
                      className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline px-3 py-1 rounded bg-stone-100 border border-stone-200 ml-4"
                    >
                      {isHistoryExpanded ? 'Hide' : 'View'} History
                    </button>
                  )}
                </div>
              </div>
              {isHistoryExpanded && historyData[partyKey] && (
                <div className="mb-4 p-4 bg-stone-50 rounded-lg border-2 border-stone-200">
                  <h4 className="font-bold text-base mb-3 text-primary">Change History</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {historyData[partyKey].length > 0 ? (
                      historyData[partyKey].map((entry) => (
                        <div key={entry.id} className="text-sm border-l-4 border-primary/50 pl-3 py-2 bg-white rounded-r">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-primary mb-1">{entry.member_name}</p>
                              <p className="text-stone-800 text-xs mb-1">
                                <span className="font-semibold">{entry.action === 'created' ? 'Created' : 'Updated'}</span> on{' '}
                                {new Date(entry.changed_at).toLocaleString()}
                              </p>
                              {entry.previous_values && (
                                <div className="mt-2 text-xs text-stone-700 bg-stone-100 p-2 rounded">
                                  <p className="font-semibold">Previous:</p>
                                  <p>• {entry.previous_values.is_attending ? 'Attending' : 'Not Attending'}</p>
                                  {entry.previous_values.dietary_restrictions && (
                                    <p>• Dietary: {entry.previous_values.dietary_restrictions}</p>
                                  )}
                                  {entry.previous_values.entree_choice != null && entry.previous_values.entree_choice !== '' && (
                                    <p>• Entrée: {entreeLabel(entry.previous_values.entree_choice)}</p>
                                  )}
                                  {entry.previous_values.dessert_choice != null && entry.previous_values.dessert_choice !== '' && (
                                    <p>• Dessert: {dessertLabel(entry.previous_values.dessert_choice)}</p>
                                  )}
                                  {entry.previous_values.accommodation != null && entry.previous_values.accommodation !== '' && (
                                    <p>• Accommodation: {accommodationLabel(entry.previous_values.accommodation)}</p>
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
                      <p className="text-sm text-stone-700 font-medium">No history available</p>
                    )}
                  </div>
                </div>
              )}
              {party.hasResponded ? (
                <div className="space-y-4">
                  {party.party_members.map((member) => {
                    const memberRsvp = party.rsvps.find(r => r.member_id === member.id);
                    return (
                      <div key={member.id} className="pl-4 border-l-4 border-stone-300 bg-stone-50 p-3 rounded-r">
                        <p className="font-bold text-lg text-primary mb-2">
                          {member.first_name} {member.last_name}
                        </p>
                        {memberRsvp ? (
                          <>
                            <p className={`text-base font-bold mb-2 ${memberRsvp.is_attending ? 'text-green-700' : 'text-red-700'}`}>
                              {memberRsvp.is_attending ? '✓ Attending' : '✗ Not Attending'}
                            </p>
                            {memberRsvp.dietary_restrictions && (
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                                <p className="text-sm text-stone-900">
                                  <span className="font-bold">Dietary Restrictions:</span> {memberRsvp.dietary_restrictions}
                                </p>
                              </div>
                            )}
                            {memberRsvp.is_attending && (
                              <div className="mt-3 p-3 bg-white border border-stone-200 rounded-lg space-y-2">
                                <p className="text-sm text-stone-900">
                                  <span className="font-bold">Appetizer:</span> {MEAL_APPETIZER}
                                </p>
                                <p className="text-sm text-stone-900">
                                  <span className="font-bold">Entrée:</span> {entreeLabel(memberRsvp.entree_choice)}
                                </p>
                                <p className="text-sm text-stone-900">
                                  <span className="font-bold">Dessert:</span> {dessertLabel(memberRsvp.dessert_choice)}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-stone-600 italic">No response submitted</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-stone-700">
                  <p className="font-semibold">Awaiting RSVP</p>
                  <p className="text-sm mt-1">No response has been submitted for this party yet.</p>
                </div>
              )}
            </div>
            );
          })}
        </div>
      ) : adminView === 'guests' ? (
        <div className="text-center py-10">
          <p className="text-stone-800 text-lg font-semibold mb-2">No parties found.</p>
          <p className="text-sm text-stone-700">
            Make sure you have imported your invite list into the database.
          </p>
        </div>
      ) : null}
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
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="text-center text-stone-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen bg-stone-50 container mx-auto px-4 py-10">
        <RSVPList />
      </main>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm border border-stone-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">Admin Login</h1>
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-800 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-stone-300 rounded p-2 bg-white text-stone-900"
              required
            />
          </div>
          {message && (
            <p className={`text-sm mb-4 font-medium ${message.includes('Error') ? 'text-red-600' : 'text-green-700'}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 font-sans"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
        <p className="text-xs text-stone-600 mt-4 text-center">
          Enter your email to receive a secure login link
        </p>
      </div>
    </div>
  );
} 