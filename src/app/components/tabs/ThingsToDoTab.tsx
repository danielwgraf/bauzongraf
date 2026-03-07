export default function ThingsToDoTab() {
  return (
    <section className="min-h-screen pt-24 pb-16 px-4 bg-secondary">
      <div className="max-w-3xl mx-auto">
        <p className="font-oldforge text-2xl text-primary mb-2">While You&apos;re Here</p>
        <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">Suggested Things to Do</h2>
        <div className="w-24 h-[1px] bg-primary mb-10" />

        <div className="mb-14">
          <h3 className="font-oldforge text-2xl md:text-3xl text-primary mb-4">Castles</h3>
          <ul className="space-y-4 font-cormorant text-lg text-stone-800">
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Castelnaud-la-Chapelle</span>
              <span className="text-stone-600"> — 7 minutes</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Milandes Castle</span>
              <span className="text-stone-600"> — 9 minutes</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Beynac Castle</span>
              <span className="text-stone-600"> — 13 minutes</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Reignac Fortified House</span>
              <span className="text-stone-600"> — 40 minutes</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Losse Castle and Gardens</span>
              <span className="text-stone-600"> — 45 minutes</span>
            </li>
          </ul>
        </div>

        <div className="mb-14">
          <h3 className="font-oldforge text-2xl md:text-3xl text-primary mb-4">Geographic &amp; Historical Sites</h3>
          <ul className="space-y-4 font-cormorant text-lg text-stone-800">
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Lascaux Cave</span>
              <span className="text-stone-600"> — 45 minutes</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Roque Saint-Christophe</span>
              <span className="text-stone-600"> — 45 minutes</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Padirac Chasm</span>
              <span className="text-stone-600"> — 1 hour 20 minutes</span>
            </li>
          </ul>
        </div>

        <div className="mb-14">
          <h3 className="font-oldforge text-2xl md:text-3xl text-primary mb-4">Villages</h3>
          <ul className="space-y-4 font-cormorant text-lg text-stone-800">
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Domme</span>
              <span className="text-stone-600"> — 18 minutes</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">La Roque-Gageac</span>
              <span className="text-stone-600"> — 10 minutes</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Sarlat-la-Canéda</span>
              <span className="text-stone-600"> — 20 minutes</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Saint-Amand-de-Coly</span>
              <span className="text-stone-600"> — 40 minutes</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Turenne</span>
              <span className="text-stone-600"> — 1 hour 10 minutes</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Rocamadour</span>
              <span className="text-stone-600"> — 1 hour 10 minutes</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Collonges-la-Rouge</span>
              <span className="text-stone-600"> — 1 hour 20 minutes</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-oldforge text-2xl md:text-3xl text-primary mb-4">Local Restaurants</h3>
          <ul className="space-y-4 font-cormorant text-lg text-stone-800">
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">La Source</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Chez Josephine</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Les Machicoulis</span>
            </li>
            <li className="border-l-2 border-primary/30 pl-6">
              <span className="font-sans font-semibold text-primary">Maison Carré</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
