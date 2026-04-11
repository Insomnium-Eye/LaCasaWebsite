const amenities = [
  "Mature fruit orchards with mango, guava, avocado and lemon",
  "Stargazing bathtub with retractable roof",
  "Indoor/outdoor fish fountain and landscaped terraces",
  "Comprehensive mosquito control with nets and traps",
  "Private parking for up to 7 vehicles",
  "Rainwater harvesting with dual cistern system",
  "Security cameras and electrified perimeter fence",
  "Contactless digital lock entry"
];

export default function AmenitiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Amenities</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Comfort and convenience at every stay.</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-700">
          Enjoy thoughtfully selected features designed for privacy, relaxation, and a superior direct-booking experience.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {amenities.map((item) => (
          <div key={item} className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-lg font-semibold text-slate-900">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
