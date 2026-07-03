'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import Divider from '../Divider';

const FAQ_DIVIDERS = [
  '/images/dividers/divider3.png',
  '/images/dividers/divider1.png',
];

const FAQ_KEYS = ['accommodations', 'dressCode', 'indoorsOutdoors', 'extraGuests', 'rsvpDeadline', 'dietary', 'registry'];

function formatAnswer(text: string): React.ReactNode {
  return text.split('\n').map((line, lineIndex) => {
    const segments = line.split(/\*\*(.*?)\*\*/g);
    return (
      <Fragment key={lineIndex}>
        {lineIndex > 0 && <br />}
        {segments.map((segment, segIndex) =>
          segIndex % 2 === 1 ? (
            <strong key={segIndex} className="font-semibold text-stone-900">
              {segment}
            </strong>
          ) : (
            segment
          )
        )}
      </Fragment>
    );
  });
}

export default function FAQTab() {
  const t = useTranslations('FAQ');

  const faqItems = FAQ_KEYS.map(key => ({
    question: t(`${key}_q`),
    answer: t(`${key}_a`),
  }));

  return (
    <section className="min-h-dvh pt-24 pb-16 px-4 bg-secondary">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-14">
          <p className="font-oldforge text-2xl text-primary mb-2">{t('sectionTitle')}</p>
          <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">
            {t('heading')}
          </h2>
          <div className="w-24 h-[1px] bg-primary mx-auto" />
        </header>

        <div className="space-y-0">
          {faqItems.map((item, index) => (
            <Fragment key={index}>
              <article className="py-6">
                <h3 className="font-oldforge text-2xl md:text-3xl text-primary mb-4 uppercase">
                  {item.question}
                </h3>
                <div className="font-oldforge text-lg text-stone-800 leading-relaxed">
                  {item.answer ? formatAnswer(item.answer) : null}
                </div>
              </article>
              {index < faqItems.length - 1 && (
                <Divider src={FAQ_DIVIDERS[index % FAQ_DIVIDERS.length]} />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
