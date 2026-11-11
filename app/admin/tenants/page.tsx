'use client';

import { useMemo, useState } from 'react';
import { units } from '@/data/units';

type TenantRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  unit_name: string | null;
  monthly_rent: string;
  currency: string;
  first_rent_date: string;
  months: number;
  status: 'pending_setup' | 'activating' | 'active' | 'past_due' | 'completed' | 'cancelled';
  paid_count: number;
  failed_count: number;
  last_paid_at: string | null;
  setup_link: string;
};

const STATUS: Record<TenantRow['status'], { label: string; className: string }> = {
  pending_setup: { label: 'Waiting for card', className: 'bg-amber-100 text-amber-800' },
  activating:    { label: 'Activating',       className: 'bg-blue-100 text-blue-800' },
  active:        { label: 'Autopay active',   className: 'bg-green-100 text-green-800' },
  past_due:      { label: 'Payment failed',   className: 'bg-red-100 text-red-800' },
  completed:     { label: 'Lease completed',  className: 'bg-gray-100 text-gray-600' },
  cancelled:     { label: 'Cancelled',        className: 'bg-gray-100 text-gray-600' },
};

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-600 transition-colors bg-white';
const label = 'block text-sm font-semibold text-gray-700 mb-1';

/** 'YYYY-MM-01' for the next `count` upcoming 1sts of the month (never today). */
function upcomingFirsts(count: number): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + 1 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
}

