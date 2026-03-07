import { Fragment } from 'react';
import Divider from '../Divider';

/** Divider images between FAQ subsections. Using all four so you can see each option; use a single path to pick one. */
const FAQ_DIVIDERS = [
  '/images/dividers/divider3.png',
  '/images/dividers/divider1.png',
  // '/images/dividers/divider2.png',
  // '/images/dividers/divider4.png',
];

/** Parses answer text: newlines become line breaks, **text** becomes bold. */
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

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: 'What are the accomodations?',
    answer:
      'As a token of our gratitude for traveling to France to celebrate with us, we are delighted to offer accommodation at the château for our guests during the wedding festivities. \n\nThe rooms are charming and historic. However, as the château dates back to the 18th century space and bathrooms will be somewhat limited. Some guests may find the accommodations to be cozy, and rooms will vary in size and layout—as is often the case in historic homes. \n\nShould you prefer more space or additional privacy, you are of course very welcome to arrange your own accommodation nearby. \n\nWe are so grateful you are making the journey to celebrate with us and cannot wait to share this special place together. \n\n**Check-in is on Thursday October 1st at 0:00 AM. Check-out is Sunday October 4th at 0:00 PM.**',
  },
  {
    question: 'Is there a dress code?',
    answer: '**Welcome Dinner**\n\nsdas\n\n**Ceremony & Reception**\n\Our celebration will take place at a château minutes from a small medieval village located in the Dordogne valley, and the evening will be held in black tie attire. We invite our guests to embrace the romantic and unique spirit of the setting.\n\nFormal evening wear is encouraged—tuxedos & floor-length gowns would be great options.\n\nCelebrations will be held outdoors, so guests may want to choose their footwear with this in mind. As October in France can be crisp, guests may wish to bring a wrap, coat, or other layers for the evening.\n\nAbove all, we hope you enjoy the opportunity to dress for the occasion and celebrate with us in a setting that promises to be unforgettable.\n\n**Farewell Brunch**\n\nasdasd',
  },
  {
    question: 'Will the event be indoors or outdoors?',
    answer: 'Weather permitting, the ceremony and the reception will be held outdoors.',
  },
  {
    question: 'Can I bring extra guests?',
    answer: 'We understand that traveling to France is a significant journey, and many guests may choose to travel alongside friends or family. In order to keep our celebration intimate—and due to space limitations at the château—attendance at the wedding events will be limited to those whose names appear on the invitation.\n\nGuests are, of course, very welcome to arrange alternative accommodations if they would prefer to stay with their traveling companions during the weekend.\n\nWe are truly grateful for the effort it takes to join us for this celebration, and we look forward to celebrating with those not in attendance on another occasion.',
  },
  {
    question: 'How long do I have to RSVP?',
    answer: 'We kindly ask that all RSVPs be submitted by Date.\n\nUnfortunately, we will not be able to accommodate late responses. We truly appreciate your understanding, as these timelines allow us to finalize arrangements with our vendors.\n\nThank you for taking a moment to respond promptly—we are so looking forward to celebrating together.',
  },
  {
    question: 'I have dietary restrictions. How do I let you know?',
    answer:
      "Please note any dietary restrictions when you RSVP. We'll pass them along to the caterer so we can take care of you.",
  },
  {
    question: 'Where are you registered?',
    answer:
      "Your presence at our wedding is truly the greatest gift we could ask for, and we are so grateful that you are making the journey to celebrate with us. For this reason, we have chosen not to create a traditional registry, and gifts are certainly not expected.\n\nFor those who have kindly expressed interest in making a contribution, we have included an optional fund on our website. Please know that your love, support, and presence at our celebration mean the world to us.",
  },
];

export default function FAQTab() {
  return (
    <section className="min-h-screen pt-24 pb-16 px-4 bg-secondary">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-14">
          <p className="font-oldforge text-2xl text-primary mb-2">Common questions</p>
          <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-[1px] bg-primary mx-auto" />
        </header>

        <div className="space-y-0">
          {FAQ_ITEMS.map((item, index) => (
            <Fragment key={index}>
              <article className="py-6">
                <h3 className="font-oldforge text-2xl md:text-3xl text-primary mb-4">
                  {item.question}
                </h3>
                <div className="font-cormorant text-lg text-stone-800 leading-relaxed">
                  {item.answer ? formatAnswer(item.answer) : null}
                </div>
              </article>
              {index < FAQ_ITEMS.length - 1 && (
                <Divider src={FAQ_DIVIDERS[index % FAQ_DIVIDERS.length]} />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
