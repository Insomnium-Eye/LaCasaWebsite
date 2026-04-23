import jwt from 'jsonwebtoken';
import { GuestSession } from '@/types/guest-portal';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRY_HOURS = parseInt(process.env.JWT_EXPIRY_HOURS || '4');

export const generateGuestJWT = (session: Omit<GuestSession, 'token'>): string => {
  return jwt.sign(
    {
      reservationId: session.reservationId,
      guestName: session.guestName,
      email: session.email,
      unitName: session.unitName,
    },
    JWT_SECRET,
    { expiresIn: `${JWT_EXPIRY_HOURS}h` }
  );
};

export const verifyGuestJWT = (token: string): GuestSession | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      ...decoded,
      token,
    } as GuestSession;
  } catch (error) {
    return null;
  }
};

// Detect identifier type (email, phone, or digital key)
export const detectIdentifierType = (
  identifier: string
): 'email' | 'phone' | 'digital_key' => {
  const stripped = identifier.trim();

  // Check if email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stripped)) {
    return 'email';
  }

  // Check if phone (E.164 format: +1234567890 or just digits)
  if (/^\+?[1-9]\d{1,14}$/.test(stripped.replace(/\D/g, ''))) {
    return 'phone';
  }

  // Assume digital key (alphanumeric)
  return 'digital_key';
};

// Normalize phone number to E.164 format
export const normalizePhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  // Assuming Mexican phone numbers if no country code
  if (cleaned.length === 10) {
    return `+52${cleaned}`;
  }
  if (!cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  return `+${cleaned}`;
};

// Normalize email (lowercase)
export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Normalize digital key (uppercase, alphanumeric only)
export const normalizeDigitalKey = (key: string): string => {
  return key.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

export const normalizeIdentifier = (
  identifier: string,
  type: 'email' | 'phone' | 'digital_key'
): string => {
  switch (type) {
    case 'email':
      return normalizeEmail(identifier);
    case 'phone':
      return normalizePhone(identifier);
    case 'digital_key':
      return normalizeDigitalKey(identifier);
    default:
      return identifier;
  }
};
