/** Where admin notifications go, and the reply-to address on guest emails. */
export const ADMIN_EMAIL = 'dgpiper@oaxaca-rental.com';

/**
 * Sender for every email. Resend's test sender (onboarding@resend.dev) only
 * delivers to the Resend account owner, so once oaxaca-rental.com is verified
 * in Resend set EMAIL_FROM in Vercel, e.g. "La Casa Oaxaca <bookings@oaxaca-rental.com>".
 */
export const EMAIL_FROM = process.env.EMAIL_FROM?.trim() || 'La Casa Oaxaca <onboarding@resend.dev>';
