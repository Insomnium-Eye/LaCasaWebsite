import Link from "next/link";
import { units } from "../../data/units";

export default function UnitsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Available units</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Your private bungalow or bedroom.</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-700">
          Select the unit that fits your stay and check availability instantly with direct booking savings.
        </p>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {units.map((unit) => (
          <article key={unit.slug} className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-56 rounded-3xl bg-slate-100 p-6 text-slate-500">Photo preview</div>
            <div className="mt-6 space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{unit.type}</p>
              <h2 className="text-2xl font-semibold text-slate-900">{unit.name}</h2>
              <p className="text-slate-600">{unit.summary}</p>
              <ul className="space-y-2 text-slate-600">
                <li>Capacity: {unit.capacity} guests</li>
                <li>{unit.bathroom}</li>
                <li>{unit.terrace}</li>
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                <p className="text-lg font-semibold text-slate-900">${unit.rate}/night</p>
                <Link href="/book" className="rounded-full bg-garden px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3c5a35]">
                  Check availability
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
