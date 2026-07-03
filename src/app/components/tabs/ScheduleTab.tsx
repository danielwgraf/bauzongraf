'use client';

import { useTranslations } from 'next-intl';

export default function ScheduleTab() {
  const t = useTranslations('Schedule');

  return (
    <section className="min-h-dvh pt-24 pb-16 px-4 bg-secondary">
      <div className="max-w-3xl mx-auto">
        <p className="font-oldforge uppercase text-2xl text-primary mb-2">{t('sectionTitle')}</p>
        <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">{t('heading')}</h2>
        <div className="w-24 h-[1px] bg-primary mb-10" />

        <p className="font-oldforge text-xl text-stone-800 mb-12">
          {t('intro')}
        </p>

        <div className="space-y-10">
          <div className="border-l-2 border-primary/30 pl-6">
            <h3 className="font-oldforge uppercase font-semibold text-primary text-lg mb-1">{t('thursdayDate')}</h3>
            <p className="font-oldforge text-xl text-stone-800">{t('thursdayEvent')}</p>
          </div>

          <div className="border-l-2 border-primary/30 pl-6">
            <h3 className="font-oldforge uppercase font-semibold text-primary text-lg mb-1">{t('fridayDate')}</h3>
            <p className="font-oldforge text-xl text-stone-800">{t('fridayEvent')}</p>
          </div>

          <div className="border-l-2 border-primary/30 pl-6">
            <h3 className="font-oldforge uppercase font-semibold text-primary text-lg mb-1">{t('saturdayDate')}</h3>
            <p className="font-oldforge text-xl text-stone-800">{t('saturdayEvent')}</p>
          </div>

          <div className="border-l-2 border-primary/30 pl-6">
            <h3 className="font-oldforge uppercase font-semibold text-primary text-lg mb-1">{t('sundayDate')}</h3>
            <p className="font-oldforge text-xl text-stone-800">{t('sundayEvent')}</p>
          </div>
        </div>

        <p className="font-oldforge text-stone-600 mt-12 italic">
          {t('note')}
        </p>
      </div>
    </section>
  );
}
