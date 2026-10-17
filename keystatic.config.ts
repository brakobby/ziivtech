// Keystatic CMS: the editing interface for all site content.
// Run `npm run dev` and open http://localhost:4321/keystatic
// Content is saved as JSON in src/cms/. Images go to src/assets/cms/<page>/
// and src/assets/work/<project>/; Keystatic names and places them itself.
import { config, collection, fields, singleton } from '@keystatic/core';

/* ---------- Reusable field helpers ---------- */

const text = (label: string, description?: string) => fields.text({ label, description });
const longText = (label: string, description?: string) => fields.text({ label, description, multiline: true });
const required = (label: string, description?: string) =>
  fields.text({ label, description, validation: { length: { min: 1 } } });

const textList = (label: string, itemLabel = 'Item', description?: string) =>
  fields.array(fields.text({ label: itemLabel }), {
    label,
    description,
    itemLabel: (props) => props.value || itemLabel,
  });

const nameTextList = (label: string, nameLabel = 'Name', textLabel = 'Text') =>
  fields.array(
    fields.object({
      name: required(nameLabel),
      text: longText(textLabel),
    }),
    { label, itemLabel: (props) => props.fields.name.value || nameLabel }
  );

const section = (label: string) => ({
  label: text('Small label', `The small uppercase line above the ${label.toLowerCase()} heading.`),
  title: required('Heading'),
});

// Each page keeps its photos in its own folder under src/assets/cms/<page>.
// (src/assets/photos holds the bundled originals, used as fallbacks.)
const photo = (label: string, page: string) =>
  fields.image({
    label,
    description: 'Large, landscape photos work best (at least 2000px wide).',
    directory: `src/assets/cms/${page}`,
    publicPath: `/src/assets/cms/${page}/`,
  });

const shot = (label: string, description: string) =>
  fields.image({ label, description, directory: 'src/assets/work', publicPath: '/src/assets/work/' });

const HIGHLIGHT_HINT = 'Wrap words in *asterisks* to highlight them in green.';

const ICONS = ['till', 'invoice', 'wallet', 'truck', 'box', 'megaphone', 'chart', 'users', 'sparkle', 'layers', 'devices', 'calendar', 'chat', 'mail', 'check', 'book', 'video', 'code'];

/* ---------- Config ---------- */

