'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Divider from '../Divider';

interface LandingTabProps {
  onGoToRsvp: () => void;
  /** Session state from parent: user already finished mobile steps once this visit */
  mobileIntroComplete: boolean;
  onMobileIntroComplete: () => void;
}

const MOBILE_STEP_LAST = 3 as const;

export default function LandingTab({
  onGoToRsvp,
  mobileIntroComplete,
  onMobileIntroComplete,
}: LandingTabProps) {
  const t = useTranslations('Landing');
  const [opened, setOpened] = useState(false);
  /** Mobile-only: 1 combined intro → 2 details → 3 full summary */
  const [mobileStep, setMobileStep] = useState(1);

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

  /** Mobile: parent says intro was completed earlier this session — show summary immediately */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mobileIntroComplete) return;
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    setOpened(true);
    setMobileStep(MOBILE_STEP_LAST);
  }, [mobileIntroComplete]);

  /** Notify parent when user reaches the summary step (mobile) */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    if (!opened || mobileStep !== MOBILE_STEP_LAST) return;
    onMobileIntroComplete();
  }, [opened, mobileStep, onMobileIntroComplete]);

  return (
    <section className="min-h-dvh relative pt-14 bg-secondary">
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
              src="/images/monogram_red.png"
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
              setMobileStep(1);
            }}
            aria-label={t('openInvitation')}
            aria-expanded={opened}
          >
            {t('open')}
          </button>

          <div
            className={`absolute inset-[12%] md:inset-[15%] flex flex-col items-center justify-center text-center letter-text-reveal ${
              opened ? 'letter-open' : ''
            }`}
            aria-hidden={!opened}
          >
            <div className="landing-overlay-content origin-center">
              {/* Mobile: step through with Next, then full summary */}
              <div className="md:hidden w-full max-w-[min(100%,22rem)] mx-auto flex flex-col items-center min-h-[42vh] justify-center px-1">
                <div
                  key={mobileStep}
                  className="landing-mobile-step-enter w-full flex flex-col items-center text-center"
                >
                  {mobileStep === 1 && (
                    <>
                      <p className="font-oldforge text-2xl sm:text-3xl mb-2 text-primary leading-snug">
                        {t('dearestFamilyFriends')}
                      </p>
                      <div className="grid grid-cols-[auto_auto_auto] space-y-2 grid-rows-3 gap-y-0 mb-2 w-max max-w-full mx-auto items-end">
                        <h1 className="col-start-1 row-start-1 font-parochus-original text-6xl sm:text-7xl text-primary text-center leading-[0.85] -mb-[0.15em]">
                          Macy
                        </h1>
                        <h1 className="col-start-2 row-start-1 font-parochus-original text-6xl sm:text-7xl text-primary text-center leading-[0.85] -mb-[0.15em]">
                          Bauzon
                        </h1>
                        <p className="col-start-2 row-start-2 font-parochus-original text-4xl sm:text-5xl text-primary leading-none text-left -my-[0.1em]">
                          &#38;
                        </p>
                        <h1 className="col-start-1 row-start-3 font-parochus-original text-6xl sm:text-7xl text-primary text-center leading-[0.85]">
                          Daniel
                        </h1>
                        <h1 className="col-start-2 row-start-3 font-parochus-original text-6xl sm:text-7xl text-primary text-center leading-[0.85]">
                          Graf
                        </h1>
                      </div>
                      <div className="space-y-2">
                        <p className="font-oldforge text-xl sm:text-2xl text-primary leading-snug">
                          {t('requestPresence')}
                        </p>
                        <p className="font-oldforge text-xl sm:text-2xl text-primary leading-snug">
                          {t('celebrateMarriage')}
                        </p>
                      </div>
                    </>
                  )}

                  {mobileStep === 2 && (
                    <div className="w-full space-y-8 py-1">
                      <div className="space-y-2">
                        <p className="font-oldforge text-2xl tracking-[0.25em] text-primary uppercase">
                          {t('when')}
                        </p>
                        <h2 className="font-parochus-original text-5xl text-primary leading-tight">
                          {t('weddingDate')}
                        </h2>
                      </div>
                      <div className="space-y-3">
                        <Divider src="/images/dividers/divider1.png" className="my-2 w-[50%] mx-auto" />
                      </div>
                      <div className="space-y-3">
                        <p className="font-oldforge text-2xl tracking-[0.25em] text-primary uppercase">
                          {t('where')}
                        </p>
                        <h3 className="font-parochus-original text-5xl text-primary leading-snug">
                          {t('venueName')}
                        </h3>
                        <p className="font-oldforge text-xl sm:text-2xl text-stone-800 font-medium tracking-wide">
                          {t('venueLocation')}
                        </p>
                      </div>
                    </div>
                  )}

                  {mobileStep === MOBILE_STEP_LAST && (
                    <div className="w-full space-y-3 text-balance">
                      <p className="font-oldforge text-xl text-primary">{t('dearestFamilyFriends')}</p>
                      <div className="grid grid-cols-[auto_auto_auto] grid-rows-3 gap-y-0 w-max max-w-full mx-auto items-end justify-center">
                        <h2 className="col-start-1 row-start-1 font-parochus-original text-5xl sm:text-6xl text-primary text-right leading-[0.85] -mb-[0.15em]">
                          Macy
                        </h2>
                        <h2 className="col-start-2 row-start-1 font-parochus-original text-5xl sm:text-6xl text-primary text-right leading-[0.85] -mb-[0.15em]">
                          Bauzon
                        </h2>
                        <p className="col-start-2 row-start-2 font-parochus-original text-3xl sm:text-4xl text-primary leading-none text-center -my-[0.1em]">
                          &#38;
                        </p>
                        <h2 className="col-start-2 row-start-3 font-parochus-original text-5xl sm:text-6xl text-primary text-left leading-[0.85]">
                          Daniel
                        </h2>
                        <h2 className="col-start-3 row-start-3 font-parochus-original text-5xl sm:text-6xl text-primary text-left leading-[0.85]">
                          Graf
                        </h2>
                      </div>
                      <p className="font-oldforge text-base text-xl text-primary pt-1">
                        {t('requestPresenceFull')}
                      </p>
                      <div className="space-y-2">
                        <Divider src="/images/dividers/divider1.png" className="my-2 w-[40%] mx-auto" />
                      </div>
                      <p className="font-oldforge text-xl text-stone-800">{t('weddingDate')}</p>
                      {/* <p className="font-oldforge text-base text-stone-800">3. October 2026 · 0:00 in the evening</p> */}
                      <p className="font-oldforge text-lg text-stone-700">
                        {t('venueShort')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 w-full flex flex-col items-center gap-3">
                  {mobileStep === 1 ? (
                    <button
                      type="button"
                      className="font-oldforge uppercase inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 px-8 py-3 rounded-md font-sans text-lg w-full max-w-xs"
                      onClick={() => setMobileStep((s) => Math.min(MOBILE_STEP_LAST, s + 1))}
                    >
                      {t('details')}
                    </button>
                  ) : mobileStep === 2 ? (
                    <button
                      type="button"
                      className="font-oldforge uppercase inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 px-8 py-3 rounded-md font-sans text-lg w-full max-w-xs"
                      onClick={() => setMobileStep((s) => Math.min(MOBILE_STEP_LAST, s + 1))}
                    >
                      {t('summary')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onGoToRsvp}
                      className="font-oldforge uppercase inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 px-8 py-3 rounded-md font-sans text-lg w-full max-w-xs"
                    >
                      {t('saveYourSeat')}
                    </button>
                  )}
                </div>
              </div>

              {/* Desktop: original full content */}
              <div className="hidden md:block">
                <p className="font-oldforge text-lg md:text-lg lg:text-xl mb-0.5 text-primary">
                  {t('dearestFamilyFriends')}
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
                  {t('requestPresence')}
                </p>
                <p className="font-oldforge text-lg md:text-lg lg:text-xl mb-0.5 text-primary">
                  {t('celebrateMarriage')}
                </p>
                <Divider
                  src="/images/dividers/divider1.png"
                  className="my-4 md:my-5 w-[30%] mx-auto"
                />
                <p className="font-oldforge text-base md:text-lg lg:text-xl mb-0.5 text-stone-800">
                  {t('weddingDate')}
                </p>
                <p className="font-oldforge text-sm md:text-base mt-1 text-stone-700">
                  {t('venueName')}
                </p>
                <p className="font-oldforge text-sm md:text-base mt-0.5 text-stone-700">
                  {t('venueLocation')}
                </p>
                <div className="mt-6 md:mt-8">
                  <button
                    type="button"
                    onClick={onGoToRsvp}
                    className="font-oldforge uppercase inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 px-6 py-2.5 md:px-8 md:py-3 rounded-md font-sans text-lg md:text-xl"
                  >
                    {t('saveYourSeat')}
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
