const faqs = [
  { question: "How do I book directly?", answer: "Use the booking page to select dates, unit, and guest details. You will automatically receive a 10% direct-booking discount." },
  { question: "What is your cancellation policy?", answer: "Cancellations are accepted up to 7 days before arrival for a full refund. Please contact us for any changes." },
  { question: "Is transport available?", answer: "We can help arrange transportation to the Zócalo, Monte Albán, and other local destinations for an extra service fee." },
  { question: "Are there mosquito protections?", answer: "Yes. Each unit is equipped with bed nets, Bti solutions, and traps to keep your stay comfortable." }
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">FAQs</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Questions most guests ask.</h1>
      </div>
      <div className="mt-12 space-y-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xl font-semibold text-slate-900">{faq.question}</p>
            <p className="mt-3 text-slate-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
