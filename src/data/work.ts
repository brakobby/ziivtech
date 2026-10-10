// Portfolio content, read from the CMS: projects live in src/cms/projects/
// (one JSON file each), the Work page settings in src/cms/work.json.
// Edit them at /keystatic while the dev server runs.
import workPage from '../cms/work.json';
import home from '../cms/home.json';
import { resolveImage } from './images';

export type ProjectStatus = 'Company product' | 'Client project' | 'Experience';
export type ProjectCategory = 'client' | 'products' | 'experience';
/** Built-in illustrations used when a project has no screenshots. */
export type Illustration = 'none' | 'ziivos' | 'tradr' | 'schools' | 'pos' | 'xbyt';

export interface Project {
  slug: string;
  name: string;
  title: string;
  status: ProjectStatus;
  statusNote?: string;
  category: ProjectCategory;
  /** Shown in the home page's pinned work list. */
  featured?: boolean;
  /** Public site, for live projects. */
  url?: string;
  /** A dedicated page that replaces the generic case study. */
  page?: string;
  illustration: Illustration;
  /** Screenshots of the live product; projects without them use an illustration.
   *  `tall` (1600 x 1400) fills card frames when present; otherwise cards pair
   *  `desktop` and `mobile`, as case studies do. */
  shots?: { desktop: ImageMetadata; tall?: ImageMetadata; mobile: ImageMetadata };
  description: string;
  areas: string[];
  caseStudy: {
    summary: string;
    overview: string[];
    scope: { name: string; text: string }[];
    standing: string;
    ownership: string;
  };
}

/** The shape of a project file written by the CMS. */
interface ProjectEntry {
  name: string;
  order?: number | null;
  title: string;
  status: ProjectStatus;
  statusNote?: string;
  category: ProjectCategory;
  featured?: boolean;
  url?: string | null;
  page?: string;
  illustration?: Illustration;
  shots?: { desktop?: string | null; tall?: string | null; mobile?: string | null };
  description: string;
  areas?: string[];
  summary: string;
  overview?: string[];
  scope?: { name: string; text: string }[];
  standing: string;
  ownership: string;
}

const files = import.meta.glob<ProjectEntry>('../cms/projects/*.json', { eager: true, import: 'default' });

const projects: Project[] = Object.entries(files)
  .map(([path, e]) => {
    const desktop = resolveImage(e.shots?.desktop);
    const mobile = resolveImage(e.shots?.mobile);
    const project: Project = {
      slug: path.split('/').pop()!.replace(/\.json$/, ''),
      name: e.name,
      title: e.title,
      status: e.status,
      statusNote: e.statusNote || undefined,
      category: e.category,
      featured: !!e.featured,
      url: e.url || undefined,
      page: e.page || undefined,
      illustration: e.illustration ?? 'none',
      // Both a desktop and a mobile capture are needed for the screenshot layouts
      shots: desktop && mobile ? { desktop, mobile, tall: resolveImage(e.shots?.tall) } : undefined,
      description: e.description,
      areas: e.areas ?? [],
      caseStudy: {
        summary: e.summary,
        overview: e.overview ?? [],
        scope: e.scope ?? [],
        standing: e.standing,
        ownership: e.ownership,
      },
    };
    return { order: e.order ?? 100, project };
  })
  .sort((a, b) => a.order - b.order)
  .map((x) => x.project);

/** Where a project's card links: its own page, or its case study. */
export const projectHref = (p: Project) => p.page ?? `/work/${p.slug}/`;

export const WORK_FILTERS: { id: 'all' | ProjectCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'client', label: 'Client work' },
  { id: 'products', label: 'Our products' },
  { id: 'experience', label: 'Experience' },
];

export const WORK = {
  label: home.work.label,
  title: home.work.title,
  projects,
};

export const WORK_INTRO = workPage.intro;
export const ECOSYSTEM = workPage.ecosystem;
