import Stripe from 'stripe';

let client: Stripe | null = null;

/** Server-side Stripe client. Returns null when STRIPE_SECRET_KEY is not configured. */
export const getStripe = (): Stripe | null => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
};
