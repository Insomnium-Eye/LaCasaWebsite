export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Contact</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Get in touch with La Casa.</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-700">
          Send us your message or reservation request. You can also reach out directly via WhatsApp or email.
        </p>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-6">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Name</span>
              <input className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20" placeholder="Your name" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Email</span>
              <input className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20" placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Message</span>
              <textarea className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20" rows={5} placeholder="Tell us about your trip" />
            </label>
            <button type="button" className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47]">
              Send message
            </button>
          </form>
        </div>
        <div className="rounded-4xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <div className="space-y-4">
            <p className="text-lg font-semibold text-slate-900">Contact details</p>
            <p className="text-slate-600">Email: hello@lacasaoaxaca.mx</p>
            <p className="text-slate-600">WhatsApp: +52 951 123 4567</p>
            <p className="text-slate-600">Location: San Felipe del Agua, Oaxaca, Mexico</p>
          </div>
        </div>
      </div>
    </div>
  );
}
