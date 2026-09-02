import { NextResponse } from 'next/server';

const ICAL_ENV: Record<string, string> = {
  'bungalow-1': 'AIRBNB_ICAL_BUNGALOW_1',
  'bungalow-2': 'AIRBNB_ICAL_BUNGALOW_2',
  'main-bedroom': 'AIRBNB_ICAL_MAIN_BEDROOM',
};

function parseIcalDate(str: string): Date {
  // Handles YYYYMMDD or YYYYMMDDTHHMMSSZ — we only care about the date part
  const s = str.replace(/[TZ]/g, '').trim();
  const y = parseInt(s.slice(0, 4));
  const m = parseInt(s.slice(4, 6)) - 1;
  const d = parseInt(s.slice(6, 8));
  return new Date(Date.UTC(y, m, d));
}

function parseIcal(text: string): { start: Date; end: Date }[] {
  // Unfold RFC 5545 line continuations
  const unfolded = text.replace(/\r\n[ \t]/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = unfolded.split('\n');

  const events: { start: Date; end: Date }[] = [];
  let inEvent = false;
  let start: Date | null = null;
  let end: Date | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === 'BEGIN:VEVENT') {
      inEvent = true;
      start = null;
      end = null;
    } else if (trimmed === 'END:VEVENT') {
      if (inEvent && start && end) events.push({ start, end });
      inEvent = false;
    } else if (inEvent) {
      if (trimmed.startsWith('DTSTART')) {
        start = parseIcalDate(trimmed.split(':').slice(1).join(':'));
      } else if (trimmed.startsWith('DTEND')) {
        end = parseIcalDate(trimmed.split(':').slice(1).join(':'));
      }
    }
  }

  return events;
}

function computeAvailability(events: { start: Date; end: Date }[]) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  // Short-term: is today blocked?
  const isBlockedToday = events.some(e => e.start <= today && today < e.end);

  let shortTerm: string;
  if (!isBlockedToday) {
    shortTerm = 'Available now';
  } else {
    // Find the earliest end date that isn't itself the start of another booking
    const candidates = events
      .filter(e => e.end > today)
      .map(e => e.end)
      .sort((a, b) => a.getTime() - b.getTime());

    let nextClear: Date | null = null;
    for (const candidate of candidates) {
      if (!events.some(e => e.start <= candidate && candidate < e.end)) {
        nextClear = candidate;
        break;
      }
    }

    if (nextClear) {
      shortTerm = `Available ${nextClear.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`;
    } else {
      shortTerm = 'Check Airbnb';
    }
  }

  // Long-term: first of the month after the last future booking ends
  const futureEvents = events.filter(e => e.end > today);

  let longTerm: string;
  if (futureEvents.length === 0) {
    longTerm = 'Available now';
  } else {
    const lastEnd = futureEvents.reduce(
      (max, e) => (e.end > max ? e.end : max),
      new Date(0)
    );
    // First of the next calendar month after lastEnd
    const firstOfNextMonth = new Date(Date.UTC(lastEnd.getFullYear(), lastEnd.getMonth() + 1, 1));
    longTerm = `Available ${firstOfNextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`;
  }

  return { shortTerm, longTerm };
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const envKey = ICAL_ENV[slug];
  const icalUrl = envKey ? process.env[envKey] : undefined;

  if (!icalUrl) {
    // iCal not yet configured — return a graceful fallback so UI stays informative
    return NextResponse.json({ shortTerm: 'Check Airbnb', longTerm: 'Contact us', configured: false });
  }

  try {
    const res = await fetch(icalUrl, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Calendar fetch failed' }, { status: 502 });
    }

    const text = await res.text();
    const events = parseIcal(text);
    return NextResponse.json(computeAvailability(events));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