export default config({
  storage: { kind: 'local' },

  ui: {
    brand: { name: 'ZIIV Technologies' },
    navigation: {
      Pages: ['home', 'services', 'ziivos', 'assess', 'process', 'about', 'contact'],
      Portfolio: ['work', 'projects'],
      Settings: ['settings'],
    },
  },

  singletons: {
    settings: singleton({
      label: 'Site settings',
      path: 'src/cms/settings',
      format: { data: 'json' },
      schema: {
        tagline: required('Tagline'),
        description: longText('Company description', 'Used in the footer and for search engines.'),
        email: required('Enquiry email', 'Where enquiries and project briefs are sent.'),
        locationLine: text('Location line', 'Shown in the footer and on the Contact page.'),
        whatsapp: text('WhatsApp number', 'International format, digits only, e.g. 233503366564. Leave empty to hide all WhatsApp buttons.'),
        whatsappMessage: text('WhatsApp greeting', 'The message pre-typed when someone opens a chat.'),
        bookingUrl: text('Booking link', 'Your Cal.com or Calendly link. Leave empty to hide the "Book a call" buttons.'),
        social: fields.array(
          fields.object({
            label: required('Network', 'For example LinkedIn.'),
            url: text('Profile link', 'Leave empty to hide this network.'),
          }),
          { label: 'Social links', itemLabel: (props) => props.fields.label.value || 'Network' }
        ),
      },
    }),

    home: singleton({
      label: 'Home',
      path: 'src/cms/home',
      format: { data: 'json' },
      schema: {
        hero: fields.object(
          {
            eyebrow: text('Small line above the headline'),
            lead: required('Headline start', 'Before the changing word, e.g. "We build".'),
            morphWords: textList('Changing words', 'Word', 'These cycle in the middle of the headline. The first one is shown when animation is off.'),
            tail: required('Headline end', 'After the changing word, e.g. "software for business."'),
            image: photo('Photo below the headline', 'home'),
            imageAlt: text('Photo description', 'Describe the photo for people using screen readers.'),
          },
          { label: 'Opening section' }
        ),
        marquee: textList('Scrolling banner words', 'Word'),
        work: fields.object(section('Selected work'), { label: 'Selected work section' }),
        getInTouch: fields.object(
          {
            title: required('Heading'),
            cta: required('Button text'),
          },
          { label: 'Closing call to action', description: 'Shown at the bottom of every page except Contact.' }
        ),
      },
    }),

    work: singleton({
      label: 'Work page',
      path: 'src/cms/work',
      format: { data: 'json' },
      schema: {
        intro: fields.object(section('page'), { label: 'Opening section' }),
        ecosystem: fields.object(
          {
            ...section('ecosystem'),
            intro: longText('Introduction'),
            products: fields.array(
              fields.object({
                name: required('Product name'),
                what: longText('What it is'),
                status: text('Status', 'For example "Our product".'),
                note: text('Note under the status'),
              }),
              { label: 'Products', itemLabel: (props) => props.fields.name.value || 'Product' }
            ),
            footnote: longText('Footnote'),
          },
          { label: 'Product ecosystem table' }
        ),
      },
    }),

    services: singleton({
      label: 'Services',
      path: 'src/cms/services',
      format: { data: 'json' },
      schema: {
        intro: fields.object(
          {
            label: text('Small label'),
            statement: longText('Opening statement', HIGHLIGHT_HINT),
          },
          { label: 'Opening section' }
        ),
        card: fields.object(
          {
            image: photo('Feature photo', 'services'),
            imageAlt: text('Photo description'),
          },
          { label: 'Feature photo card' }
        ),
        audiences: fields.object(
          {
            ...section('Who we build for'),
            items: fields.array(
              fields.object({ name: required('Audience'), note: text('One-line note') }),
              { label: 'Audiences', itemLabel: (props) => props.fields.name.value || 'Audience' }
            ),
          },
          { label: 'Who we build for' }
        ),
        list: fields.object(section('services list'), { label: 'Services list heading' }),
        items: fields.array(
          fields.object({
            headline: required('Headline', 'For example "Putting intelligence to work".'),
            category: required('Service name', 'For example "Artificial Intelligence & Automation".'),
            description: longText('Description'),
            details: textList('What it includes', 'Item'),
          }),
          { label: 'Services', itemLabel: (props) => props.fields.category.value || 'Service' }
        ),
      },
    }),

    ziivos: singleton({
      label: 'ZIIVOS product page',
      path: 'src/cms/ziivos',
      format: { data: 'json' },
      schema: {
        label: text('Small label'),
        title: required('Headline'),
        intro: longText('Introduction'),
        modules: fields.object(
          {
            ...section('features'),
            items: fields.array(
              fields.object({
                icon: fields.select({
                  label: 'Icon',
                  options: ICONS.map((i) => ({ label: i, value: i })),
                  defaultValue: 'invoice',
                }),
                name: required('Feature'),
                text: longText('Description'),
              }),
              { label: 'Features', itemLabel: (props) => props.fields.name.value || 'Feature' }
            ),
          },
          { label: 'Features' }
        ),
        dede: fields.object(
          {
            ...section('DEDE'),
            text: longText('Description'),
            asksLabel: text('Questions label'),
            asks: textList('Example questions', 'Question'),
          },
          { label: 'Meet DEDE' }
        ),
        anywhere: fields.object(
          { ...section('Desktop and mobile'), text: longText('Description') },
          { label: 'Desktop and mobile' }
        ),
        cta: fields.object(
          { title: required('Heading'), text: longText('Text') },
          { label: 'Demo request section' }
        ),
      },
    }),

    assess: singleton({
      label: 'ZIIV Assess product page',
      path: 'src/cms/assess',
      format: { data: 'json' },
      schema: {
        label: text('Small label'),
        title: required('Headline'),
        intro: longText('Introduction'),
        appUrl: text('App link', 'Where the "Open ZIIV Assess" button goes.'),
        modules: fields.object(
          {
            ...section('features'),
            items: fields.array(
              fields.object({
                icon: fields.select({
                  label: 'Icon',
                  options: ICONS.map((i) => ({ label: i, value: i })),
                  defaultValue: 'check',
                }),
                name: required('Feature'),
                text: longText('Description'),
              }),
              { label: 'Features', itemLabel: (props) => props.fields.name.value || 'Feature' }
            ),
          },
          { label: 'Features' }
        ),
        codeLab: fields.object(
          {
            ...section('Code Lab'),
            text: longText('Description'),
            pointsLabel: text('List label'),
            points: textList('Points', 'Point'),
          },
          { label: 'Code Lab' }
        ),
        anywhere: fields.object(
          { ...section('Desktop and mobile'), text: longText('Description') },
          { label: 'Desktop and mobile' }
        ),
        cta: fields.object(
          { title: required('Heading'), text: longText('Text') },
          { label: 'Demo request section' }
        ),
      },
    }),

    process: singleton({
      label: 'Process',
      path: 'src/cms/process',
      format: { data: 'json' },
      schema: {
        ...section('page'),
        intro: longText('Search engine description'),
        image: photo('Opening photo', 'process'),
        imageAlt: text('Photo description'),
        steps: nameTextList('Steps', 'Step', 'What happens'),
        foundations: fields.object(
          {
            ...section('foundations'),
            intro: longText('Introduction'),
            rows: fields.array(
              fields.object({ type: required('Discipline'), text: longText('Description') }),
              { label: 'Disciplines', itemLabel: (props) => props.fields.type.value || 'Discipline' }
            ),
          },
          { label: 'Engineering foundations' }
        ),
      },
    }),

    about: singleton({
      label: 'About',
      path: 'src/cms/about',
      format: { data: 'json' },
      schema: {
        intro: fields.object(
          { ...section('page'), image: photo('Opening photo', 'about'), imageAlt: text('Photo description') },
          { label: 'Opening section' }
        ),
        statement: fields.object(
          { label: text('Small label'), text: longText('Statement', HIGHLIGHT_HINT) },
          { label: 'Statement', description: 'Also shown on the home page.' }
        ),
        values: fields.object(
          { ...section('values'), text: longText('Text'), items: textList('Values', 'Value') },
          { label: 'Values' }
        ),
        principles: fields.object(
          { ...section('principles'), items: nameTextList('Principles') },
          { label: 'Why ZIIV' }
        ),
        horizons: fields.object(
          { ...section('horizons'), items: nameTextList('Places') },
          { label: 'Where we’re headed' }
        ),
      },
    }),

    contact: singleton({
      label: 'Contact',
      path: 'src/cms/contact',
      format: { data: 'json' },
      schema: {
        title: required('Headline'),
        intro: text('Line under the headline'),
        needs: fields.object(
          { legend: required('Question'), hint: text('Hint'), options: textList('Options', 'Option') },
          { label: 'Step 1: what they need', description: 'Visitors can pick several. Keep "ZIIVOS demo" so the ZIIVOS page can pre-select it.' }
        ),
        timeline: fields.object(
          { legend: required('Question'), options: textList('Options', 'Option') },
          { label: 'Step 2: timeline' }
        ),
        budget: fields.object(
          { legend: required('Question'), hint: text('Hint'), options: textList('Options', 'Option') },
          { label: 'Step 3: budget' }
        ),
        detailsLegend: required('Step 4 question'),
      },
    }),
  },

  collections: {
    projects: collection({
      label: 'Projects',
      slugField: 'name',
      path: 'src/cms/projects/*',
      format: { data: 'json' },
      columns: ['status', 'order'],
      schema: {
        name: fields.slug({
          name: { label: 'Project name' },
          slug: { label: 'Web address', description: 'Used in the case study link: /work/<web address>/' },
        }),
        order: fields.integer({ label: 'Order', description: 'Lower numbers appear first.', defaultValue: 100 }),
        title: required('One-line title', 'For example "A trusted marketplace for devices".'),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Client project', value: 'Client project' },
            { label: 'Company product', value: 'Company product' },
            { label: 'Experience', value: 'Experience' },
          ],
          defaultValue: 'Client project',
        }),
        statusNote: text('Status note', 'Optional, e.g. "Live" or "Pre-launch".'),
        category: fields.select({
          label: 'Filter category',
          description: 'Which filter on the Work page shows this project.',
          options: [
            { label: 'Client work', value: 'client' },
            { label: 'Our products', value: 'products' },
            { label: 'Experience', value: 'experience' },
          ],
          defaultValue: 'client',
        }),
        featured: fields.checkbox({ label: 'Feature on the home page', defaultValue: false }),
        url: text('Live site link', 'Adds a "Visit" button to the case study. Leave empty if not public.'),
        page: text('Dedicated page', 'Advanced: link to a custom page instead of the case study, e.g. /ziivos/'),
        shots: fields.object(
          {
            desktop: shot('Desktop screenshot', 'About 1600 x 1000. Shown on the case study.'),
            tall: shot('Tall screenshot', 'Optional. About 1600 x 1400, used on cards so the page fills the frame.'),
            mobile: shot('Mobile screenshot', 'A phone-sized capture, shown beside the desktop view.'),
          },
          { label: 'Screenshots', description: 'Check that no client or customer data is visible before uploading.' }
        ),
        illustration: fields.select({
          label: 'Fallback illustration',
          description: 'Used when there are no screenshots.',
          options: [
            { label: 'None (brand pattern)', value: 'none' },
            { label: 'Invoicing', value: 'ziivos' },
            { label: 'Marketplace network', value: 'tradr' },
            { label: 'School dashboard', value: 'schools' },
            { label: 'Point of sale', value: 'pos' },
            { label: 'Device store', value: 'xbyt' },
          ],
          defaultValue: 'none',
        }),
        description: longText('Short description', 'Shown in lists and on the home page.'),
        areas: textList('Focus areas', 'Area'),
        summary: longText('Case study summary', 'The line under the project name.'),
        overview: fields.array(fields.text({ label: 'Paragraph', multiline: true }), {
          label: 'Overview paragraphs',
          itemLabel: (props) => (props.value ? props.value.slice(0, 60) + '…' : 'Paragraph'),
        }),
        scope: nameTextList('What it covers'),
        standing: longText('Where it stands'),
        ownership: longText('Ownership note', 'Make clear whether this is ZIIV’s product or a client’s.'),
      },
    }),
  },
});
