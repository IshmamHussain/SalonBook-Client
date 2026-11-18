function normalizeBaseUrl(raw: string | undefined, fallback: string): string {
  const value = (raw || fallback).trim().replace(/\/+$/, '');
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `https://${value}`;
}

export const API_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL, 'http://localhost:5000');
export const APP_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000');

export const SERVICE_CATEGORIES = [
  'Haircut & Styling',
  'Hair Coloring',
  'Hair Treatment',
  'Facial & Skincare',
  'Makeup',
  'Manicure & Pedicure',
  'Spa & Massage',
] as const;

export const PREDEFINED_TIME_SLOTS = [
  '09:30 AM',
  '11:00 AM',
  '12:30 PM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM',
] as const;

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Haircut & Styling': 'Architectural cuts, precision blowouts, and sculptural finishing.',
  'Hair Coloring': 'Lived-in balayage, gloss glazing, and custom tonal dimensions.',
  'Hair Treatment': 'Keratin bond restoration, scalp therapy, and deep molecular repair.',
  'Facial & Skincare': 'Lymphatic sculpting, enzymatic renewal, and LED phototherapy.',
  Makeup: 'Skin-first editorial artistry crafted for daylight and evening events.',
  'Manicure & Pedicure': 'Dry cuticle refinement and luminous Japanese builder gel care.',
  'Spa & Massage': 'Heated basalt bodywork and calming botanical aromatherapy rituals.',
};

export const SALON_INFO = {
  name: 'SalonBook',
  tagline: 'A calm digital atelier for curated hair, skincare, and restorative spa appointments.',
  phone: '+1 (212) 555-0194',
  email: 'concierge@salonbook.studio',
  address: '418 Mercer Gallery Way, Suite 3B, SoHo, New York, NY 10012',
  hours: [
    { days: 'Mon – Fri', time: '09:00 AM – 08:00 PM' },
    { days: 'Saturday', time: '09:30 AM – 07:00 PM' },
    { days: 'Sunday', time: '10:00 AM – 05:00 PM' },
  ],
};
