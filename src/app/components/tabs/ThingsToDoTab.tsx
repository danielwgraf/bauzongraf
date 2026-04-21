"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Used for “from the venue” driving directions and map embed */
const CHATEAU_LACOSTE_ORIGIN =
  "Château de Lacoste, 24250 Castelnaud-la-Chapelle, France";

type ThingToDo = {
  name: string;
  /** Rough drive time from Château de Lacoste area */
  driveTime?: string;
  description: string;
  address: string;
  /** Hero image in the detail modal; falls back to a neutral graphic if omitted */
  imageSrc?: string;
  /** Optional extra link (e.g. official site) */
  websiteUrl?: string;
  websiteLabel?: string;
};

type Category = {
  id: string;
  title: string;
  items: ThingToDo[];
};

function mapsSearchUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function drivingDirectionsUrl(destinationAddress: string) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(CHATEAU_LACOSTE_ORIGIN)}&destination=${encodeURIComponent(destinationAddress)}&travelmode=driving`;
}

/** Driving route from Château de Lacoste in the embed (classic Maps iframe, no API key). */
function drivingDirectionsEmbedSrc(destinationAddress: string) {
  const saddr = encodeURIComponent(CHATEAU_LACOSTE_ORIGIN);
  const daddr = encodeURIComponent(destinationAddress);
  return `https://maps.google.com/maps?f=d&saddr=${saddr}&daddr=${daddr}&hl=en&output=embed`;
}

const PLACE_DETAIL_HISTORY_KEY = "thingsToDoPlaceDetail";

