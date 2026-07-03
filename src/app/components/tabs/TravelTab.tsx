'use client';

import { useTranslations } from 'next-intl';

export default function TravelTab() {
  const t = useTranslations('Travel');

  return (
    <section className="min-h-dvh pt-24 pb-16 px-4 bg-secondary">
      <main className="max-w-3xl mx-auto">
        <p className="font-oldforge uppercase text-2xl text-primary mb-2">{t('sectionTitle')}</p>
        <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">{t('heading')}</h2>
        <div className="w-24 h-[1px] bg-secondary mb-10"></div>
        <p className="font-oldforge text-xl text-stone-800 mb-12">
          {t('intro')}
        </p>
        <div className="mb-14">
          <h3 className="font-oldforge uppercase text-2xl md:text-3xl text-primary mb-4">{t('suggestedAirports')}</h3>
          <div className="space-y-6 font-oldforge text-lg text-stone-800">
            <div className="border-l-2 border-secondary pl-6">
              <h4 className="font-oldforge font-semibold text-primary mb-1">{t('bordeauxName')}</h4>
              <p>{t('bordeauxDescription')}</p>
            </div>
            <div className="border-l-2 border-secondary pl-6">
              <h4 className="font-oldforge font-semibold text-primary mb-1">{t('toulouseName')}</h4>
              <p>{t('toulouseDescription')}</p>
            </div>
            <div className="border-l-2 border-secondary pl-6">
              <h4 className="font-oldforge font-semibold text-primary mb-1">{t('parisName')}</h4>
              <p>{t('parisDescription')}</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-oldforge uppercase text-2xl md:text-3xl text-primary mb-4">{t('byCarTitle')}</h3>
          <p className="font-oldforge text-lg text-stone-800 mb-6">
            {t('byCarDescription')}
          </p>
          <p className="font-oldforge text-sm text-stone-600">
            {t('byCarNote')}
          </p>
        </div>
      </main>
    </section>
  );
}
