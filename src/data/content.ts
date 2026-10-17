// Page content, read from the CMS files in src/cms/ and shaped for the
// components. Edit content at /keystatic (run `npm run dev` first).
// Rule of thumb for copy: describe only what ZIIV has actually built or
// offers. No invented clients, metrics, testimonials or awards.
import home from '../cms/home.json';
import services from '../cms/services.json';
import processPage from '../cms/process.json';
import about from '../cms/about.json';
import contact from '../cms/contact.json';
import ziivos from '../cms/ziivos.json';
import assess from '../cms/assess.json';
import { imageOr } from './images';

import teamEngineering from '../assets/photos/team-engineering.jpg';
import serverRoom from '../assets/photos/server-room.jpg';
import planningSession from '../assets/photos/planning-session.jpg';
import teamMeeting from '../assets/photos/team-meeting.jpg';

export * from './work';

/** A photo plus its description, falling back to the bundled photo. */
export interface Photo {
  src: ImageMetadata;
  alt: string;
}
const photo = (path: string | null | undefined, alt: string | undefined, fallback: ImageMetadata): Photo => ({
  src: imageOr(path, fallback),
  alt: alt ?? '',
});

/** Splits "plain *highlighted* plain" into segments for the green emphasis. */
export function highlights(text: string): { text: string; mark?: boolean }[] {
  return text
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((part) => (part.startsWith('*') && part.endsWith('*') ? { text: part.slice(1, -1), mark: true } : { text: part }));
}

/* ---------- Shared ---------- */

export const GET_IN_TOUCH = home.getInTouch;
export const AUDIENCES = services.audiences;

/* ---------- Home ---------- */

export const HERO = {
  eyebrow: home.hero.eyebrow,
  lead: home.hero.lead,
  morphWords: home.hero.morphWords.length ? home.hero.morphWords : ['intelligent'],
  tail: home.hero.tail,
  photo: photo(home.hero.image, home.hero.imageAlt, teamEngineering),
};

export const MARQUEE = home.marquee;

/* ---------- Services ---------- */

export const SERVICES_INTRO = {
  label: services.intro.label,
  statement: highlights(services.intro.statement),
};

export const SERVICES_PHOTO = photo(services.card.image, services.card.imageAlt, serverRoom);

export const SERVICES = {
  label: services.list.label,
  title: services.list.title,
  items: services.items,
};

/* ---------- Process ---------- */

export const PROCESS = {
  label: processPage.label,
  title: processPage.title,
  intro: processPage.intro,
  photo: photo(processPage.image, processPage.imageAlt, planningSession),
  steps: processPage.steps,
};

export const FOUNDATIONS = processPage.foundations;

/* ---------- About ---------- */

export const ABOUT_INTRO = {
  label: about.intro.label,
  title: about.intro.title,
  photo: photo(about.intro.image, about.intro.imageAlt, teamMeeting),
};

export const ABOUT = {
  label: about.statement.label,
  statement: highlights(about.statement.text),
};

export const VALUES = about.values;
export const PRINCIPLES = about.principles;
export const HORIZONS = about.horizons;

/* ---------- Contact ---------- */

export const CONTACT = {
  title: contact.title,
  intro: contact.intro,
  // The project brief wizard. Option text is what arrives in the enquiry.
  steps: {
    needs: contact.needs,
    timeline: contact.timeline,
    budget: contact.budget,
    details: { legend: contact.detailsLegend },
  },
};

/* ---------- ZIIVOS product page ---------- */

export const ZIIVOS = {
  ...ziivos,
  // Pre-selects "ZIIVOS demo" in the project brief
  demoHref: '/contact/?interest=ziivos',
};

/* ---------- ZIIV Assess product page ---------- */

export const ASSESS = {
  ...assess,
  // Pre-selects "ZIIV Assess demo" in the project brief
  demoHref: '/contact/?interest=assess',
};
