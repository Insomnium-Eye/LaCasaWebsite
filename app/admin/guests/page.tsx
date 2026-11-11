'use client';

import { useState } from 'react';

type Guest = {
  id: string;
  guest_first_name: string;
  guest_last_name: string;
  email: string | null;
  unit_name: string | null;
  check_in: string;
  check_out: string;
  digital_key: string | null;
  username: string | null;
  status: string;
  has_custom_password: boolean;
};

const fmt = (iso: string) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function GuestRow({ guest, api, onChanged }: {
  guest: Guest;
  api: (path: string, init?: RequestInit) => Promise<Response>;
  onChanged: (id: string, hasCustom: boolean) => void;
}) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(body: object, done: string) {
    setBusy(true);
    setNote(null);
    const res = await api(`/api/admin/guests/${guest.id}/password`, { method: 'POST', body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setNote({ ok: false, text: data.error || 'Could not update password.' }); return; }
    onChanged(guest.id, data.has_custom_password);
    setPassword('');
    setNote({ ok: true, text: done });
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold text-gray-900">{guest.guest_first_name} {guest.guest_last_name}</p>
          <p className="text-sm text-gray-500">
            {guest.unit_name} · {fmt(guest.check_in)} → {fmt(guest.check_out)}
            {guest.email ? ` · ${guest.email}` : ''}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            🔑 Lock code <strong className="font-mono">{guest.digital_key ?? '—'}</strong>
            {guest.username && <> · 👤 <span className="font-mono">{guest.username}</span></>}
          </p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          guest.has_custom_password ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
          {guest.has_custom_password ? 'Own password' : 'Default password'}
        </span>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); submit({ password }, 'Password updated.'); }}
        className="flex flex-wrap gap-2 mt-4"
      >
        <div className="relative flex-1 min-w-[200px]">
          <input
            type={show ? 'text' : 'password'}
            value={password}
            minLength={8}
            required
            autoComplete="new-password"
            onChange={(e) => { setPassword(e.target.value); setNote(null); }}
            placeholder="New password (min 8 characters)"
            className="w-full border border-gray-300 rounded-lg pl-3 pr-14 py-2 text-sm focus:outline-none focus:border-amber-600"
          />
          <button type="button" onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-amber-700">
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        <button type="submit" disabled={busy}
          className="bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white text-sm font-bold px-4 py-2 rounded-lg">
          Set password
        </button>
        {guest.has_custom_password && (
          <button type="button" disabled={busy}
            onClick={() => confirm(`Reset ${guest.guest_first_name}'s password to the default?`) && submit({ reset: true }, 'Reset to the default password.')}
            className="text-sm font-semibold text-red-600 hover:text-red-800 underline px-2">
            Reset to default
          </button>
        )}
      </form>
      {note && <p className={`text-sm mt-2 ${note.ok ? 'text-green-700' : 'text-red-600'}`}>{note.ok ? '✓ ' : ''}{note.text}</p>}
    </div>
  );
}

export default function GuestsAdminPage() {
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [lockError, setLockError] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');

  const api = (path: string, init?: RequestInit) =>
    fetch(path, { ...init, headers: { 'Content-Type': 'application/json', 'x-admin-code': code.trim(), ...init?.headers } });

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setLockError('');
    const res = await api('/api/admin/guests');
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { setLockError('Incorrect code. Try again.'); return; }
    if (!res.ok) setListError(data.error || 'Could not load guests.');
    else setGuests(data.guests);
    setUnlocked(true);
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900">Guest Logins</h1>
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

  const q = search.trim().toLowerCase();
  const shown = q
    ? guests.filter((g) =>
        [g.guest_first_name, g.guest_last_name, g.email, g.unit_name, g.digital_key, g.username]
          .some((v) => v?.toLowerCase().includes(q)))
    : guests;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guest Portal Logins</h1>
          <p className="text-gray-500 text-sm mt-1">
            Current and upcoming guests. Set a password to log in as a guest at /portal with their lock code.
          </p>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, unit, lock code, email…"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-600 bg-white"
        />

        {listError && <p className="text-sm text-red-600">{listError}</p>}
        {!listError && shown.length === 0 && <p className="text-sm text-gray-500">No current guests found.</p>}

        {shown.map((g) => (
          <GuestRow
            key={g.id}
            guest={g}
            api={api}
            onChanged={(id, hasCustom) =>
              setGuests((list) => list.map((x) => (x.id === id ? { ...x, has_custom_password: hasCustom } : x)))}
          />
        ))}
      </div>
    </div>
  );
}
