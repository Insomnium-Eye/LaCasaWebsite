import Link from "next/link";
import { units } from "../data/units";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-terracotta/10 px-3 py-1 text-sm font-semibold text-terracotta">Direct Booking Save 10%</span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            La Casa Oaxaca — Private bungalows and a garden retreat in San Felipe del Agua.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">
            Experience a calm, authentic stay with private verandas, fruit orchard views, stargazing amenities, and contactless direct booking.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/book" className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-[#b55e47]">
              Book Now
            </Link>
            <Link href="/about" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
              About La Casa
            </Link>
          </div>
        </div>
            <div className="rounded-4xl bg-gradient-to-br from-terracotta/10 via-adobe to-sky p-10 text-white shadow-xl shadow-slate-200">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-700">Luxury retreat</p>
            <h2 className="text-3xl font-semibold">Garden, privacy, and authentic Oaxaca style</h2>
            <p className="text-slate-700/90">Enjoy private units surrounded by mature fruit trees, and elegantly minimal architecture designed for peace and relaxation. A 15 minute drive from downown Oaxaca!</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/90 p-5 text-slate-900 shadow-sm">
                <p className="text-xs font-semibold uppercase text-terracotta">Capacity</p>
                <p className="mt-2 text-2xl font-semibold">3-6 guests</p>
              </div>
              <div className="rounded-3xl bg-white/90 p-5 text-slate-900 shadow-sm">
                <p className="text-xs font-semibold uppercase text-garden">Stays</p>
                <p className="mt-2 text-2xl font-semibold">Bungalows + bedroom</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-20 space-y-10">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Fruit orchard", description: "Mango, guava, avocado and lemon trees guests may enjoy." },
            { title: "Stargazing bathtub", description: "Private roof opening for a memorable evening under the stars." },
            { title: "Contactless entry", description: "Digital locks and private parking for ease and safety." }
          ].map((item) => (
            <div key={item.title} className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Available Units</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Choose your private stay</h2>
          </div>
          <Link href="/units" className="text-sm font-semibold text-terracotta hover:text-[#a95b48]">See all units →</Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {units.map((unit) => (
            <article key={unit.slug} className="group rounded-4xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="h-48 rounded-3xl bg-slate-100 p-6 text-slate-500">Photo preview</div>
              <div className="mt-6 space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{unit.type}</p>
                <h3 className="text-2xl font-semibold text-slate-900">{unit.name}</h3>
                <p className="text-slate-600">{unit.summary}</p>
                <p className="text-lg font-semibold text-slate-900">${unit.rate}/night</p>
                <Link href="/book" className="inline-flex items-center rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b55e47]">
                  Check availability
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
