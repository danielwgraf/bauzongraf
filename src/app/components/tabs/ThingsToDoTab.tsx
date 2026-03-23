type ThingToDo = {
  name: string;
  /** Rough drive time from Château de Lacoste area */
  driveTime?: string;
  description: string;
  address: string;
  /** Optional extra link (e.g. official site) */
  websiteUrl?: string;
  websiteLabel?: string;
};

function mapsSearchUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function PlaceEntry({ item }: { item: ThingToDo }) {
  const mapsHref = mapsSearchUrl(item.address);
  return (
    <li className="border-l-2 border-primary/30 pl-6 py-1">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
        <span className="font-oldforge font-semibold text-primary text-lg md:text-xl">{item.name}</span>
        {item.driveTime ? (
          <span className="font-oldforge text-stone-500 text-base">— {item.driveTime}</span>
        ) : null}
      </div>
      <p className="font-oldforge text-stone-700 text-base md:text-lg mt-2 leading-relaxed max-w-prose">
        {item.description}
      </p>
      <p className="mt-3">
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-oldforge text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary text-base md:text-lg inline-flex flex-col sm:inline sm:flex-row sm:items-center sm:gap-2"
        >
          <span className="whitespace-normal">{item.address}</span>
        </a>
      </p>
      {item.websiteUrl ? (
        <p className="mt-1">
          <a
            href={item.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-oldforge text-stone-600 hover:text-primary text-sm underline underline-offset-2"
          >
            {item.websiteLabel ?? "Website"}
          </a>
        </p>
      ) : null}
    </li>
  );
}

function Section({ title, items }: { title: string; items: ThingToDo[] }) {
  return (
    <div className="mb-14">
      <h3 className="font-oldforge uppercase text-2xl md:text-3xl text-primary mb-6">{title}</h3>
      <ul className="space-y-8 font-oldforge text-lg text-stone-800">
        {items.map((item) => (
          <PlaceEntry key={item.name} item={item} />
        ))}
      </ul>
    </div>
  );
}

const CASTLES: ThingToDo[] = [
  {
    name: "Château de Castelnaud",
    driveTime: "7 minutes",
    description:
      "A medieval fortress perched above the Dordogne, with arms and medieval warfare collections and sweeping views over the river and Beynac. One of the most visited castles in the region.",
    address: "Château de Castelnaud, 24250 Castelnaud-la-Chapelle, France",
  },
  {
    name: "Château des Milandes",
    driveTime: "9 minutes",
    description:
      "Renaissance manor famous as Josephine Baker’s home—period rooms, gardens, and daily birds of prey shows. A softer, story-filled contrast to purely military castles.",
    address: "Château des Milandes, 24250 Castelnaud-la-Chapelle, France",
  },
  {
    name: "Château de Beynac",
    driveTime: "13 minutes",
    description:
      "Dramatic cliff-top castle facing Castelnaud across the valley. Mostly original stone interiors and steep climbs—one of the best-preserved feudal strongholds in Périgord.",
    address: "Château de Beynac, Rue de l'Église, 24220 Beynac-et-Cazenac, France",
  },
  {
    name: "Château de Reignac",
    driveTime: "40 minutes",
    description:
      "Unusual “cliff castle” where the building merges with the rock—furnished Renaissance rooms and a terrace over the Vézère. Often quieter than the big Dordogne trio.",
    address: "Château de Reignac, La Grande Filolie, 24620 Tursac, France",
  },
  {
    name: "Château de Losse",
    driveTime: "45 minutes",
    description:
      "Fortified house with a celebrated formal garden between ramparts and forest, on the cliffs above the Vézère. Good stop combined with Lascaux or Saint-Léon.",
    address: "Château de Losse, 24220 Thonac, France",
  },
];

const GEO_HISTORY: ThingToDo[] = [
  {
    name: "Lascaux (Lascaux IV)",
    driveTime: "45 minutes",
    description:
      "World-famous prehistoric art—visit the Lascaux IV interpretation centre for full-scale replicas and context (the original cave is closed to the public). Book timed tickets in season.",
    address: "Lascaux IV, Avenue de Lascaux, 24290 Montignac-Lascaux, France",
  },
  {
    name: "Roque Saint-Christophe",
    driveTime: "45 minutes",
    description:
      "A mile of limestone cliff hollowed into terraces and dwellings, used from prehistoric times through the Middle Ages. Walkways and views over the Vézère.",
    address: "Roque Saint-Christophe, 24620 Peyzac-le-Moustier, France",
  },
  {
    name: "Gouffre de Padirac",
    driveTime: "1 hour 20 minutes",
    description:
      "Huge sinkhole with an underground river—descend by lift or stairs, then boat through lit caverns. A full outing; very popular in summer (reserve ahead).",
    address: "Gouffre de Padirac, Rue du Gouffre, 46500 Padirac, France",
  },
];

const VILLAGES: ThingToDo[] = [
  {
    name: "Domme",
    driveTime: "18 minutes",
    description:
      "Bastide on a high plateau with a huge main square, cave entrances under the village, and viewpoints over the Dordogne bends. Good for a stroll, ice cream, and photos.",
    address: "Domme, 24250, France",
  },
  {
    name: "La Roque-Gageac",
    driveTime: "10 minutes",
    description:
      "Stone houses tucked under cliffs along the river—often listed among France’s prettiest villages. Gabarres (river boats) depart from the quay in season.",
    address: "La Roque-Gageac, 24200, France",
  },
  {
    name: "Sarlat-la-Canéda",
    driveTime: "20 minutes",
    description:
      "The region’s flagship medieval town—golden stone lanes, Saturday market, shops, and restaurants. Ideal for a half-day of wandering and people-watching.",
    address: "Sarlat-la-Canéda, 24200, France",
  },
  {
    name: "Saint-Amand-de-Coly",
    driveTime: "40 minutes",
    description:
      "Small village dominated by a fortified abbey church in the Vézère valley. Calm and atmospheric, nice paired with Montignac or Lascaux.",
    address: "Saint-Amand-de-Coly, 24200, France",
  },
  {
    name: "Turenne",
    driveTime: "1 hour 10 minutes",
    description:
      "Hilltop village in Corrèze with cobbled lanes and the ruins of a great castle keep—wide views over the countryside. Quieter than Sarlat.",
    address: "Turenne, 19500, France",
  },
  {
    name: "Rocamadour",
    driveTime: "1 hour 10 minutes",
    description:
      "Cliff-hugging pilgrimage town: chapels, castle, and the Black Madonna site, plus tourist shops and cheese. Arrive early or late to avoid peak crowds.",
    address: "Rocamadour, 46500, France",
  },
  {
    name: "Collonges-la-Rouge",
    driveTime: "1 hour 20 minutes",
    description:
      "Village almost entirely built from red sandstone—lanes, towers, and small gardens. One of the Plus Beaux Villages; compact visit of an hour or two.",
    address: "Collonges-la-Rouge, 19500, France",
  },
];

const RESTAURANTS: ThingToDo[] = [
  {
    name: "La Source",
    description:
      "Traditional Périgord cooking near the village—terrace, regional dishes, and a relaxed local feel. Handy after visiting Castelnaud.",
    address: "75 Tournepique, 24250 Castelnaud-la-Chapelle, France",
  },
  {
    name: "Chez Josephine",
    description:
      "Riverside “guinguette” style spot on the Dordogne with veranda views—casual plates, drinks by the water, and a lively summer atmosphere.",
    address: "20 Route du Petit Bois, 24250 Castelnaud-la-Chapelle, France",
    websiteUrl: "https://www.chezjosephinerestaurant.com/",
    websiteLabel: "Restaurant website",
  },
  {
    name: "Les Machicoulis",
    description:
      "Restaurant (and rooms) in the heart of Castelnaud—terrace overlooking the valley toward the castle. Pizzas, salads, and regional options; reservations wise in high season.",
    address: "Le Bourg, 24250 Castelnaud-la-Chapelle, France",
  },
  {
    name: "Maison Carré",
    description:
      "Beloved local boulangerie-pâtisserie for bread, viennoiseries, sandwiches, and sweet treats—great for picnic supplies or breakfast before a day out.",
    address: "Lieu-dit Tournepique, 24250 Castelnaud-la-Chapelle, France",
  },
];

export default function ThingsToDoTab() {
  return (
    <section className="min-h-screen pt-24 pb-16 px-4 bg-secondary">
      <div className="max-w-3xl mx-auto">
        <p className="font-oldforge uppercase text-2xl text-primary mb-2">While You&apos;re Here</p>
        <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">Suggested Things to Do</h2>
        <div className="w-24 h-[1px] bg-primary mb-10" />
        <p className="font-oldforge text-stone-700 text-lg mb-12 max-w-prose leading-relaxed">
          Drive times are approximate from the Château de Lacoste area. Tap an address to open it in Google Maps.
        </p>

        <Section title="Castles" items={CASTLES} />
        <Section title="Geographic & Historical Sites" items={GEO_HISTORY} />
        <Section title="Villages" items={VILLAGES} />
        <Section title="Local Restaurants & Boulangerie" items={RESTAURANTS} />
      </div>
    </section>
  );
}
