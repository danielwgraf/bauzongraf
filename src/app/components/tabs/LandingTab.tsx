import Image from 'next/image';
import Divider from '../Divider';

interface LandingTabProps {
  onGoToRsvp: () => void;
}

export default function LandingTab({ onGoToRsvp }: LandingTabProps) {
  return (
    <section className="min-h-screen relative pt-14 bg-secondary">
      <div className="absolute inset-x-0 bottom-0 top-14 flex items-center justify-center overflow-hidden bg-secondary">
        <div className="landing-frame relative overflow-hidden [container-type:size] [container-name:frame]">
          <Image
            src="/images/small_frame.png"
            alt=""
            fill
            className="object-contain object-center md:rotate-90"
            sizes="100vw"
            priority
            aria-hidden
          />
          <div className="absolute inset-[12%] md:inset-[15%] flex flex-col items-center justify-center text-center">
          <div className="landing-overlay-content origin-center">
          <p className="font-oldforge text-lg md:text-lg lg:text-xl mb-0.5 text-primary">DEAREST FAMILY & FRIENDS</p>
          <div className="grid grid-cols-[auto_auto_auto] grid-rows-3 gap-y-0 mb-3 md:mb-4 w-max max-w-full mx-auto items-end">
            <h1 className="col-start-1 row-start-1 font-parochus-original text-5xl md:text-6xl lg:text-7xl text-primary text-right leading-[0.85] -mb-[0.15em]">Macy</h1>
            <h1 className="col-start-2 row-start-1 font-parochus-original text-5xl md:text-6xl lg:text-7xl text-primary text-right leading-[0.85] -mb-[0.15em]">Bauzon</h1>
            <p className="col-start-2 row-start-2 font-parochus-original text-2xl md:text-3xl lg:text-4xl text-primary leading-none text-center -my-[0.1em]">&#38;</p>
            <h1 className="col-start-2 row-start-3 font-parochus-original text-5xl md:text-6xl lg:text-7xl text-primary text-left leading-[0.85]">Daniel</h1>
            <h1 className="col-start-3 row-start-3 font-parochus-original text-5xl md:text-6xl lg:text-7xl text-primary text-left leading-[0.85]">Graf</h1>
          </div>
          <p className="font-oldforge text-lg md:text-lg lg:text-xl mb-0.5 text-primary">REQUEST YOUR PRESENCE</p>
          <p className="font-oldforge text-lg md:text-lg lg:text-xl mb-0.5 text-primary">TO CELEBRATE THEIR MARRIAGE</p>
          <Divider src="/images/dividers/divider1.png" className="my-4 md:my-5 w-[30%] mx-auto" />
          <p className="font-oldforge text-base md:text-lg lg:text-xl mb-0.5 text-stone-800">3. October 2026</p>
          <p className="font-oldforge text-sm md:text-base tracking-widest text-primary mb-0.5">0:00 in the evening</p>
          <p className="font-oldforge text-sm md:text-base mt-1 text-stone-700">Château de Lacoste</p>
          <p className="font-oldforge text-sm md:text-base mt-0.5 text-stone-700">Castelnaud-la-Chapelle, France</p>
          <div className="mt-6 md:mt-8">
            <button type="button" onClick={onGoToRsvp} className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 px-6 py-2.5 md:px-8 md:py-3 rounded-md font-sans text-lg md:text-xl">Save Your Seat</button>
          </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
