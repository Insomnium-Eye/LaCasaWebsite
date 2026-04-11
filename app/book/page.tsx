"use client";

import { useMemo, useState } from "react";
import { units } from "../../data/units";

const initialState = {
  name: "",
  email: "",
  guests: 2,
  unit: "bungalow-1",
  checkIn: "",
  checkOut: ""
};

function parseDate(value: string) {
  return value ? new Date(value) : null;
}

function daysBetween(start: string, end: string) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate || !endDate || endDate <= startDate) return 0;
  const diff = endDate.getTime() - startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function BookPage() {
  const [form, setForm] = useState(initialState);
  const nights = useMemo(() => daysBetween(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);
  const selectedUnit = units.find((unit) => unit.slug === form.unit) ?? units[0];
  const subtotal = nights * selectedUnit.rate;
  const discount = subtotal * 0.1;
  const total = subtotal - discount;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Bookings</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Reserve your stay with a direct 10% discount.</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-700">
          Select your unit, choose dates, and see your savings right away. After booking, your confirmation will include a digital access code.
        </p>
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <form className="space-y-6 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                placeholder="Your full name"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Email</span>
              <input
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                placeholder="you@example.com"
              />
            </label>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Unit</span>
              <select
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
              >
                {units.map((unit) => (
                  <option key={unit.slug} value={unit.slug}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Guests</span>
              <input
                type="number"
                min={1}
                max={2}
                value={form.guests}
                onChange={(event) => setForm({ ...form, guests: Number(event.target.value) })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
              />
            </label>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Check-in</span>
              <input
                type="date"
                value={form.checkIn}
                onChange={(event) => setForm({ ...form, checkIn: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Check-out</span>
              <input
                type="date"
                value={form.checkOut}
                onChange={(event) => setForm({ ...form, checkOut: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
              />
            </label>
          </div>
          <button type="button" className="inline-flex items-center justify-center rounded-full bg-garden px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3c5a35]">
            Request booking details
          </button>
        </form>

        <aside className="space-y-6 rounded-4xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <div className="rounded-4xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Rate summary</p>
            <p className="mt-4 text-slate-700">{selectedUnit.name} · {selectedUnit.capacity} guests</p>
            <div className="mt-6 space-y-3 text-slate-700">
              <p>Nightly rate: ${selectedUnit.rate.toFixed(0)}</p>
              <p>Nights: {nights || 0}</p>
              <p>Subtotal: ${subtotal.toFixed(0)}</p>
              <p className="font-semibold text-slate-900">Direct discount: 10% (-${discount.toFixed(0)})</p>
            </div>
            <div className="mt-6 rounded-3xl bg-garden px-5 py-4 text-white">
              <p className="text-sm uppercase tracking-[0.24em]">Estimated total</p>
              <p className="mt-2 text-3xl font-semibold">${total.toFixed(0)}</p>
            </div>
          </div>
          <div className="rounded-4xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Booking notes</p>
            <ul className="mt-4 space-y-3 text-slate-600">
              <li>Instant 10% discount for direct reservations.</li>
              <li>Standard check-in after 3:00 PM.</li>
              <li>Digital access code sent by email with reservation confirmation.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
