"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CHATEAU_LACOSTE_ORIGIN =
  "Château de Lacoste, 24250 Castelnaud-la-Chapelle, France";

type ThingToDo = {
  name: string;
  driveTime?: string;
  description: string;
  address: string;
  imageSrc?: string;
  websiteUrl?: string;
  websiteLabel?: string;
};

type Category = {
  id: string;
  title: string;
  items: ThingToDo[];
};

type PlaceData = {
  id: string;
  address: string;
  imageSrc?: string;
  websiteUrl?: string;
};

function mapsSearchUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function drivingDirectionsUrl(destinationAddress: string) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(CHATEAU_LACOSTE_ORIGIN)}&destination=${encodeURIComponent(destinationAddress)}&travelmode=driving`;
}

function drivingDirectionsEmbedSrc(destinationAddress: string) {
  const saddr = encodeURIComponent(CHATEAU_LACOSTE_ORIGIN);
  const daddr = encodeURIComponent(destinationAddress);
  return `https://maps.google.com/maps?f=d&saddr=${saddr}&daddr=${daddr}&hl=en&output=embed`;
}

const PLACE_DETAIL_HISTORY_KEY = "thingsToDoPlaceDetail";

const CASTLE_DATA: PlaceData[] = [
  {
    id: "chateauCastelnaud",
    address: "Château de Castelnaud, 24250 Castelnaud-la-Chapelle, France",
    imageSrc: "/images/locations/castelnaud.jpg",
    websiteUrl: "https://castelnaud.com/?lang=en",
  },
  {
    id: "chateauMillandes",
    address: "Château des Milandes, 24250 Castelnaud-la-Chapelle, France",
    imageSrc: "/images/locations/milandes.jpg",
    websiteUrl: "https://www.milandes.com/en/",
  },
  {
    id: "chateauBeynac",
    address: "Château de Beynac, Rue de l'Église, 24220 Beynac-et-Cazenac, France",
    imageSrc: "/images/locations/beynac.png",
    websiteUrl: "https://chateau-beynac.com/?lang=en",
  },
  {
    id: "chateauLosse",
    address: "Château de Losse, 24220 Thonac, France",
    imageSrc: "/images/locations/losse.png",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/natural-and-cultural-heritage/top-10-places-to-visit/the-land-of-1001-castles/chateau-de-losse",
  },
];

const GEO_HISTORY_DATA: PlaceData[] = [
  {
    id: "lascaux",
    address: "Lascaux IV, Avenue de Lascaux, 24290 Montignac-Lascaux, France",
    imageSrc: "/images/locations/geo/lascaux.jpg",
    websiteUrl: "https://lascaux.fr/en/",
  },
  {
    id: "roqueSaintChristophe",
    address: "Roque Saint-Christophe, 24620 Peyzac-le-Moustier, France",
    imageSrc: "/images/locations/geo/roque-saint-christophe.webp",
    websiteUrl: "https://www.roque-st-christophe.com/en/",
  },
  {
    id: "gouffreDePadirac",
    address: "Gouffre de Padirac, Rue du Gouffre, 46500 Padirac, France",
    imageSrc: "/images/locations/geo/gouffre-de-padirac.avif",
    websiteUrl: "https://www.gouffre-de-padirac.com/",
  },
];

const VILLAGE_DATA: PlaceData[] = [
  {
    id: "domme",
    address: "Domme, 24250, France",
    imageSrc: "/images/locations/villages/domme.png",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/discover/cultural-heritage/villages-to-visit-in-2018/domme",
  },
  {
    id: "laRoqueGageac",
    address: "La Roque-Gageac, 24200, France",
    imageSrc: "/images/locations/villages/la-roque-gageac.jpeg",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/discover/cultural-heritage/villages-to-visit/la-roque-gageac",
  },
  {
    id: "sarlat",
    address: "Sarlat-la-Canéda, 24200, France",
    imageSrc: "/images/locations/villages/sarlat.webp",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/discover/cultural-heritage/villages-to-visit/sarlat-la-caneda",
  },
  {
    id: "saintAmandDeColy",
    address: "Saint-Amand-de-Coly, 24200, France",
    imageSrc: "/images/locations/villages/coly.png",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/natural-and-cultural-heritage/cultural-heritage/villages-to-visit/plus-beaux-villages-de-france/coly-saint-amand",
  },
  {
    id: "turenne",
    address: "Turenne, 19500, France",
    imageSrc: "/images/locations/villages/turenne.jpeg",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/discover/cultural-heritage/villages-to-visit/turenne",
  },
  {
    id: "rocamadour",
    address: "Rocamadour, 46500, France",
    imageSrc: "/images/locations/villages/rocamadour.jpeg",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/discover/cultural-heritage/villages-to-visit/rocamadour",
  },
  {
    id: "collongesLaRouge",
    address: "Collonges-la-Rouge, 19500, France",
    imageSrc: "/images/locations/villages/collonges-la-rouge.png",
    websiteUrl: "https://www.visit-dordogne-valley.co.uk/discover/cultural-heritage/villages-to-visit/collonges-la-rouge",
  },
];

