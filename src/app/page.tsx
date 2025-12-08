'use client';

import { useState } from 'react';

interface PartyMember {
  id: string;
  firstName: string;
  lastName: string;
}

interface InviteParty {
  id: string;
  lastName: string;
  members: PartyMember[];
}

interface MemberRSVP {
  memberId: string;
  isAttending: boolean;
  dietaryRestrictions: string;
}

export default function Home() {
  const [lastName, setLastName] = useState('');
  const [party, setParty] = useState<InviteParty | null>(null);
  const [matchingParties, setMatchingParties] = useState<InviteParty[]>([]);
  const [memberRsvps, setMemberRsvps] = useState<Record<string, MemberRSVP>>({});
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const handleLastNameLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'No matching invite found. Please check your last name and try again.');
      } else {
        // Check if multiple parties matched
        if (data.multiple && data.parties) {
          setMatchingParties(data.parties);
          setParty(null); // Don't set party yet, user needs to select
        } else {
          // Single party match
          setMatchingParties([]);
          setParty(data.party);
          loadPartyData(data.party);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPartyData = async (selectedParty: InviteParty) => {
    // Check for existing RSVPs for this party
    const rsvpCheckResponse = await fetch('/api/rsvps');
    if (rsvpCheckResponse.ok) {
      const { data: rsvpData } = await rsvpCheckResponse.json();
      const existingRsvps = rsvpData?.filter(
        (r: any) => r.party_id === selectedParty.id
      ) || [];
      
      const hasExisting = existingRsvps.length > 0;
      setIsUpdate(hasExisting);
      
      // Initialize RSVP state for each member, pre-populating if exists
      const initialRsvps: Record<string, MemberRSVP> = {};
      selectedParty.members.forEach((member: PartyMember) => {
        const existingRsvp = existingRsvps.find((r: any) => r.member_id === member.id);
        initialRsvps[member.id] = {
          memberId: member.id,
          isAttending: existingRsvp?.is_attending || false,
          dietaryRestrictions: existingRsvp?.dietary_restrictions || '',
        };
      });
      setMemberRsvps(initialRsvps);
      
      // Pre-populate email if exists
      if (hasExisting && existingRsvps[0]?.email) {
        setEmail(existingRsvps[0].email);
      }
    } else {
      // If we can't check, just initialize empty
      const initialRsvps: Record<string, MemberRSVP> = {};
      selectedParty.members.forEach((member: PartyMember) => {
        initialRsvps[member.id] = {
          memberId: member.id,
          isAttending: false,
          dietaryRestrictions: '',
        };
      });
      setMemberRsvps(initialRsvps);
    }
  };

  const handlePartySelection = (selectedParty: InviteParty) => {
    setParty(selectedParty);
    setMatchingParties([]);
    loadPartyData(selectedParty);
  };

  const handleMemberRsvpChange = (memberId: string, field: keyof MemberRSVP, value: boolean | string) => {
    setMemberRsvps((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Create member names mapping
    const memberNames: Record<string, string> = {};
    party?.members.forEach((member) => {
      memberNames[member.id] = `${member.firstName} ${member.lastName}`;
    });

    try {
      const response = await fetch('/api/rsvps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partyId: party?.id,
          lastName: party?.lastName,
          email,
          memberRsvps: Object.values(memberRsvps),
          memberNames,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit RSVP. Please try again.');
      } else {
        setIsUpdate(data.isUpdate || false);
        setSubmitted(true);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLastName('');
    setParty(null);
    setMatchingParties([]);
    setMemberRsvps({});
    setEmail('');
    setError('');
    setSubmitted(false);
    setIsUpdate(false);
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
      <main id="rsvp" className="mx-auto max-w-2xl px-4 py-10">
        {submitted ? (
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
            <p className="text-lg">
              Your RSVP has been {isUpdate ? 'updated' : 'submitted'} successfully.
            </p>
            <button
              onClick={handleReset}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              {isUpdate ? 'Update Again' : 'Submit Another RSVP'}
            </button>
          </div>
        ) : matchingParties.length > 0 ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Multiple Parties Found</h2>
              <p className="text-lg text-gray-700 mb-6">
                We found {matchingParties.length} {matchingParties.length === 1 ? 'party' : 'parties'} with the last name "{lastName}". 
                Please select which party you belong to:
              </p>
            </div>
            <div className="space-y-4">
              {matchingParties.map((matchingParty) => (
                <button
                  key={matchingParty.id}
                  onClick={() => handlePartySelection(matchingParty)}
                  className="w-full text-left border-2 border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-semibold text-lg text-gray-900 mb-2">
                    {matchingParty.lastName} Party
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="mb-1">
                      <span className="font-medium">Members:</span>{' '}
                      {matchingParty.members.map(m => `${m.firstName} ${m.lastName}`).join(', ')}
                    </p>
                    <p className="text-gray-600">
                      {matchingParty.members.length} {matchingParty.members.length === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={handleReset}
              className="w-full text-center text-gray-600 hover:text-gray-800 underline"
            >
              Try a different last name
            </button>
          </div>
        ) : !party ? (
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold mb-6">RSVP</h2>
            <p className="text-lg mb-6">Please enter your last name to find your invitation.</p>
            <form onSubmit={handleLastNameLookup} className="space-y-4">
              <input
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full border rounded p-3 text-lg"
              />
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors disabled:opacity-50 w-full"
              >
                {loading ? 'Looking up...' : 'Find My Invitation'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">RSVP for {party.lastName} Party</h2>
              {isUpdate ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-800 font-medium">
                    You have an existing RSVP. Update your responses below.
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">Please respond for each person in your party</p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Contact Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border rounded p-3"
                />
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Party Members</h3>
                {party.members.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 space-y-4">
                    <h4 className="text-lg font-medium">
                      {member.firstName} {member.lastName}
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={memberRsvps[member.id]?.isAttending || false}
                          onChange={(e) =>
                            handleMemberRsvpChange(member.id, 'isAttending', e.target.checked)
                          }
                          className="w-5 h-5"
                        />
                        <span>Will be attending</span>
                      </label>
                      {memberRsvps[member.id]?.isAttending && (
                        <div>
                          <label htmlFor={`dietary-${member.id}`} className="block text-sm font-medium mb-2">
                            Dietary Restrictions (optional)
                          </label>
                          <textarea
                            id={`dietary-${member.id}`}
                            placeholder="e.g., Vegetarian, Gluten-free, Allergies..."
                            value={memberRsvps[member.id]?.dietaryRestrictions || ''}
                            onChange={(e) =>
                              handleMemberRsvpChange(member.id, 'dietaryRestrictions', e.target.value)
                            }
                            className="w-full border rounded p-2"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-50 transition-colors"
                >
                  Start Over
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? (isUpdate ? 'Updating...' : 'Submitting...') : (isUpdate ? 'Update RSVP' : 'Submit RSVP')}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </>
  );
}