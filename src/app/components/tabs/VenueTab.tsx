import Image from 'next/image';

export default function VenueTab() {
  return (
    <section className="relative min-h-screen pt-24 pb-16 px-4 bg-secondary overflow-hidden">
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
        <p className="font-oldforge text-2xl text-primary mb-4">The Venue</p>
        <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">Château de Lacoste</h2>
        <div className="w-24 h-[1px] bg-secondary mx-auto mb-6"></div>
        <p className="font-cormorant text-xl text-stone-800 mb-4">
          In the heart of the Périgord Noir, overlooking the Dordogne valley and its famous feudal castles,
          Château de Lacoste sits in Castelnaud-la-Chapelle. Its refined 18th-century architecture,
          French formal garden with boxwood and roses, and breathtaking views make it an indisputably
          romantic venue for unforgettable moments.
        </p>
        <p className="font-sans text-sm tracking-widest text-stone-600 uppercase mb-6">Protected cultural heritage · 3 hectares of park · Infinity pool & chapel</p>
        <a
          href="https://www.chateau-de-lacoste.fr/lacoste?lang=en"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 px-6 py-2 rounded-md font-sans text-sm font-medium"
        >
          Visit Château de Lacoste
        </a>
      </div>
    </section>
  );
}
