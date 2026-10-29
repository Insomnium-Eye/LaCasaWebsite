export interface TransportCheckoutPayload {
  destinationId: string;
  datetime: string;
  passengers: number;
  roundTrip: boolean;
  notes?: string;
  language: string;
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Creates a Stripe Checkout session and redirects the browser to it.
 * Resolves with an error message if the session could not be created.
 */
export async function startTransportCheckout(payload: TransportCheckoutPayload, token?: string): Promise<string> {
  try {
    const response = await fetch('/api/transport/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.url) return data.error || 'Could not start payment. Please try again.';
    window.location.href = data.url;
    return '';
  } catch {
    return 'Network error. Please try again.';
  }
}
