'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Divider from '../Divider';

interface LandingTabProps {
  onGoToRsvp: () => void;
}

export default function LandingTab({ onGoToRsvp }: LandingTabProps) {
  const [opened, setOpened] = useState(false);
  const [detailsOpened, setDetailsOpened] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 769px)');

    const sync = () => {
      if (mql.matches) setOpened(true);
    };

    sync();
    // Keep this compatible with older Safari implementations.
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', sync);
      return () => mql.removeEventListener('change', sync);
    }

    // eslint-disable-next-line deprecation/deprecation
    mql.addListener(sync);
    // eslint-disable-next-line deprecation/deprecation
    return () => mql.removeListener(sync);
  }, []);

  return (
    <section className="min-h-screen relative pt-14 bg-secondary">
      <div className="absolute inset-x-0 bottom-0 top-14 flex items-center justify-center overflow-hidden bg-secondary">
        <div className="landing-frame relative overflow-hidden [container-type:size] [container-name:frame]">
          {/* Mobile initial view: monogram only. After opening: reveal frame + text. */}
          <div
            className={`letter-frame-reveal ${opened ? 'letter-open' : ''} hidden md:block`}
            aria-hidden
          >
            <Image
              src="/images/small_frame.png"
              alt=""
              fill
              className="object-contain object-center md:rotate-90"
              sizes="100vw"
              priority
            />
          </div>

          <div
            className={`letter-monogram-reveal ${opened ? 'letter-open' : ''} md:hidden`}
            aria-hidden
          >
            <Image
              src="/images/monogram.png"
              alt=""
              fill
              className="object-contain"
              sizes="50vw"
              priority
            />
          </div>

          <button
            type="button"
            className={`letter-open-button md:hidden font-oldforge uppercase inline-block border-2 border-primary text-primary bg-secondary/60 backdrop-blur-sm hover:bg-primary hover:text-white transition-colors duration-300 px-6 py-2.5 rounded-md ${
              opened ? 'letter-open-button-hide' : ''
            }`}
            onClick={() => {
              setOpened(true);
              setDetailsOpened(false);
            }}
            aria-label="Open the invitation"
            aria-expanded={opened}
          >
            Open
          </button>

          <div
            className={`absolute inset-[12%] md:inset-[15%] flex flex-col items-center justify-center text-center letter-text-reveal ${
              opened ? 'letter-open' : ''
            }`}
            aria-hidden={!opened}
          >
            <div className="landing-overlay-content origin-center">
              {/* Mobile: staggered open + details toggle */}
              <div className="md:hidden">
                <p className="letter-stagger letter-stagger-1 font-oldforge text-lg md:text-lg lg:text-xl mb-0.5 text-primary">
                  DEAREST FAMILY & FRIENDS
                </p>

                <div className="letter-stagger letter-stagger-2 grid grid-cols-[auto_auto_auto] grid-rows-3 gap-y-0 mb-3 md:mb-4 w-max max-w-full mx-auto items-end">
                  <h1 className="col-start-1 row-start-1 font-parochus-original text-5xl md:text-6xl lg:text-7xl text-primary text-right leading-[0.85] -mb-[0.15em]">
                    Macy
                  </h1>
                  <h1 className="col-start-2 row-start-1 font-parochus-original text-5xl md:text-6xl lg:text-7xl text-primary text-right leading-[0.85] -mb-[0.15em]">
                    Bauzon
                  </h1>
                  <p className="col-start-2 row-start-2 font-parochus-original text-2xl md:text-3xl lg:text-4xl text-primary leading-none text-center -my-[0.1em]">
                    &#38;
                  </p>
                  <h1 className="col-start-2 row-start-3 font-parochus-original text-5xl md:text-6xl lg:text-7xl text-primary text-left leading-[0.85]">
                    Daniel
                  </h1>
                  <h1 className="col-start-3 row-start-3 font-parochus-original text-5xl md:text-6xl lg:text-7xl text-primary text-left leading-[0.85]">
                    Graf
                  </h1>
                </div>

                <div className="letter-stagger letter-stagger-3">
                  <p className="font-oldforge text-lg md:text-lg lg:text-xl mb-0.5 text-primary">
                    REQUEST YOUR PRESENCE
                  </p>
                  <p className="font-oldforge text-lg md:text-lg lg:text-xl mb-0.5 text-primary">
                    TO CELEBRATE THEIR MARRIAGE
                  </p>
                </div>

                <button
                  type="button"
                  className="letter-stagger letter-stagger-4 font-oldforge uppercase inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 px-6 py-2.5 rounded-md font-sans text-lg md:text-xl"
                  onClick={() => setDetailsOpened((v) => !v)}
                  aria-expanded={detailsOpened}
                >
                  {detailsOpened ? 'Hide details' : 'Details'}
                </button>

                <div
                  className={`mobile-details ${detailsOpened ? 'mobile-details-open' : ''}`}
                  aria-hidden={!detailsOpened}
                >
                  <Divider src="/images/dividers/divider1.png" className="my-4 w-[30%] mx-auto" />
                  <p className="font-oldforge text-base text-stone-800 mb-0.5">
                    3. October 2026
                  </p>
                  <p className="font-oldforge text-sm tracking-widest text-primary mb-0.5">
                    0:00 in the evening
                  </p>
                  <p className="font-oldforge text-sm mt-1 text-stone-700">
                    Château de Lacoste
                  </p>
                  <p className="font-oldforge text-sm mt-0.5 text-stone-700">
                    Castelnaud-la-Chapelle, France
                  </p>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={onGoToRsvp}
                      className="font-oldforge uppercase inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 px-6 py-2.5 rounded-md font-sans text-lg"
                    >
                      Save Your Seat
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop: original full content (no stagger / no details toggle) */}
              <div className="hidden md:block">
                <p className="font-oldforge text-lg md:text-lg lg:text-xl mb-0.5 text-primary">
                  DEAREST FAMILY & FRIENDS
                </p>
                <div className="grid grid-cols-[auto_auto_auto] grid-rows-3 gap-y-0 mb-3 md:mb-4 w-max max-w-full mx-auto items-end">
                  <h1 className="col-start-1 row-start-1 font-parochus-original text-5xl md:text-6xl lg:text-7xl text-primary text-right leading-[0.85] -mb-[0.15em]">
                    Macy
                  </h1>
                  <h1 className="col-start-2 row-start-1 font-parochus-original text-5xl md:text-6xl lg:text-7xl text-primary text-right leading-[0.85] -mb-[0.15em]">
                    Bauzon
                  </h1>
                  <p className="col-start-2 row-start-2 font-parochus-original text-2xl md:text-3xl lg:text-4xl text-primary leading-none text-center -my-[0.1em]">
                    &#38;
                  </p>
                  <h1 className="col-start-2 row-start-3 font-parochus-original text-5xl md:text-6xl lg:text-7xl text-primary text-left leading-[0.85]">
                    Daniel
                  </h1>
                  <h1 className="col-start-3 row-start-3 font-parochus-original text-5xl md:text-6xl lg:text-7xl text-primary text-left leading-[0.85]">
                    Graf
                  </h1>
                </div>
                <p className="font-oldforge text-lg md:text-lg lg:text-xl mb-0.5 text-primary">
                  REQUEST YOUR PRESENCE
                </p>
                <p className="font-oldforge text-lg md:text-lg lg:text-xl mb-0.5 text-primary">
                  TO CELEBRATE THEIR MARRIAGE
                </p>
                <Divider
                  src="/images/dividers/divider1.png"
                  className="my-4 md:my-5 w-[30%] mx-auto"
                />
                <p className="font-oldforge text-base md:text-lg lg:text-xl mb-0.5 text-stone-800">
                  3. October 2026
                </p>
                <p className="font-oldforge text-sm md:text-base tracking-widest text-primary mb-0.5">
                  0:00 in the evening
                </p>
                <p className="font-oldforge text-sm md:text-base mt-1 text-stone-700">
                  Château de Lacoste
                </p>
                <p className="font-oldforge text-sm md:text-base mt-0.5 text-stone-700">
                  Castelnaud-la-Chapelle, France
                </p>
                <div className="mt-6 md:mt-8">
                  <button
                    type="button"
                    onClick={onGoToRsvp}
                    className="font-oldforge uppercase inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 px-6 py-2.5 md:px-8 md:py-3 rounded-md font-sans text-lg md:text-xl"
                  >
                    Save Your Seat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
