'use client';

import { useEffect, useState } from 'react';
import { GuestSession } from '@/types/guest-portal';
import { useLanguage } from '@/contexts/LanguageContext';

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  lockCode: string;
  usingDefaultPassword: boolean;
}

interface ProfileFormProps {
  session: GuestSession | null;
  onSessionUpdate: (session: GuestSession) => void;
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-amber-600 disabled:bg-gray-100';
const labelClass = 'block text-sm font-semibold text-gray-700 mb-2';

const ProfileForm = ({ session, onSessionUpdate }: ProfileFormProps) => {
  const { language } = useLanguage();
  const label = (en: string, es: string) => (language === 'es' ? es : en);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', username: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const applyProfile = (p: Profile) => {
    setProfile(p);
    setForm({ firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone, username: p.username });
  };

  useEffect(() => {
    if (!session?.token || session.isAdmin) return;
    fetch('/api/guest/profile', { headers: { Authorization: `Bearer ${session.token}` } })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        applyProfile(data.data);
      })
      .catch((e: Error) => setLoadError(e.message || label('Could not load your profile.', 'No se pudo cargar tu perfil.')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ ok: false, text: label('The new passwords don’t match.', 'Las contraseñas nuevas no coinciden.') });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/guest/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.token}` },
        body: JSON.stringify({ ...form, currentPassword, newPassword: newPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ ok: false, text: data.error || label('Could not save your changes.', 'No se pudieron guardar los cambios.') });
        return;
      }
      applyProfile(data.data.profile);
      onSessionUpdate(data.data.session);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ ok: true, text: label('Your profile has been updated.', 'Tu perfil se actualizó.') });
    } catch {
      setMessage({ ok: false, text: label('Network error. Please try again.', 'Error de red. Intenta de nuevo.') });
    } finally {
      setSaving(false);
    }
  };

  if (session?.isAdmin) return <AdminPasswordForm session={session} onSessionUpdate={onSessionUpdate} />;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-1">👤 {label('User Profile', 'Perfil de Usuario')}</h3>
      <p className="text-gray-500 text-sm mb-6">
        {label('Update your contact details and login.', 'Actualiza tus datos de contacto y de acceso.')}
      </p>

      {loadError && <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700">{loadError}</div>}
      {!profile && !loadError && <p className="text-sm text-gray-500">{label('Loading…', 'Cargando…')}</p>}

      {profile && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {profile.usingDefaultPassword && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded text-sm text-amber-900">
              {label(
                'You’re still using the default password. Please choose your own below.',
                'Aún usas la contraseña predeterminada. Por favor elige una propia abajo.',
              )}
            </div>
          )}

          {/* ---- Details ---- */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{label('First name', 'Nombre')} <span className="text-red-500">*</span></label>
              <input className={inputClass} required value={form.firstName} onChange={set('firstName')} />
            </div>
            <div>
              <label className={labelClass}>{label('Last name', 'Apellido')}</label>
              <input className={inputClass} value={form.lastName} onChange={set('lastName')} />
            </div>
            <div>
              <label className={labelClass}>{label('Email', 'Correo')}</label>
              <input className={inputClass} type="email" autoComplete="email" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className={labelClass}>{label('Phone', 'Teléfono')}</label>
              <input className={inputClass} type="tel" autoComplete="tel" placeholder="+52…" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className={labelClass}>{label('Username', 'Usuario')}</label>
              <input
                className={inputClass}
                autoComplete="username"
                placeholder={label('e.g. maria.garcia', 'ej. maria.garcia')}
                value={form.username}
                onChange={set('username')}
              />
              <p className="mt-1 text-xs text-gray-500">
                {label('Optional — you can log in with it instead of your lock code.', 'Opcional — puedes usarlo para entrar en lugar de tu código.')}
              </p>
            </div>
            <div>
              <label className={labelClass}>{label('Door lock code', 'Código de la puerta')}</label>
              <input className={inputClass} value={profile.lockCode} disabled />
              <p className="mt-1 text-xs text-gray-500">{label('Set by us — contact us to change it.', 'Lo asignamos nosotros — contáctanos para cambiarlo.')}</p>
            </div>
          </div>

          {/* ---- Password ---- */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="font-bold text-gray-900 mb-1">{label('Change password', 'Cambiar contraseña')}</h4>
            <p className="text-xs text-gray-500 mb-4">
              {label('Leave blank to keep your current password. At least 8 characters.', 'Déjalo en blanco para conservar tu contraseña. Mínimo 8 caracteres.')}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{label('New password', 'Contraseña nueva')}</label>
                <input className={inputClass} type="password" autoComplete="new-password" minLength={8} value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setMessage(null); }} />
              </div>
              <div>
                <label className={labelClass}>{label('Confirm new password', 'Confirmar contraseña nueva')}</label>
                <input className={inputClass} type="password" autoComplete="new-password" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setMessage(null); }} />
              </div>
            </div>
          </div>

          {/* ---- Confirm & save ---- */}
          <div className="pt-6 border-t border-gray-200">
            <label className={labelClass}>
              {label('Current password', 'Contraseña actual')} <span className="text-red-500">*</span>
            </label>
            <input className={inputClass} type="password" autoComplete="current-password" required value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setMessage(null); }} />
            <p className="mt-1 text-xs text-gray-500">{label('Required to save any changes.', 'Necesaria para guardar cualquier cambio.')}</p>
          </div>

          {message && (
            <div className={`p-4 border-l-4 rounded text-sm ${message.ok ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all"
          >
            {saving ? label('Saving…', 'Guardando…') : label('Save changes', 'Guardar cambios')}
          </button>
        </form>
      )}
    </div>
  );
};

/** The admin login has no reservation, so its profile is only its password. */
function AdminPasswordForm({ session, onSessionUpdate }: { session: GuestSession; onSessionUpdate: (s: GuestSession) => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ ok: false, text: 'The new passwords don’t match.' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/guest/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ ok: false, text: data.error || 'Could not change the password.' });
        return;
      }
      onSessionUpdate({ ...session, usingDefaultPassword: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ ok: true, text: 'Admin password changed. Use it next time you log in with the admin code.' });
    } catch {
      setMessage({ ok: false, text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-1">🔐 Admin Password</h3>
      <p className="text-gray-500 text-sm mb-6">The password you enter together with the admin code to log in here.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {session.usingDefaultPassword && (
          <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded text-sm text-amber-900">
            The admin login is still using the default password. Please choose your own.
          </div>
        )}
        <div>
          <label className={labelClass}>Current password <span className="text-red-500">*</span></label>
          <input className={inputClass} type="password" autoComplete="current-password" required value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setMessage(null); }} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>New password <span className="text-red-500">*</span></label>
            <input className={inputClass} type="password" autoComplete="new-password" minLength={8} required value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setMessage(null); }} />
          </div>
          <div>
            <label className={labelClass}>Confirm new password <span className="text-red-500">*</span></label>
            <input className={inputClass} type="password" autoComplete="new-password" required value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setMessage(null); }} />
          </div>
        </div>
        <p className="text-xs text-gray-500 -mt-2">At least 8 characters.</p>

        {message && (
          <div className={`p-4 border-l-4 rounded text-sm ${message.ok ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all"
        >
          {saving ? 'Saving…' : 'Change admin password'}
        </button>
      </form>
    </div>
  );
}

export default ProfileForm;
