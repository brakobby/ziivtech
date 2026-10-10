// Company-wide settings. Editable values (email, WhatsApp, booking link,
// social links...) come from the CMS: Site settings, saved in src/cms/settings.json.
// Structural values (name, navigation) stay here in code.
import settings from '../cms/settings.json';

export const SITE = {
  name: 'ZIIV Technologies',
  shortName: 'ZIIV',
  pronunciation: 'Ziv',
  meaning: 'Zero-Interface Intelligence & Vision',
  url: 'https://ziivtech.com',
  tagline: settings.tagline,
  description: settings.description,
  locationLine: settings.locationLine,
  email: settings.email,
  // WhatsApp number in international format, digits only. Buttons hide when empty.
  whatsapp: (settings.whatsapp ?? '').replace(/\D/g, ''),
  whatsappMessage: settings.whatsappMessage || 'Hello ZIIV, I’d like to discuss a project.',
  // Cal.com or Calendly link. "Book a call" buttons hide when empty.
  bookingUrl: settings.bookingUrl ?? '',
  // Rendered in the footer only when a URL is set.
  social: (settings.social ?? []).map((s) => ({ label: s.label, url: s.url ?? '' })),
};

/** wa.me link with the default greeting, or null when no number is set. */
export const whatsappHref = (message = SITE.whatsappMessage) =>
  SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}` : null;

export const NAV = [
  { label: 'Work', href: '/work/' },
  { label: 'Services', href: '/services/' },
  { label: 'ZIIVOS', href: '/ziivos/' },
  { label: 'Process', href: '/process/' },
  { label: 'About', href: '/about/' },
] as const;

export const CONTACT_HREF = '/contact/';
