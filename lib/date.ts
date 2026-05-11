export function formatDate(isoDate: string, language: string): string {
  if (!isoDate) return '';
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  return new Date(isoDate.slice(0, 10) + 'T12:00:00Z').toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