const RESTAURANT_DATA: PlaceData[] = [
  {
    id: "laSource",
    address: "238 Rte des Falaises du Céou, 24250 Castelnaud-la-Chapelle, France",
    imageSrc: "/images/locations/restaurant/la-source.jpg",
    websiteUrl: "https://www.tripadvisor.com/Restaurant_Review-g672395-d24172051-Reviews-La_Source-Castelnaud_la_Chapelle_Dordogne_Nouvelle_Aquitaine.html",
  },
  {
    id: "chezJosephine",
    address: "20 Route du Petit Bois, 24250 Castelnaud-la-Chapelle, France",
    imageSrc: "/images/locations/restaurant/josephine.avif",
    websiteUrl: "https://www.chezjosephinerestaurant.com/",
  },
  {
    id: "lesMachicoulis",
    address: "Le Bourg, 24250 Castelnaud-la-Chapelle, France",
    imageSrc: "/images/locations/restaurant/machicoulis.jpg",
    websiteUrl: "https://www.tripadvisor.com/Restaurant_Review-g672395-d12320231-Reviews-Les_Machicoulis-Castelnaud_la_Chapelle_Dordogne_Nouvelle_Aquitaine.html",
  },
  {
    id: "maisonCarre",
    address: "Place de Tournepique, 24250 Castelnaud-la-Chapelle, France",
    imageSrc: "/images/locations/restaurant/maison.jpg",
    websiteUrl: "https://www.tripadvisor.com/Restaurant_Review-g672395-d8120674-Reviews-Maison_Carre-Castelnaud_la_Chapelle_Dordogne_Nouvelle_Aquitaine.html",
  },
];

const CATEGORY_DATA = [
  { id: "castles", translationKey: "castles", places: CASTLE_DATA },
  { id: "geo-history", translationKey: "geoHistory", places: GEO_HISTORY_DATA },
  { id: "villages", translationKey: "villages", places: VILLAGE_DATA },
  { id: "food", translationKey: "restaurants", places: RESTAURANT_DATA },
] as const;

function PlaceDetailModal({ item, onClose }: { item: ThingToDo; onClose: () => void }) {
  const t = useTranslations("ThingsToDo");
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
          {t("back")}
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
            {t("directionsFromChateau")}
          </a>
          {item.websiteUrl ? (
            <a
              href={item.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-oldforge uppercase text-center inline-flex items-center justify-center border-2 border-primary/60 text-primary bg-transparent px-4 py-2.5 rounded-md hover:bg-primary/10 transition-colors"
            >
              {item.websiteLabel ?? t("website")}
            </a>
          ) : null}
        </div>

        {item.driveTime ? (
          <p className="font-oldforge text-primary text-base">
            <span className="font-semibold">{t("fromChateau")}</span>
            {t("driveTimeBy", { driveTime: item.driveTime })}
          </p>
        ) : (
          <p className="font-oldforge text-stone-600 text-sm">
            {t("drivingDirectionsNote")}
          </p>
        )}

        <p className="font-oldforge text-stone-800 text-base leading-relaxed">{item.description}</p>

        <div>
          <p className="font-oldforge text-xs uppercase tracking-wider text-primary mb-1">{t("addressLabel")}</p>
          <p className="font-oldforge text-stone-800 text-base">{item.address}</p>
        </div>

        <div>
          <p className="font-oldforge text-xs uppercase tracking-wider text-primary mb-1">
            {t("routeLabel")}
          </p>
          <p className="font-oldforge text-stone-600 text-sm mb-3 leading-snug">
            {t("routeDescription")}
          </p>
          <div className="things-map-embed rounded-xl border border-primary/15 bg-stone-200/60 shadow-inner overflow-hidden">
            <iframe
              title={t("mapIframeTitle", { name: item.name })}
              src={embedSrc}
              className="things-map-embed-frame w-full border-0 bg-stone-100"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceCard({ item, onOpen }: { item: ThingToDo; onOpen: () => void }) {
  const t = useTranslations("ThingsToDo");
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
          {t("detailsLink")}
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
  const t = useTranslations("ThingsToDo");
  return (
    <div className="mb-14">
      <h3 className="font-oldforge uppercase text-2xl md:text-3xl text-primary mb-2">{category.title}</h3>
      <p className="font-oldforge text-stone-600 text-sm mb-4 md:hidden">{t("swipeHint")}</p>
      <CategoryPlacesList category={category} onOpenPlace={onOpenPlace} />
    </div>
  );
}

export default function ThingsToDoTab() {
  const t = useTranslations("ThingsToDo");

  const categories = useMemo<Category[]>(
    () =>
      CATEGORY_DATA.map((cat) => ({
        id: cat.id,
        title: t(`categories.${cat.translationKey}`),
        items: cat.places.map((place) => ({
          name: t(`places.${place.id}.name`),
          driveTime: t(`places.${place.id}.driveTime`) || undefined,
          description: t(`places.${place.id}.description`),
          address: place.address,
          imageSrc: place.imageSrc,
          websiteUrl: place.websiteUrl,
          websiteLabel: place.websiteUrl ? t(`places.${place.id}.websiteLabel`) : undefined,
        })),
      })),
    [t]
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
        <p className="font-oldforge uppercase text-2xl text-primary mb-2">{t("sectionTitle")}</p>
        <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">{t("heading")}</h2>
        <div className="w-24 h-[1px] bg-primary mb-10" />
        <p className="font-oldforge text-stone-700 text-lg mb-8 max-w-prose leading-relaxed">
          {t("intro")}
        </p>

        <div className="md:hidden">
          {categories.map((category) => (
            <CategoryCarousel key={category.id} category={category} onOpenPlace={openPlace} />
          ))}
        </div>

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
