export default function ScheduleTab() {
  return (
    <section className="min-h-screen pt-24 pb-16 px-4 bg-secondary">
      <div className="max-w-3xl mx-auto">
        <p className="font-oldforge uppercase text-2xl text-primary mb-2">The Weekend</p>
        <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">Schedule</h2>
        <div className="w-24 h-[1px] bg-primary mb-10" />

        <p className="font-oldforge text-xl text-stone-800 mb-12">
          We can’t wait to celebrate with you at Château de Lacoste. Here’s what we have planned from Thursday through Sunday.
        </p>

        <div className="space-y-10">
          <div className="border-l-2 border-primary/30 pl-6">
            <h3 className="font-oldforge uppercase font-semibold text-primary text-lg mb-1">Thursday, October 1st</h3>
            <p className="font-oldforge text-xl text-stone-800">Welcome dinner</p>
          </div>

          <div className="border-l-2 border-primary/30 pl-6">
            <h3 className="font-oldforge uppercase font-semibold text-primary text-lg mb-1">Friday, October 2nd</h3>
            <p className="font-oldforge text-xl text-stone-800">Rehearsal dinner</p>
          </div>

          <div className="border-l-2 border-primary/30 pl-6">
            <h3 className="font-oldforge uppercase font-semibold text-primary text-lg mb-1">Saturday, October 3rd</h3>
            <p className="font-oldforge text-xl text-stone-800">Wedding ceremony &amp; reception</p>
          </div>

          <div className="border-l-2 border-primary/30 pl-6">
            <h3 className="font-oldforge uppercase font-semibold text-primary text-lg mb-1">Sunday, October 4th</h3>
            <p className="font-oldforge text-xl text-stone-800">Farewell brunch</p>
          </div>
        </div>

        <p className="font-oldforge text-stone-600 mt-12 italic">
          Times and further details will be shared closer to the date.
        </p>
      </div>
    </section>
  );
}
