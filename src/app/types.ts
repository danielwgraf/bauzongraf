export const TABS = [
  'landing',
  'venue',
  'schedule',
  'things-to-do',
  'travel',
  'registry',
  'faq',
  'rsvp',
] as const;
export type TabId = (typeof TABS)[number];

export interface PartyMember {
  id: string;
  firstName: string;
  lastName: string;
}

export interface InviteParty {
  id: string;
  lastName: string;
  members: PartyMember[];
}

export type AccommodationChoice = 'chateau' | 'elsewhere';

export interface MemberRSVP {
  memberId: string;
  isAttending: boolean;
  dietaryRestrictions: string;
  entreeChoice: string;
  dessertChoice: string;
}

/** One appetizer (no choice). */
export const MEAL_APPETIZER = 'Melon Gazpacho with Monbazillac';

/** Entree options — pick one. Add vegetarian when confirmed. */
export const ENTREE_OPTIONS = [
  { id: 'veal', label: 'Grilled veal steak, full-bodied rosemary and garlic confit jus, and carrot mousseline' },
  { id: 'poultry', label: 'Farm-raised poultry supreme, morel sauce, and confit fingerling potatoes' },
  { id: 'vegetarian', label: 'Vegetarian option (TBA)' },
] as const;

/** Dessert options — pick one. */
export const DESSERT_OPTIONS = [
  { id: 'chocolate', label: 'Crunchy chocolate entremet' },
  { id: 'apple', label: '"Apple Illusion" (trompe l\'œil), vanilla ganache, and apple-walnut-cinnamon compote' },
] as const;
