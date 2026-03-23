import Image from 'next/image';

export default function VenueTab() {
  return (
    <section className="relative min-h-dvh pt-24 pb-16 px-4 bg-secondary overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-start pointer-events-none pl-0" aria-hidden>
        <div className="relative w-full max-w-6xl h-[100%] min-h-[500px]">
          <Image
            src="/images/chateau_sketch-no-bg.png"
            alt=""
            fill
            className="object-contain object-left-bottom opacity-[0.16]"
            sizes="(max-width: 1024px) 90vw, 56rem"
          />
        </div>
      </div>
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <p className="font-oldforge text-2xl text-primary mb-4 uppercase">The Venue</p>
        <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">Château de Lacoste</h2>
        <div className="w-24 h-[1px] bg-primary mx-auto mb-6" />
        <p className="font-oldforge text-xl text-stone-800 mb-4 text-left max-w-2xl mx-auto">
          Château de Lacoste stands in Castelnaud-la-Chapelle, in the Périgord Noir, above the Dordogne
          valley—a landscape long dotted with medieval fortresses and riverside villages. The house took
          its present form in the 18th century, when classical symmetry and formal planning were layered
          onto an older site, leaving a manor that reads clearly as a product of that era: limestone
          walls, ordered façades, and gardens laid out in the French tradition, with boxwood and roses
          still defining the outdoor rooms between the house and the slope.
        </p>
        <p className="font-oldforge text-lg text-stone-700 mb-4 text-left max-w-2xl mx-auto">
          The property sits on several hectares of parkland; a small chapel and later additions belong to
          the same continuum of use—first as a family seat, now as a place where the fabric of the
          building and the land still tell the story of how people lived and worked here across
          centuries.
        </p>
        {/* <p className="font-oldforge text-sm text-stone-600 mb-6 max-w-2xl mx-auto">
          Protected cultural heritage · several hectares of parkland · chapel on the estate
        </p> */}
        <a
          href="https://www.chateau-de-lacoste.fr/lacoste?lang=en"
          target="_blank"
          rel="noopener noreferrer"
          className="font-oldforge uppercase inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 px-6 py-2 rounded-md font-sans text-sm font-medium"
        >
          Visit Château de Lacoste
        </a>
      </div>
      {/* Mobile: extra height so guests can scroll and see more of the sketch at the bottom */}
      <div
        className="relative z-10 w-full min-h-[20vh] md:hidden pointer-events-none"
        aria-hidden
      />
    </section>
  );
}
