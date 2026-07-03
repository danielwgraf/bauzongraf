'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function VenueTab() {
  const t = useTranslations('Venue');

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
        <p className="font-oldforge text-2xl text-primary mb-4 uppercase">{t('sectionTitle')}</p>
        <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">{t('heading')}</h2>
        <div className="w-24 h-[1px] bg-primary mx-auto mb-6" />
        <p className="font-oldforge text-xl text-stone-800 mb-4 text-left max-w-2xl mx-auto">
          {t('description1')}
        </p>
        <p className="font-oldforge text-xl text-stone-800 mb-4 text-left max-w-2xl mx-auto">
          {t('description2')}
        </p>
        <a
          href="https://www.chateau-de-lacoste.fr/lacoste?lang=en"
          target="_blank"
          rel="noopener noreferrer"
          className="font-oldforge uppercase inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 px-6 py-2 rounded-md font-sans text-sm font-medium"
        >
          {t('visitLink')}
        </a>
      </div>
      <div
        className="relative z-10 w-full min-h-[20vh] md:hidden pointer-events-none"
        aria-hidden
      />
    </section>
  );
}
