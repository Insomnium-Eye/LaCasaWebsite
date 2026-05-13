import { NextRequest, NextResponse } from 'next/server';

interface ICalEvent {
  uid: string;
  start: string;
  end: string;
}

function parseIcalDate(value: string): string {
  // Handles YYYYMMDD and YYYYMMDDTHHMMSSZ
  const clean = value.replace(/T.*$/, '').trim();
  if (clean.length === 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
  }
  return '';
}

function parseIcal(content: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let inEvent = false;
  let current: Partial<ICalEvent> = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      current = {};
    } else if (line === 'END:VEVENT') {
      if (current.uid && current.start && current.end) {
        events.push(current as ICalEvent);
      }
      inEvent = false;
    } else if (inEvent) {
      if (line.startsWith('DTSTART')) {
        current.start = parseIcalDate(line.split(':').slice(1).join(':'));
      } else if (line.startsWith('DTEND')) {
        current.end = parseIcalDate(line.split(':').slice(1).join(':'));
      } else if (line.startsWith('UID:')) {
        current.uid = line.slice(4).trim();
      }
    }
  }

  return events;
}

// Vercel cron calls GET; manual/webhook triggers can use POST
export async function GET(req: NextRequest) {
  // Verify this is a legitimate cron call
  const secret = req.headers.get('authorization');
  if (process.env.CRON_SECRET && secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runSync();
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (process.env.CRON_SECRET && secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runSync();
}

async function runSync() {
  try {
    const { getSql } = await import('@/lib/db');
    const sql = getSql();

    const feeds = await sql<{ unit_slug: string; platform: string; ical_url: string }[]>`
      SELECT unit_slug, platform, ical_url FROM calendar_feeds
    `.catch(() => []);

    if (feeds.length === 0) {
      return NextResponse.json({ message: 'No feeds configured', imported: 0 });
    }

    let imported = 0;

    for (const feed of feeds) {
      try {
        const res = await fetch(feed.ical_url, {
          headers: { 'User-Agent': 'LaCasaOaxaca-CalSync/1.0' },
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) continue;

        const content = await res.text();
        const events = parseIcal(content);

        for (const event of events) {
          if (!event.start || !event.end) continue;
          await sql`
            INSERT INTO external_blocks (unit_slug, platform, start_date, end_date, uid)
            VALUES (${feed.unit_slug}, ${feed.platform}, ${event.start}, ${event.end}, ${event.uid})
            ON CONFLICT (unit_slug, uid) DO UPDATE
              SET start_date = EXCLUDED.start_date,
                  end_date   = EXCLUDED.end_date
          `.catch(() => null);
          imported++;
        }

        await sql`
          UPDATE calendar_feeds
          SET last_synced_at = NOW()
          WHERE unit_slug = ${feed.unit_slug} AND platform = ${feed.platform}
        `.catch(() => null);
      } catch (err) {
        console.error(`[CalSync] ${feed.platform}/${feed.unit_slug}:`, err instanceof Error ? err.message : err);
      }
    }

    return NextResponse.json({ imported });
  } catch (err) {
    console.error('[CalSync] Fatal:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
