import { NextResponse } from 'next/server';

const ICAL_ENV: Record<string, string> = {
  'bungalow-1': 'AIRBNB_ICAL_BUNGALOW_1',
  'bungalow-2': 'AIRBNB_ICAL_BUNGALOW_2',
  'main-bedroom': 'AIRBNB_ICAL_MAIN_BEDROOM',
};

function parseIcalDate(str: string): Date {
  const s = str.replace(/[TZ]/g, '').trim();
  return new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)));
}

function parseIcal(text: string): { start: Date; end: Date }[] {
  const unfolded = text.replace(/\r\n[ \t]/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const events: { start: Date; end: Date }[] = [];
  let inEvent = false, start: Date | null = null, end: Date | null = null;

  for (const line of unfolded.split('\n')) {
    const t = line.trim();
    if (t === 'BEGIN:VEVENT') { inEvent = true; start = null; end = null; }
    else if (t === 'END:VEVENT') { if (inEvent && start && end) events.push({ start, end }); inEvent = false; }
    else if (inEvent) {
      if (t.startsWith('DTSTART')) start = parseIcalDate(t.split(':').slice(1).join(':'));
      else if (t.startsWith('DTEND')) end = parseIcalDate(t.split(':').slice(1).join(':'));
    }
  }
  return events;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 864e5);
}

function fmt(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/**
 * Find the first date from which `minDays` consecutive days are fully unblocked.
 * Candidates: today, and every booking end-date (the next "open" moment after each block).
 */
function firstAvailable(events: { start: Date; end: Date }[], minDays: number, today: Date): string {
  const candidates = [today, ...events.map(e => e.end)]
    .filter(d => d >= today)
    .sort((a, b) => a.getTime() - b.getTime());

  for (const from of candidates) {
    const to = addDays(from, minDays);
    const blocked = events.some(e => e.start < to && e.end > from);
    if (!blocked) {
      return from <= today ? 'Available now' : `Available ${fmt(from)}`;
    }
  }

  return 'Contact us for dates';
}

function computeAvailability(events: { start: Date; end: Date }[]) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  // Only consider future-relevant blocks
  const future = events.filter(e => e.end > today);

  return {
    nightly:     firstAvailable(future, 1,   today),
    oneToThree:  firstAvailable(future, 30,  today),
    threeToSix:  firstAvailable(future, 90,  today),
    sixToTwelve: firstAvailable(future, 180, today),
    annual:      firstAvailable(future, 365, today),
  };
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const envKey = ICAL_ENV[slug];
  const icalUrl = envKey ? process.env[envKey] : undefined;

  if (!icalUrl) {
    return NextResponse.json({
      nightly: 'Add iCal URL to see', oneToThree: 'Add iCal URL to see',
      threeToSix: 'Add iCal URL to see', sixToTwelve: 'Add iCal URL to see',
      annual: 'Add iCal URL to see', configured: false,
    });
  }

  try {
    const res = await fetch(icalUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return NextResponse.json({ error: 'Calendar fetch failed' }, { status: 502 });
    return NextResponse.json(computeAvailability(parseIcal(await res.text())));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
