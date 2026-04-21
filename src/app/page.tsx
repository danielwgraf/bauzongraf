'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { InviteParty, MemberRSVP, TabId } from './types';
import { TABS } from './types';
import {
  LandingTab,
  VenueTab,
  ScheduleTab,
  ThingsToDoTab,
  TravelTab,
  RegistryTab,
  RsvpTab,
  FAQTab,
} from './components/tabs';
import { NavBar } from './components/nav';

const TAB_LABELS: Record<TabId, string> = {
  faq: 'FAQ',
  landing: 'Home',
  venue: 'Venue',
  schedule: 'Schedule',
  'things-to-do': 'Things to Do',
  travel: 'Travel',
  registry: 'Registry',
  rsvp: 'RSVP',
};

function HomeContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>('landing');
  const [lastName, setLastName] = useState('');
  const [party, setParty] = useState<InviteParty | null>(null);
  const [matchingParties, setMatchingParties] = useState<InviteParty[]>([]);
  const [memberRsvps, setMemberRsvps] = useState<Record<string, MemberRSVP>>({});
  const [email, setEmail] = useState('');
  const [accommodation, setAccommodation] = useState<'' | 'chateau' | 'elsewhere'>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  /** Mobile landing: after user finishes the step flow once, skip to summary when returning Home (session state, no localStorage) */
  const [landingMobileIntroComplete, setLandingMobileIntroComplete] = useState(false);

  const markLandingMobileIntroComplete = useCallback(() => {
    setLandingMobileIntroComplete(true);
  }, []);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TABS.includes(t as TabId)) setActiveTab(t as TabId);
  }, [searchParams]);

  const goToTab = (tab: TabId) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.pathname + url.search);
  };

  const loadPartyData = async (selectedParty: InviteParty) => {
    const rsvpCheckResponse = await fetch('/api/rsvps');
    if (rsvpCheckResponse.ok) {
      const { data: rsvpData } = await rsvpCheckResponse.json();
      const existingRsvps = rsvpData?.filter(
        (r: { party_id: string }) => r.party_id === selectedParty.id
      ) || [];

      const hasExisting = existingRsvps.length > 0;
      setIsUpdate(hasExisting);

      const initialRsvps: Record<string, MemberRSVP> = {};
      selectedParty.members.forEach((member) => {
        const existingRsvp = existingRsvps.find((r: { member_id: string }) => r.member_id === member.id);
        const existing = existingRsvp as { entree_choice?: string; dessert_choice?: string } | undefined;
        initialRsvps[member.id] = {
          memberId: member.id,
          isAttending: existingRsvp?.is_attending || false,
          dietaryRestrictions: existingRsvp?.dietary_restrictions || '',
          entreeChoice: existing?.entree_choice ?? '',
          dessertChoice: existing?.dessert_choice ?? '',
        };
      });
      setMemberRsvps(initialRsvps);

      if (hasExisting && existingRsvps[0]) {
        const first = existingRsvps[0] as { email?: string; accommodation?: string };
        if (first.email) setEmail(first.email);
        if (first.accommodation === 'chateau' || first.accommodation === 'elsewhere') setAccommodation(first.accommodation);
      }
    } else {
      const initialRsvps: Record<string, MemberRSVP> = {};
      selectedParty.members.forEach((member) => {
        initialRsvps[member.id] = {
          memberId: member.id,
          isAttending: false,
          dietaryRestrictions: '',
          entreeChoice: '',
          dessertChoice: '',
        };
      });
      setMemberRsvps(initialRsvps);
    }
  };

  const handleLastNameLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'No matching invite found. Please check your last name and try again.');
      } else {
        if (data.multiple && data.parties) {
          setMatchingParties(data.parties);
          setParty(null);
        } else {
          setMatchingParties([]);
          setParty(data.party);
          loadPartyData(data.party);
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
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
    if (!party) return;
    const attendingMembers = party.members.filter((m) => memberRsvps[m.id]?.isAttending);
    if (attendingMembers.length > 0 && !accommodation) {
      setError('Please select your accommodation preference.');
      return;
    }
    for (const member of attendingMembers) {
      const rsvp = memberRsvps[member.id];
      if (!rsvp?.entreeChoice?.trim()) {
        setError(`${member.firstName} ${member.lastName}: please choose an entrée.`);
        return;
      }
      if (!rsvp?.dessertChoice?.trim()) {
        setError(`${member.firstName} ${member.lastName}: please choose a dessert.`);
        return;
      }
    }
    setLoading(true);
    setError('');

    const memberNames: Record<string, string> = {};
    party.members.forEach((member) => {
      memberNames[member.id] = `${member.firstName} ${member.lastName}`;
    });

    try {
      const response = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: party.id,
          lastName: party.lastName,
          email,
          accommodation: attendingMembers.length > 0 ? accommodation : null,
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
    } catch {
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
    setAccommodation('');
    setError('');
    setSubmitted(false);
    setIsUpdate(false);
  };

  return (
    <>
      <NavBar activeTab={activeTab} tabs={TABS} goToTab={goToTab} tabLabels={TAB_LABELS} />

      {activeTab === 'landing' && (
        <LandingTab
          onGoToRsvp={() => goToTab('rsvp')}
          mobileIntroComplete={landingMobileIntroComplete}
          onMobileIntroComplete={markLandingMobileIntroComplete}
        />
      )}
      {activeTab === 'venue' && <VenueTab />}
      {activeTab === 'schedule' && <ScheduleTab />}
      {activeTab === 'things-to-do' && <ThingsToDoTab />}
      {activeTab === 'travel' && <TravelTab />}
      {activeTab === 'registry' && <RegistryTab />}
      {activeTab === 'faq' && <FAQTab />}
      {activeTab === 'rsvp' && (
        <RsvpTab
          lastName={lastName}
          setLastName={setLastName}
          party={party}
          matchingParties={matchingParties}
          memberRsvps={memberRsvps}
          email={email}
          setEmail={setEmail}
          accommodation={accommodation}
          setAccommodation={setAccommodation}
          loading={loading}
          error={error}
          submitted={submitted}
          isUpdate={isUpdate}
          onLastNameLookup={handleLastNameLookup}
          onPartySelection={handlePartySelection}
          onMemberRsvpChange={handleMemberRsvpChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-secondary" />}>
      <HomeContent />
    </Suspense>
  );
}
