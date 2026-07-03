'use client';

import { useTranslations } from 'next-intl';
import type { InviteParty, MemberRSVP } from '../../types';
import { ENTREE_OPTIONS, DESSERT_OPTIONS } from '../../types';

interface RsvpTabProps {
  lastName: string;
  setLastName: (v: string) => void;
  party: InviteParty | null;
  matchingParties: InviteParty[];
  memberRsvps: Record<string, MemberRSVP>;
  email: string;
  setEmail: (v: string) => void;
  accommodation: '' | 'chateau' | 'elsewhere';
  setAccommodation: (v: '' | 'chateau' | 'elsewhere') => void;
  loading: boolean;
  error: string;
  submitted: boolean;
  isUpdate: boolean;
  onLastNameLookup: (e: React.FormEvent) => void;
  onPartySelection: (party: InviteParty) => void;
  onMemberRsvpChange: (memberId: string, field: keyof MemberRSVP, value: boolean | string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export default function RsvpTab({
  lastName,
  setLastName,
  party,
  matchingParties,
  memberRsvps,
  email,
  setEmail,
  accommodation,
  setAccommodation,
  loading,
  error,
  submitted,
  isUpdate,
  onLastNameLookup,
  onPartySelection,
  onMemberRsvpChange,
  onSubmit,
  onReset,
}: RsvpTabProps) {
  const t = useTranslations('RSVP');
  const tMeals = useTranslations('Meals');

  const attendingCount = party?.members.filter((member) => memberRsvps[member.id]?.isAttending).length ?? 0;
  const anyAttending = attendingCount > 0;

  return (
    <main className="min-h-dvh bg-secondary px-4 pt-24 pb-16">
      <div className="mx-auto max-w-2xl">
        {submitted ? (
          <div className="text-center space-y-4">
            <h2 className="font-parochus-original text-3xl text-primary mb-4">{t('thankYou')}</h2>
            <p className="font-cormorant text-lg text-stone-800">
              {t(isUpdate ? 'updatedSuccess' : 'submittedSuccess')}
            </p>
            <button
              onClick={onReset}
              className="bg-primary text-white px-6 py-3 rounded hover:bg-primary/90 transition-colors font-sans"
            >
              {t(isUpdate ? 'updateAgain' : 'submitAnother')}
            </button>
          </div>
        ) : matchingParties.length > 0 ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-parochus-original text-3xl text-primary mb-2">{t('multiplePartiesTitle')}</h2>
              <p className="font-cormorant text-lg text-stone-800 mb-6">
                {t('multiplePartiesMessage', { count: matchingParties.length, lastName })}
              </p>
            </div>
            <div className="space-y-4">
              {matchingParties.map((matchingParty) => (
                <button
                  key={matchingParty.id}
                  onClick={() => onPartySelection(matchingParty)}
                  className="w-full font-oldforge text-left border-2 border-stone-300 rounded-lg p-4 hover:border-primary hover:bg-white transition-colors bg-white"
                >
                  <div className="font-semibold text-lg text-primary mb-2">
                    {t('partyName', { lastName: matchingParty.lastName })}
                  </div>
                  <div className="text-sm text-stone-700">
                    <p className="mb-1">
                      <span className="font-medium">{t('membersLabel')}</span>{' '}
                      {matchingParty.members.map(m => `${m.firstName} ${m.lastName}`).join(', ')}
                    </p>
                    <p className="text-stone-600">
                      {t('memberCount', { count: matchingParty.members.length })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={onReset}
              className="w-full text-center text-stone-600 hover:text-primary font-medium"
            >
              {t('tryDifferentName')}
            </button>
          </div>
        ) : !party ? (
          <div className="text-center space-y-4">
            <h2 className="font-parochus-original text-3xl text-primary mb-6">{t('title')}</h2>
            <p className="font-oldforge text-lg text-stone-800 mb-6">{t('enterLastNamePrompt')}</p>
            <form onSubmit={onLastNameLookup} className="space-y-4">
              <input
                type="text"
                placeholder={t('enterLastNamePlaceholder')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full border font-oldforge border-stone-300 rounded p-3 text-lg bg-white text-stone-900 placeholder-stone-400"
              />
              {error && (
                <p className="text-red-600 text-sm font-oldforge font-medium">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-primary font-oldforge uppercase text-white px-6 py-3 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 w-full font-sans"
              >
                {t(loading ? 'lookingUp' : 'findInvitation')}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-parochus-original text-3xl text-primary mb-2">{t('rsvpForParty', { lastName: party.lastName })}</h2>
              {isUpdate ? (
                <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-amber-900 font-oldforge font-medium">
                    {t('existingRsvpNotice')}
                  </p>
                </div>
              ) : (
                <p className="font-oldforge text-lg text-stone-700">{t('respondForParty')}</p>
              )}
            </div>
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-oldforge font-medium mb-2 text-stone-800">
                  {t('contactEmail')}
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border font-oldforge border-stone-300 rounded p-3 bg-white text-stone-900 placeholder-stone-400"
                />
              </div>

              <div className="space-y-6">
                <h3 className="font-oldforge uppercase text-xl text-primary">{t('partyMembers')}</h3>
                {party.members.map((member) => (
                  <div key={member.id} className="border border-stone-200 rounded-lg p-4 space-y-4 bg-white">
                    <h4 className="font-sans font-oldforge text-lg font-semibold text-primary">
                      {member.firstName} {member.lastName}
                    </h4>
                    <div className="space-y-3">
                      <label className="flex font-oldforge items-center space-x-2 text-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={memberRsvps[member.id]?.isAttending || false}
                          onChange={(e) =>
                            onMemberRsvpChange(member.id, 'isAttending', e.target.checked)
                          }
                          className="w-5 h-5 rounded border-stone-300 text-primary"
                        />
                        <span>{t('willAttend')}</span>
                      </label>
                      {memberRsvps[member.id]?.isAttending && (
                        <>
                          <div className="space-y-4">
                            <p className="text-sm font-oldforge text-stone-600 italic">{t('starter', { appetizer: tMeals('appetizer') })}</p>
                            <div>
                              <p className="text-sm font-oldforge font-medium mb-2 text-stone-800">{t('entreeChoose')} <span className="text-primary">*</span></p>
                              <div className="space-y-2" role="group" aria-required="true">
                                {ENTREE_OPTIONS.map((option) => (
                                  <label key={option.id} className="flex font-oldforge items-start gap-2 text-stone-800 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`entree-${member.id}`}
                                      value={option.id}
                                      checked={memberRsvps[member.id]?.entreeChoice === option.id}
                                      onChange={() => onMemberRsvpChange(member.id, 'entreeChoice', option.id)}
                                      required
                                      className="w-4 h-4 mt-0.5 border-stone-300 text-primary"
                                    />
                                    <span className="text-sm">{tMeals('entree_' + option.id)}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm font-oldforge text-stone-600 italic">{t('cheeseCourse')}</p>
                            <div>
                              <p className="text-sm font-oldforge font-medium mb-2 text-stone-800">{t('dessertChoose')} <span className="text-primary">*</span></p>
                              <div className="space-y-2" role="group" aria-required="true">
                                {DESSERT_OPTIONS.map((option) => (
                                  <label key={option.id} className="flex font-oldforge items-start gap-2 text-stone-800 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`dessert-${member.id}`}
                                      value={option.id}
                                      checked={memberRsvps[member.id]?.dessertChoice === option.id}
                                      onChange={() => onMemberRsvpChange(member.id, 'dessertChoice', option.id)}
                                      required
                                      className="w-4 h-4 mt-0.5 border-stone-300 text-primary"
                                    />
                                    <span className="text-sm">{tMeals('dessert_' + option.id)}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label htmlFor={`dietary-${member.id}`} className="block font-oldforge text-sm font-medium mb-2 text-stone-800">
                              {t('dietaryLabel')}
                            </label>
                            <textarea
                              id={`dietary-${member.id}`}
                              placeholder={t('dietaryPlaceholder')}
                              value={memberRsvps[member.id]?.dietaryRestrictions || ''}
                              onChange={(e) =>
                                onMemberRsvpChange(member.id, 'dietaryRestrictions', e.target.value)
                              }
                              className="w-full font-oldforge border border-stone-300 rounded p-2 bg-white text-stone-900 placeholder-stone-400"
                              rows={2}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {anyAttending && (
                <div>
                  <p className="text-sm font-oldforge font-medium mb-2 text-stone-800">{t('accommodationLabel')}</p>
                  <div className="space-y-2">
                    <label className="flex font-oldforge items-center gap-2 text-stone-800 cursor-pointer">
                      <input
                        type="radio"
                        name="accommodation"
                        value="chateau"
                        checked={accommodation === 'chateau'}
                        onChange={() => setAccommodation('chateau')}
                        className="w-4 h-4 border-stone-300 font-oldforge text-primary"
                      />
                      <span>{t('accommodationChateau', { count: attendingCount })}</span>
                    </label>
                    <label className="flex font-oldforge items-center gap-2 text-stone-800 cursor-pointer">
                      <input
                        type="radio"
                        name="accommodation"
                        value="elsewhere"
                        checked={accommodation === 'elsewhere'}
                        onChange={() => setAccommodation('elsewhere')}
                        className="w-4 h-4 font-oldforge border-stone-300 text-primary"
                      />
                      <span>{t('accommodationElsewhere', { count: attendingCount })}</span>
                    </label>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-red-600 text-sm font-medium">{error}</p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onReset}
                  className="flex-1 border border-stone-300 text-stone-700 px-6 py-3 rounded hover:bg-white bg-white font-sans transition-colors"
                >
                  {t('startOver')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 font-sans"
                >
                  {t(loading ? (isUpdate ? 'updating' : 'submitting') : (isUpdate ? 'updateRsvp' : 'submitRsvp'))}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
