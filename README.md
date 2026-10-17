# ZIIV Technologies website

Marketing site for ZIIV Technologies (*Zero-Interface Intelligence & Vision*). The layout follows the reference site escolhadigital.com, recoloured and rewritten for ZIIV.

Built with [Astro](https://astro.build): static HTML output, no UI framework, and a small vanilla TypeScript file for interactions.

## Commands

| Command           | What it does                                |
| ----------------- | ------------------------------------------- |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Start the dev server at `localhost:4321`    |
| `npm run build`   | Build the static site into `dist/`          |
| `npm run preview` | Serve the built site locally                |

`dist/` can be deployed to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages and similar).

## Pages

| URL | Page |
| --- | --- |
| `/` | Home |
| `/work/` | Work: filterable project grid, project index, product ecosystem |
| `/work/<project>/` | Case study (one per project in `WORK.projects`) |
| `/services/` | Services |
| `/ziivos/` | ZIIVOS product page with demo requests |
| `/ziiv-assess/` | ZIIV Assess product page with demo requests |
| `/process/` | Process and engineering foundations |
| `/about/` | About, values, principles, where we are headed |
| `/contact/` | Four-step project brief, plus WhatsApp and call booking |

## Editing content (CMS)

All page copy, projects, photos and site settings are managed in **Keystatic**.

1. Run `npm run dev`.
2. Open **http://localhost:4321/keystatic**.
3. Edit, then press **Save**. The site at http://localhost:4321 updates straight away.

| In the CMS | Controls |
| --- | --- |
| Pages: Home, Services, ZIIVOS, ZIIV Assess, Process, About, Contact | The copy and photos on each page |
| Portfolio: Work page | Work page heading and the product ecosystem table |
| Portfolio: Projects | Every project, case study and screenshot. Adding a project creates its case study page. |
| Settings: Site settings | Email, WhatsApp number, booking link, social links, tagline |

Tips:

- In the About and Services statements, wrap words in `*asterisks*` to highlight them in green.
- Projects need both a desktop and a mobile screenshot to show screenshots; otherwise the chosen illustration is used.
- **Before uploading screenshots, make sure no client or customer data is visible.**
- Saved content lives in `src/cms/` (JSON) and images in `src/assets/cms/` and `src/assets/work/`. Commit these files to publish changes.

### Editing on the live site

Right now the CMS runs only on your computer (`storage: { kind: 'local' }`), and the published site is fully static. To let the team edit from anywhere once the site is on GitHub and hosted:

1. In `keystatic.config.ts`, change storage to `{ kind: 'github', repo: 'OWNER/REPO' }` (or use Keystatic Cloud).
2. Add a server adapter for your host (for example `@astrojs/vercel` or `@astrojs/netlify`) and enable the Keystatic integration in production in `astro.config.mjs`.
3. Follow Keystatic's first-run prompt to connect GitHub. Each save then becomes a commit, and the host redeploys automatically.

## Where things live

```
keystatic.config.ts   CMS fields: what editors can change and how
src/
  cms/                Content saved by the CMS (one JSON file per page, plus projects/)
  data/               Reads the CMS content and shapes it for components
    site.ts           Settings plus navigation (navigation stays in code)
    content.ts        Page content
    work.ts           Projects and the Work page
    brand.ts          Geometry and colours of the ZIIV mark
  assets/             Photos, screenshots and ZIIVOS mockups
  styles/global.css   Design tokens (colours, type scale, spacing) and base styles
  layouts/            BaseLayout: head, header, footer, intro and page transition
  components/         One component per section, plus shared pieces
  scripts/main.ts     Interactions: reveals, menu, cursor, transitions, filters, project brief
  pages/              One file per page; work/[slug].astro builds the case studies
```

## Before launch

- **Enquiry email.** The email in the CMS (Site settings) is the placeholder `hello@ziivtech.com`. Replace it with the real inbox.
- **Domain.** `site` in `astro.config.mjs` and `SITE.url` are set to `https://ziivtech.com`. Confirm the domain.
- **Call booking.** Add a Cal.com or Calendly link in the CMS under Site settings to show the "Book a call" buttons. (WhatsApp is already set.)
- **Budget ranges.** The project brief's budget options (CMS: Contact, Step 3) are a starting point; adjust them to match ZIIV's pricing.
- **Social links.** Add profile links in the CMS (Site settings). A link appears in the footer only once its URL is set.
- **Contact form.** There is no backend yet. Submitting validates the form and opens the visitor's email app with the message pre-filled. To receive submissions directly, point the handler in `scripts/main.ts` (`initContactForm`) at a form service or API endpoint.
- **Project visuals.** TRADR and School systems use built-in illustrations because they have no screenshots. Upload real screenshots in the CMS when available.