function PlaceDetailModal({ item, onClose }: { item: ThingToDo; onClose: () => void }) {
  const directionsHref = drivingDirectionsUrl(item.address);
  const embedSrc = drivingDirectionsEmbedSrc(item.address);
  const destMapsHref = mapsSearchUrl(item.address);
  const photoSrc = item.imageSrc ?? "/images/chateau_sketch-no-bg.png";
  const historyPushedRef = useRef(false);

  const dismissViaHistory = useCallback(() => {
    if (typeof window === "undefined") return;
    const state = window.history.state as Record<string, unknown> | null;
    if (state && state[PLACE_DETAIL_HISTORY_KEY] === true) {
      window.history.back();
    } else {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (!historyPushedRef.current) {
      window.history.pushState({ [PLACE_DETAIL_HISTORY_KEY]: true }, "");
      historyPushedRef.current = true;
    }

    const onPopState = () => {
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissViaHistory();
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose, dismissViaHistory]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-secondary"
      role="dialog"
      aria-modal="true"
      aria-labelledby="place-detail-title"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-primary/15 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <h3
          id="place-detail-title"
          className="font-oldforge uppercase text-lg text-primary leading-tight pr-2 line-clamp-2"
        >
          {item.name}
        </h3>
        <button
          type="button"
          onClick={dismissViaHistory}
          className="font-oldforge uppercase shrink-0 border-2 border-primary text-primary px-4 py-2 rounded-md hover:bg-primary hover:text-secondary transition-colors"
        >
          Back
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 space-y-5">
        <div className="relative w-full aspect-[16/10] max-h-[min(40vh,280px)] rounded-xl overflow-hidden bg-stone-200/80 border border-primary/15">
          <Image
            src={photoSrc}
            alt=""
            fill
            className={item.imageSrc ? "object-cover" : "object-contain object-center p-6 opacity-90"}
            sizes="(max-width: 768px) 100vw, 42rem"
            priority
          />
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-oldforge uppercase text-center inline-flex items-center justify-center border-2 border-primary bg-primary text-secondary px-4 py-2.5 rounded-md hover:brightness-110 transition-[filter]"
          >
            Directions from the château
          </a>
          {item.websiteUrl ? (
            <a
              href={item.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-oldforge uppercase text-center inline-flex items-center justify-center border-2 border-primary/60 text-primary bg-transparent px-4 py-2.5 rounded-md hover:bg-primary/10 transition-colors"
            >
              {item.websiteLabel ?? "Website"}
            </a>
          ) : null}
        </div>

        {item.driveTime ? (
          <p className="font-oldforge text-primary text-base">
            <span className="font-semibold">From Château de Lacoste: </span>
            about {item.driveTime} by car
          </p>
        ) : (
          <p className="font-oldforge text-stone-600 text-sm">
            Driving directions below are from Château de Lacoste.
          </p>
        )}

        <p className="font-oldforge text-stone-800 text-base leading-relaxed">{item.description}</p>

        <div>
          <p className="font-oldforge text-xs uppercase tracking-wider text-primary mb-1">Address</p>
          <p className="font-oldforge text-stone-800 text-base">{item.address}</p>
        </div>

        <div>
          <p className="font-oldforge text-xs uppercase tracking-wider text-primary mb-1">
            Route from Château de Lacoste
          </p>
          <p className="font-oldforge text-stone-600 text-sm mb-3 leading-snug">
            Preview of the driving route from the wedding venue. Open Google Maps for the full
            turn-by-turn view.
          </p>
          <div className="things-map-embed rounded-xl border border-primary/15 bg-stone-200/60 shadow-inner overflow-hidden">
            <iframe
              title={`Driving directions from Château de Lacoste to ${item.name}`}
              src={embedSrc}
              className="things-map-embed-frame w-full border-0 bg-stone-100"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {/* <div className="mt-3">
            <a
              href={destMapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-oldforge text-sm text-stone-600 hover:text-primary underline underline-offset-4 decoration-stone-300 hover:decoration-primary"
            >
              Open in Google Maps
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
}

function PlaceCard({ item, onOpen }: { item: ThingToDo; onOpen: () => void }) {
  return (
    <li className="snap-start shrink-0 w-[86%] sm:w-[70%] md:w-full md:shrink">
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left rounded-xl border border-primary/20 bg-white/40 p-5 hover:bg-white/60 active:bg-white/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-oldforge font-semibold text-primary text-xl md:text-2xl">{item.name}</span>
          {item.driveTime ? (
            <span className="font-oldforge text-stone-500 text-base">- {item.driveTime}</span>
          ) : null}
        </div>
        <p className="font-oldforge text-stone-700 text-base md:text-lg mt-3 leading-relaxed line-clamp-4">
          {item.description}
        </p>
        <span className="font-oldforge text-primary text-sm mt-4 inline-block underline underline-offset-4 decoration-primary/40">
          Details, map & directions
        </span>
      </button>
    </li>
  );
}

function CategoryPlacesList({
  category,
  onOpenPlace,
}: {
  category: Category;
  onOpenPlace: (item: ThingToDo) => void;
}) {
  return (
    <ul className="flex gap-4 overflow-x-auto pb-3 pr-2 snap-x snap-mandatory md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 md:pr-0 md:snap-none">
      <li aria-hidden className="w-1 shrink-0 md:hidden" />
      {category.items.map((item) => (
        <PlaceCard key={item.name} item={item} onOpen={() => onOpenPlace(item)} />
      ))}
      <li aria-hidden className="w-1 shrink-0 md:hidden" />
    </ul>
  );
}

function CategoryCarousel({
  category,
  onOpenPlace,
}: {
  category: Category;
  onOpenPlace: (item: ThingToDo) => void;
}) {
  return (
    <div className="mb-14">
      <h3 className="font-oldforge uppercase text-2xl md:text-3xl text-primary mb-2">{category.title}</h3>
      <p className="font-oldforge text-stone-600 text-sm mb-4 md:hidden">Swipe cards left/right</p>
      <CategoryPlacesList category={category} onOpenPlace={onOpenPlace} />
    </div>
  );
}

export default function ThingsToDoTab() {
  const categories = useMemo<Category[]>(
    () => [
      { id: "castles", title: "Castles", items: CASTLES },
      { id: "geo-history", title: "Geographic & Historical Sites", items: GEO_HISTORY },
      { id: "villages", title: "Villages", items: VILLAGES },
      { id: "food", title: "Local Restaurants & Boulangerie", items: RESTAURANTS },
    ],
    []
  );
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0].id);
  const [detailItem, setDetailItem] = useState<ThingToDo | null>(null);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? categories[0],
    [activeCategoryId, categories]
  );

  const closeDetail = useCallback(() => setDetailItem(null), []);
  const openPlace = (item: ThingToDo) => setDetailItem(item);

  return (
    <section className="min-h-dvh pt-24 pb-16 px-4 bg-secondary">
      <div className="max-w-5xl mx-auto">
        <p className="font-oldforge uppercase text-2xl text-primary mb-2">While You&apos;re Here</p>
        <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">Suggested Things to Do</h2>
        <div className="w-24 h-[1px] bg-primary mb-10" />
        <p className="font-oldforge text-stone-700 text-lg mb-8 max-w-prose leading-relaxed">
          Drive times are approximate from Château de Lacoste. Tap a place for the full details, route map,
          and links.
        </p>

        {/* Mobile: every category with its own swipe row */}
        <div className="md:hidden">
          {categories.map((category) => (
            <CategoryCarousel key={category.id} category={category} onOpenPlace={openPlace} />
          ))}
        </div>

        {/* Desktop: filter + one category grid */}
        <div className="hidden md:flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategoryId(category.id)}
              className={`font-oldforge uppercase text-sm md:text-base border px-3 py-1.5 rounded-full transition-colors ${
                activeCategoryId === category.id
                  ? "bg-primary text-secondary border-primary"
                  : "bg-transparent text-primary border-primary/50 hover:border-primary"
              }`}
              aria-pressed={activeCategoryId === category.id}
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="hidden md:block">
          <CategoryCarousel category={activeCategory} onOpenPlace={openPlace} />
        </div>
      </div>

      {detailItem ? <PlaceDetailModal item={detailItem} onClose={closeDetail} /> : null}
    </section>
  );
}

const CASTLES: ThingToDo[] = [
  {
    name: "Château de Castelnaud",
    driveTime: "7 minutes",
    description:
      "A medieval fortress perched above the Dordogne, with arms and medieval warfare collections and sweeping views over the river and Beynac. One of the most visited castles in the region.",
    address: "Château de Castelnaud, 24250 Castelnaud-la-Chapelle, France",
    imageSrc: "/images/locations/castelnaud.jpg",
    websiteUrl: "https://castelnaud.com/?lang=en",
    websiteLabel: "Château de Castelnaud website",
  },
  {
    name: "Château des Milandes",
    driveTime: "9 minutes",
    description:
      "Renaissance manor famous as Josephine Baker’s home—period rooms, gardens, and daily birds of prey shows. A softer, story-filled contrast to purely military castles.",
    address: "Château des Milandes, 24250 Castelnaud-la-Chapelle, France",
    imageSrc: "/images/locations/milandes.jpg",
    websiteUrl: "https://www.milandes.com/en/",
    websiteLabel: "Château des Milandes website",
  },
  {
    name: "Château de Beynac",
    driveTime: "13 minutes",
    description:
      "Dramatic cliff-top castle facing Castelnaud across the valley. Mostly original stone interiors and steep climbs—one of the best-preserved feudal strongholds in Périgord.",
    address: "Château de Beynac, Rue de l'Église, 24220 Beynac-et-Cazenac, France",
    imageSrc: "/images/locations/beynac.png",
    websiteUrl: "https://chateau-beynac.com/?lang=en",
    websiteLabel: "Château de Beynac website",
  },
  // {
  //   name: "Château de Reignac",
  //   driveTime: "40 minutes",
  //   description:
  //     "Unusual “cliff castle” where the building merges with the rock—furnished Renaissance rooms and a terrace over the Vézère. Often quieter than the big Dordogne trio.",
  //   address: "Château de Reignac, La Grande Filolie, 24620 Tursac, France",
  //   imageSrc: "/images/locations/reignac.png",
  //   websiteUrl: "https://reignac.com/en/",
  //   websiteLabel: "Château de Reignac website",
  // },
  {
    name: "Château de Losse",
    driveTime: "45 minutes",
    description:
      "Fortified house with a celebrated formal garden between ramparts and forest, on the cliffs above the Vézère. Good stop combined with Lascaux or Saint-Léon.",
    address: "Château de Losse, 24220 Thonac, France",
    imageSrc: "/images/locations/losse.png",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/natural-and-cultural-heritage/top-10-places-to-visit/the-land-of-1001-castles/chateau-de-losse",
    websiteLabel: "Château de Losse Description",
  },
];

const GEO_HISTORY: ThingToDo[] = [
  {
    name: "Lascaux (Lascaux IV)",
    driveTime: "45 minutes",
    description:
      "World-famous prehistoric art—visit the Lascaux IV interpretation centre for full-scale replicas and context (the original cave is closed to the public). Book timed tickets in season.",
    address: "Lascaux IV, Avenue de Lascaux, 24290 Montignac-Lascaux, France",
    imageSrc: "/images/locations/geo/lascaux.jpg",
    websiteUrl: "https://lascaux.fr/en/",
    websiteLabel: "Lascaux Website",
  },
  {
    name: "Roque Saint-Christophe",
    driveTime: "45 minutes",
    description:
      "A mile of limestone cliff hollowed into terraces and dwellings, used from prehistoric times through the Middle Ages. Walkways and views over the Vézère.",
    address: "Roque Saint-Christophe, 24620 Peyzac-le-Moustier, France",
    imageSrc: "/images/locations/geo/roque-saint-christophe.webp",
    websiteUrl: "https://www.roque-st-christophe.com/en/",
    websiteLabel: "Roque Saint-Christophe Website",
  },
  {
    name: "Gouffre de Padirac",
    driveTime: "1 hour 20 minutes",
    description:
      "Huge sinkhole with an underground river—descend by lift or stairs, then boat through lit caverns. A full outing; very popular in summer (reserve ahead).",
    address: "Gouffre de Padirac, Rue du Gouffre, 46500 Padirac, France",
    imageSrc: "/images/locations/geo/gouffre-de-padirac.avif",
    websiteUrl: "https://www.gouffre-de-padirac.com/",
    websiteLabel: "Gouffre de Padirac Website",
  },
];

const VILLAGES: ThingToDo[] = [
  {
    name: "Domme",
    driveTime: "18 minutes",
    description:
      "Bastide on a high plateau with a huge main square, cave entrances under the village, and viewpoints over the Dordogne bends. Good for a stroll, ice cream, and photos.",
    address: "Domme, 24250, France",
    imageSrc: "/images/locations/villages/domme.png",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/discover/cultural-heritage/villages-to-visit-in-2018/domme",
    websiteLabel: "Village Description",
  },
  {
    name: "La Roque-Gageac",
    driveTime: "10 minutes",
    description:
      "Stone houses tucked under cliffs along the river—often listed among France’s prettiest villages. Gabarres (river boats) depart from the quay in season.",
    address: "La Roque-Gageac, 24200, France",
    imageSrc: "/images/locations/villages/la-roque-gageac.jpeg",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/discover/cultural-heritage/villages-to-visit/la-roque-gageac",
    websiteLabel: "Village Description",
  },
  {
    name: "Sarlat-la-Canéda",
    driveTime: "20 minutes",
    description:
      "The region’s flagship medieval town—golden stone lanes, Saturday market, shops, and restaurants. Ideal for a half-day of wandering and people-watching.",
    address: "Sarlat-la-Canéda, 24200, France",
    imageSrc: "/images/locations/villages/sarlat.webp",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/discover/cultural-heritage/villages-to-visit/sarlat-la-caneda",
    websiteLabel: "Village Description",
  },
  {
    name: "Saint-Amand-de-Coly",
    driveTime: "40 minutes",
    description:
      "Small village dominated by a fortified abbey church in the Vézère valley. Calm and atmospheric, nice paired with Montignac or Lascaux.",
    address: "Saint-Amand-de-Coly, 24200, France",
    imageSrc: "/images/locations/villages/coly.png",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/natural-and-cultural-heritage/cultural-heritage/villages-to-visit/plus-beaux-villages-de-france/coly-saint-amand",
    websiteLabel: "Village Description",
  },
  {
    name: "Turenne",
    driveTime: "1 hour 10 minutes",
    description:
      "Hilltop village in Corrèze with cobbled lanes and the ruins of a great castle keep—wide views over the countryside. Quieter than Sarlat.",
    address: "Turenne, 19500, France",
    imageSrc: "/images/locations/villages/turenne.jpeg",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/discover/cultural-heritage/villages-to-visit/turenne",
    websiteLabel: "Village Description",
  },
  {
    name: "Rocamadour",
    driveTime: "1 hour 10 minutes",
    description:
      "Cliff-hugging pilgrimage town: chapels, castle, and the Black Madonna site, plus tourist shops and cheese. Arrive early or late to avoid peak crowds.",
    address: "Rocamadour, 46500, France",
    imageSrc: "/images/locations/villages/rocamadour.jpeg",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/discover/cultural-heritage/villages-to-visit/rocamadour",
    websiteLabel: "Village Description",
  },
  {
    name: "Collonges-la-Rouge",
    driveTime: "1 hour 20 minutes",
    description:
      "Village almost entirely built from red sandstone—lanes, towers, and small gardens. One of the Plus Beaux Villages; compact visit of an hour or two.",
    address: "Collonges-la-Rouge, 19500, France",
    imageSrc: "/images/locations/villages/collonges-la-rouge.png",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/discover/cultural-heritage/villages-to-visit/collonges-la-rouge",
    websiteLabel: "Village Description",
  },
];

const RESTAURANTS: ThingToDo[] = [
  {
    name: "La Source",
    description:
      "Traditional Périgord cooking near the village—terrace, regional dishes, and a relaxed local feel. Handy after visiting Castelnaud.",
    address: "238 Rte des Falaises du Céou, 24250 Castelnaud-la-Chapelle, France",
    imageSrc: "/images/locations/restaurant/la-source.jpg",
    websiteUrl: "https://www.tripadvisor.com/Restaurant_Review-g672395-d24172051-Reviews-La_Source-Castelnaud_la_Chapelle_Dordogne_Nouvelle_Aquitaine.html",
    websiteLabel: "Restaurant on TripAdvisor",
  },
  {
    name: "Chez Josephine",
    description:
      "Riverside “guinguette” style spot on the Dordogne with veranda views—casual plates, drinks by the water, and a lively summer atmosphere.",
    address: "20 Route du Petit Bois, 24250 Castelnaud-la-Chapelle, France",
    imageSrc: "/images/locations/restaurant/josephine.avif",
    websiteUrl: "https://www.chezjosephinerestaurant.com/",
    websiteLabel: "Restaurant website",
  },
  {
    name: "Les Machicoulis",
    description:
      "Restaurant (and rooms) in the heart of Castelnaud—terrace overlooking the valley toward the castle. Pizzas, salads, and regional options; reservations wise in high season.",
    address: "Le Bourg, 24250 Castelnaud-la-Chapelle, France",
    imageSrc: "/images/locations/restaurant/machicoulis.jpg",
    websiteUrl: "https://www.tripadvisor.com/Restaurant_Review-g672395-d12320231-Reviews-Les_Machicoulis-Castelnaud_la_Chapelle_Dordogne_Nouvelle_Aquitaine.html",
    websiteLabel: "Restaurant on TripAdvisor",
  },
  {
    name: "Maison Carré",
    description:
      "Beloved local boulangerie-pâtisserie for bread, viennoiseries, sandwiches, and sweet treats—great for picnic supplies or breakfast before a day out.",
    address: "Place de Tournepique, 24250 Castelnaud-la-Chapelle, France",
    imageSrc: "/images/locations/restaurant/maison.jpg",
    websiteUrl: "https://www.tripadvisor.com/Restaurant_Review-g672395-d8120674-Reviews-Maison_Carre-Castelnaud_la_Chapelle_Dordogne_Nouvelle_Aquitaine.html",
    websiteLabel: "Restaurant on TripAdvisor",
  },
];
