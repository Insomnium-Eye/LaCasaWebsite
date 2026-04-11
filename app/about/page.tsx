export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[0.9fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">About La Casa</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">A timeless retreat nestled in San Felipe del Agua.</h1>
          <p className="text-lg leading-8 text-slate-700">
            La Casa blends Oaxacan adobe-inspired design, private gardens, and modern comfort. Each unit offers a quiet, intimate atmosphere framed by landscaped grounds and fruit trees.
          </p>
        </div>
        <div className="rounded-4xl bg-slate-100 p-10 text-slate-700 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Why guests choose us</h2>
          <ul className="mt-6 space-y-4 text-slate-600">
            <li>Direct booking with instant 10% discount.</li>
            <li>Private parking, contactless digital locks, and mosquito-safe sleeping areas.</li>
            <li>Authentic garden living with nearby cultural attractions.</li>
          </ul>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        {[
          { title: "Traditional style", description: "Warm textures, calm tones, and indoor/outdoor flow." },
          { title: "Fruit orchard", description: "Avocado, guava, mango, and lemon trees that frame the property." },
          { title: "Quiet and private", description: "Two bungalows plus a main-bedroom option with separate entrances." },
          { title: "Easy access", description: "Minutes from the city center and all Oaxaca attractions." }
        ].map((item) => (
          <div key={item.title} className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-3 text-slate-600">{item.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