const monthName = (iso: string, offset = 0) => {
  const [y, m] = iso.slice(0, 7).split('-').map(Number);
  return new Date(y, m - 1 + offset, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const money = (n: number | string) => `$${Number(n).toLocaleString('en-US')} MXN`;

function CopyButton({ text, children }: { text: string; children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-sm font-semibold text-amber-700 hover:text-amber-900 underline"
    >
      {copied ? '✓ Copied' : children}
    </button>
  );
}

export default function TenantsAdminPage() {
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [lockError, setLockError] = useState('');
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [listError, setListError] = useState('');

  const firsts = useMemo(() => upcomingFirsts(18), []);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', language: 'en' as 'en' | 'es',
    unit_id: '', monthly_rent: '', first_rent_date: firsts[0], months: '6', notes: '',
  });
  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [created, setCreated] = useState<{ name: string; phone: string; link: string; emailed: boolean } | null>(null);

  const api = (path: string, init?: RequestInit) =>
    fetch(path, { ...init, headers: { 'Content-Type': 'application/json', 'x-admin-code': code.trim(), ...init?.headers } });

  async function loadTenants(): Promise<boolean> {
    const res = await api('/api/admin/tenants');
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) return false;
    if (!res.ok) setListError(data.error || 'Could not load tenants.');
    else { setListError(''); setTenants(data.tenants); }
    return true;
  }

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setLockError('');
    if (await loadTenants()) setUnlocked(true);
    else setLockError('Incorrect code. Try again.');
  }

  async function createTenant(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const res = await api('/api/admin/tenants', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        monthly_rent: Number(form.monthly_rent),
        months: Number(form.months),
        phone: form.phone || undefined,
        notes: form.notes || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setFormError(data.error || 'Something went wrong.'); return; }
    setCreated({ name: form.first_name, phone: form.phone, link: data.setup_link, emailed: data.emailed });
    setForm((f) => ({ ...f, first_name: '', last_name: '', email: '', phone: '', unit_id: '', monthly_rent: '', notes: '' }));
    loadTenants();
  }

  async function cancelTenant(t: TenantRow) {
    if (!confirm(`Stop all future rent charges for ${t.first_name} ${t.last_name}? This can't be undone.`)) return;
    const res = await api(`/api/admin/tenants/${t.id}/cancel`, { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) alert(data.error || 'Could not cancel.');
    loadTenants();
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🏠</div>
            <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your admin access code</p>
          </div>
          <form onSubmit={unlock} className="space-y-4">
            <input
              type="password" inputMode="numeric" maxLength={6} autoFocus placeholder="••••"
              value={code} onChange={(e) => { setCode(e.target.value); setLockError(''); }}
              className="w-full text-center text-3xl tracking-widest border-2 border-gray-200 rounded-xl py-4 focus:outline-none focus:border-amber-600 transition-colors"
            />
            {lockError && <p className="text-sm text-red-600 text-center">{lockError}</p>}
            <button type="submit" className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all">
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  const months = Number(form.months) || 0;
  const rent = Number(form.monthly_rent) || 0;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants & Rent Autopay</h1>
          <p className="text-gray-500 text-sm mt-1">
            Add a tenant, send them their link, and rent is charged automatically on the 1st of each month.
          </p>
        </div>

        {/* ---------- Add tenant ---------- */}
        <form onSubmit={createTenant} className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900">Add tenant</h2>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>First name <span className="text-red-500">*</span></label>
              <input className={input} required value={form.first_name} onChange={set('first_name')} />
            </div>
            <div>
              <label className={label}>Last name</label>
              <input className={input} value={form.last_name} onChange={set('last_name')} />
            </div>
            <div>
              <label className={label}>Email <span className="text-red-500">*</span></label>
              <input className={input} type="email" required value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className={label}>Phone / WhatsApp</label>
              <input className={input} type="tel" placeholder="+52…" value={form.phone} onChange={set('phone')} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>Unit <span className="text-red-500">*</span></label>
              <select
                className={input} required value={form.unit_id}
                onChange={(e) => {
                  const unit = units.find((u) => u.slug === e.target.value);
                  setForm((f) => ({ ...f, unit_id: e.target.value, monthly_rent: unit ? String(unit.monthlyRateMXN) : f.monthly_rent }));
                }}
              >
                <option value="">Select a unit…</option>
                {units.map((u) => <option key={u.slug} value={u.slug}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Monthly rent (MXN) <span className="text-red-500">*</span></label>
              <input className={input} type="number" min="1" step="0.01" required value={form.monthly_rent} onChange={set('monthly_rent')} />
            </div>
            <div>
              <label className={label}>First automatic charge <span className="text-red-500">*</span></label>
              <select className={input} value={form.first_rent_date} onChange={set('first_rent_date')}>
                {firsts.map((d) => <option key={d} value={d}>1 {monthName(d)}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Number of months <span className="text-red-500">*</span></label>
              <input className={input} type="number" min="1" max="36" required value={form.months} onChange={set('months')} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>Tenant&apos;s language</label>
              <select className={input} value={form.language} onChange={set('language')}>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            <div>
              <label className={label}>Notes <span className="text-gray-400 font-normal">private</span></label>
              <input className={input} value={form.notes} onChange={set('notes')} />
            </div>
          </div>

          {rent > 0 && months > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
              <strong>{months}</strong> charge{months === 1 ? '' : 's'} of <strong>{money(rent)}</strong> on the 1st of each month,{' '}
              {monthName(form.first_rent_date)} → {monthName(form.first_rent_date, months - 1)}
              {' '}(total {money(rent * months)}). Charges stop automatically after the last month.
            </div>
          )}

          {formError && <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700">{formError}</div>}

          <button
            type="submit" disabled={saving}
            className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-xl transition-all text-sm"
          >
            {saving ? 'Adding tenant…' : 'Add tenant & create autopay link'}
          </button>
        </form>

        {created && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 space-y-3">
            <p className="font-bold text-green-900">✓ {created.name} added</p>
            <p className="text-sm text-green-900">
              {created.emailed ? 'Their autopay link was emailed to them. ' : 'The email could not be sent — '}
              Send them this link to save their card (nothing is charged until the first rent date):
            </p>
            <p className="text-xs break-all bg-white rounded-lg p-3 border border-green-200 font-mono">{created.link}</p>
            <div className="flex gap-4">
              <CopyButton text={created.link}>Copy link</CopyButton>
              <a
                className="text-sm font-semibold text-amber-700 hover:text-amber-900 underline" target="_blank" rel="noreferrer"
                href={`https://wa.me/${created.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${created.name}! Here is the link to set up automatic rent payments for La Casa: ${created.link}`)}`}
              >
                Send via WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* ---------- Tenant list ---------- */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">All tenants</h2>
          {listError && <p className="text-sm text-red-600">{listError}</p>}
          {tenants.length === 0 && !listError && <p className="text-sm text-gray-500">No tenants yet.</p>}
          {tenants.map((t) => {
            const ended = t.status === 'completed' || t.status === 'cancelled';
            return (
              <div key={t.id} className={`bg-white rounded-2xl shadow p-5 ${ended ? 'opacity-60' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">{t.first_name} {t.last_name}</p>
                    <p className="text-sm text-gray-500">{t.unit_name} · {t.email}{t.phone ? ` · ${t.phone}` : ''}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS[t.status].className}`}>{STATUS[t.status].label}</span>
                </div>
                <p className="text-sm text-gray-700 mt-3">
                  {money(t.monthly_rent)}/mo · {monthName(t.first_rent_date)} → {monthName(t.first_rent_date, t.months - 1)} ·{' '}
                  <strong>{t.paid_count}/{t.months}</strong> paid
                  {t.failed_count > 0 && <span className="text-red-600"> · {t.failed_count} failed</span>}
                </p>
                {!ended && (
                  <div className="flex flex-wrap gap-4 mt-3">
                    <CopyButton text={t.setup_link}>{t.status === 'pending_setup' ? 'Copy autopay setup link' : 'Copy card-update link'}</CopyButton>
                    <button type="button" onClick={() => cancelTenant(t)} className="text-sm font-semibold text-red-600 hover:text-red-800 underline">
                      End lease / stop charges
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
