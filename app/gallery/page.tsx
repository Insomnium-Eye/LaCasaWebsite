const galleryItems = [
  "Exterior views", "Garden details", "Sunset patio", "Interior lounge", "Bedroom comfort", "Stargazing bathtub"
];

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Gallery</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">A curated preview of the property.</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-700">
          Responsive photography-style sections with interior, garden, and sunset views designed for an elegant property showcase.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item) => (
          <div key={item} className="group rounded-4xl overflow-hidden bg-slate-100 p-6 text-slate-700 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="h-52 rounded-3xl bg-gradient-to-br from-slate-200 via-adobe to-terracotta" />
            <p className="mt-4 text-lg font-semibold text-slate-900">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
