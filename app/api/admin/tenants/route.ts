import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { getSql } from '@/lib/db';
import { units } from '@/data/units';
import { Tenant, checkAdminCode, escapeHtml, formatMoney, monthLabel, tenantLink } from '@/lib/rent';

const resend = new Resend(process.env.RESEND_API_KEY);

// GET /api/admin/tenants — all tenants with payment summary and their setup link
export async function GET(request: NextRequest) {
  const denied = checkAdminCode(request);
  if (denied) return denied;

  try {
    const sql = getSql();
    const rows = await sql<(Tenant & { paid_count: number; last_paid_at: Date | null; failed_count: number })[]>`
      SELECT t.*,
        COUNT(p.id) FILTER (WHERE p.status = 'paid')::int   AS paid_count,
        COUNT(p.id) FILTER (WHERE p.status = 'failed')::int AS failed_count,
        MAX(p.updated_at) FILTER (WHERE p.status = 'paid')  AS last_paid_at
      FROM tenants t
      LEFT JOIN rent_payments p ON p.tenant_id = t.id
      GROUP BY t.id
      ORDER BY (t.status IN ('completed', 'cancelled')), t.first_rent_date DESC
    `;
    const origin = new URL(request.url).origin;
    return NextResponse.json({
      tenants: rows.map((t) => ({ ...t, setup_link: tenantLink(origin, t.id) })),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[admin tenants list]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

const createSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().max(100).default(''),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(30).optional(),
  unit_id: z.string().refine((id) => units.some((u) => u.slug === id), 'Unknown unit'),
  monthly_rent: z.number().positive().max(1_000_000),
  first_rent_date: z.string().regex(/^\d{4}-\d{2}-01$/, 'First rent date must be the 1st of a month'),
  months: z.number().int().min(1).max(36),
  language: z.enum(['en', 'es']).default('en'),
  notes: z.string().trim().max(1000).optional(),
});

// POST /api/admin/tenants — add a tenant and email them their autopay setup link
export async function POST(request: NextRequest) {
  const denied = checkAdminCode(request);
  if (denied) return denied;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue.path.join('.')}: ${issue.message}` }, { status: 400 });
  }
  const body = parsed.data;

  const today = new Date().toISOString().slice(0, 10);
  if (body.first_rent_date <= today) {
    return NextResponse.json({ error: 'The first automatic charge must be on an upcoming 1st of the month.' }, { status: 400 });
  }

  const unit = units.find((u) => u.slug === body.unit_id)!;

  try {
    const sql = getSql();
    const [tenant] = await sql<Tenant[]>`
      INSERT INTO tenants
        (first_name, last_name, email, phone, unit_id, unit_name,
         monthly_rent, currency, first_rent_date, months, language, notes)
      VALUES
        (${body.first_name}, ${body.last_name}, ${body.email}, ${body.phone || null},
         ${unit.slug}, ${unit.name}, ${body.monthly_rent}, 'mxn',
         ${body.first_rent_date}, ${body.months}, ${body.language}, ${body.notes || null})
      RETURNING *
    `;

    const link = tenantLink(new URL(request.url).origin, tenant.id);
    let emailed = false;

    if (process.env.RESEND_API_KEY) {
      const es = body.language === 'es';
      const rent = formatMoney(body.monthly_rent, 'mxn');
      const from = monthLabel(body.first_rent_date, body.language);
      const to = monthLabel(body.first_rent_date, body.language, body.months - 1);
      const { error } = await resend.emails.send({
        from: 'La Casa Oaxaca <onboarding@resend.dev>',
        to: [body.email],
        subject: es ? '🏠 Configura el pago automático de tu renta — La Casa Oaxaca' : '🏠 Set up automatic rent payments — La Casa Oaxaca',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#8d4a3f;">${es ? `¡Bienvenido/a, ${escapeHtml(body.first_name)}!` : `Welcome, ${escapeHtml(body.first_name)}!`}</h2>
            <p>${es
              ? `Tu renta de <strong>${rent}</strong> por <strong>${escapeHtml(unit.name)}</strong> se cobrará automáticamente el día 1 de cada mes, de ${from} a ${to} (${body.months} ${body.months === 1 ? 'mes' : 'meses'}).`
              : `Your rent of <strong>${rent}</strong> for <strong>${escapeHtml(unit.name)}</strong> will be charged automatically on the 1st of each month, from ${from} through ${to} (${body.months} month${body.months === 1 ? '' : 's'}).`}</p>
            <p>${es ? 'Solo necesitas guardar una tarjeta una vez:' : 'You just need to save a card once:'}</p>
            <p style="margin:24px 0;"><a href="${link}" style="background:#8d4a3f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
              ${es ? 'Configurar pago automático' : 'Set up autopay'}</a></p>
            <p style="color:#888;font-size:13px;">${es
              ? 'Guarda este correo: el mismo enlace te permite actualizar tu tarjeta más adelante.'
              : 'Keep this email — the same link lets you update your card later.'}</p>
          </div>`,
      });
      emailed = !error;
      if (error) console.error('[tenant setup email]', error);
    }

    return NextResponse.json({ success: true, tenant_id: tenant.id, setup_link: link, emailed });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[admin create tenant]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
