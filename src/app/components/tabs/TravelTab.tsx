export default function TravelTab() {
  return (
    <section className="min-h-screen pt-24 pb-16 px-4 bg-secondary">
      <main className="max-w-3xl mx-auto">
        <p className="font-oldforge uppercase text-2xl text-primary mb-2">Getting There</p>
        <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">Travel & Directions</h2>
        <div className="w-24 h-[1px] bg-secondary mb-10"></div>
        <p className="font-oldforge text-xl text-stone-800 mb-12">
          Château de Lacoste is in Castelnaud-la-Chapelle, in the heart of the Périgord Noir.
          Here are some ways to get there.
        </p>
        <div className="mb-14">
          <h3 className="font-oldforge uppercase text-2xl md:text-3xl text-primary mb-4">Suggested Airports</h3>
          <div className="space-y-6 font-oldforge text-lg text-stone-800">
            <div className="border-l-2 border-secondary pl-6">
              <h4 className="font-oldforge font-semibold text-primary mb-1">Bordeaux–Mérignac (BOD)</h4>
              <p>About 2 hours by car. Good international connections and a straightforward drive east into the Dordogne.</p>
            </div>
            <div className="border-l-2 border-secondary pl-6">
              <h4 className="font-oldforge font-semibold text-primary mb-1">Toulouse–Blagnac (TLS)</h4>
              <p>About 2 hours by car. Northbound to the Dordogne; another solid option if you find better flights.</p>
            </div>
            <div className="border-l-2 border-secondary pl-6">
              <h4 className="font-oldforge font-semibold text-primary mb-1">Paris (CDG / Orly)</h4>
              <p>About 5–6 hours by car or TGV to Bordeaux then car. Best if you&apos;re already in Paris or combining with a longer trip.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-oldforge uppercase text-2xl md:text-3xl text-primary mb-4">By Car</h3>
          <p className="font-oldforge text-lg text-stone-800 mb-6">
            Castelnaud-la-Chapelle is easiest to reach by car. From Bordeaux or Toulouse, follow signs for the Dordogne valley;
            the château is in Castelnaud-la-Chapelle. We&apos;ll share exact address and parking details closer to the date.
          </p>
          <p className="font-oldforge text-sm text-stone-600">
            If you&apos;re renting a car, booking in advance is recommended for October.
            The roads around the Dordogne are scenic and well-maintained.
          </p>
        </div>
      </main>
    </section>
  );
}
