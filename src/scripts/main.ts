// All client-side behaviour for the site. It runs on every page, and each
// feature checks for its own markup first, so pages only get what they use.

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = window.matchMedia('(min-width: 1101px)');

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!('IntersectionObserver' in window) || reducedMotion) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------- Header: solid background once the page scrolls ---------- */
function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  return () => header.classList.toggle('is-scrolled', window.scrollY > 8);
}

/* ---------- Mobile menu ---------- */
function initMenu() {
  const menu = document.getElementById('mobile-menu');
  const toggles = document.querySelectorAll<HTMLButtonElement>('[data-menu-toggle]');
  const close = menu?.querySelector<HTMLButtonElement>('[data-menu-close]');
  if (!menu || !close) return;
  let opener: HTMLElement | null = null;

  const open = (trigger: HTMLElement) => {
    opener = trigger;
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    toggles.forEach((t) => t.setAttribute('aria-expanded', 'true'));
    document.body.style.overflow = 'hidden';
    close.focus();
  };
  const shut = (restoreFocus = true) => {
    if (menu.hidden) return;
    menu.classList.remove('is-open');
    toggles.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    document.body.style.overflow = '';
    const hide = () => (menu.hidden = true);
    if (reducedMotion) hide();
    else menu.addEventListener('transitionend', hide, { once: true });
    if (restoreFocus) opener?.focus();
  };

  toggles.forEach((t) => t.addEventListener('click', () => open(t)));
  close.addEventListener('click', () => shut());
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => shut(false)));
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') shut();
    if (e.key !== 'Tab') return;
    // Keep focus inside the open dialog
    const items = [...menu.querySelectorAll<HTMLElement>('a, button')];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  desktop.addEventListener('change', (e) => e.matches && shut(false));
}

/* ---------- Work page: category filters ---------- */
function initFilters() {
  const group = document.querySelector<HTMLElement>('[data-filters]');
  if (!group) return;
  const buttons = [...group.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const lists = [...document.querySelectorAll<HTMLElement>('[data-filter-list]')];
  const status = document.querySelector<HTMLElement>('[data-filter-status]');

  const apply = (filter: string) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    let shown = 0;
    lists.forEach((list, li) => {
      list.querySelectorAll<HTMLElement>('[data-category]').forEach((item) => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.hidden = !match;
        if (match && li === 0) shown++;
      });
    });
    if (status) status.textContent = `Showing ${shown} ${shown === 1 ? 'project' : 'projects'}`;
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter ?? 'all')));
}

/* ---------- Contact: project brief wizard ---------- */
function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  const status = form?.querySelector<HTMLElement>('[data-contact-status]');
  if (!form || !status) return;
  const to = form.dataset.email ?? '';
  const steps = [...form.querySelectorAll<HTMLFieldSetElement>('[data-step]')];
  const back = form.querySelector<HTMLButtonElement>('[data-step-back]');
  const next = form.querySelector<HTMLElement>('[data-step-next]');
  const submit = form.querySelector<HTMLElement>('[data-step-submit]');
  const now = form.querySelector<HTMLElement>('[data-step-now]');
  const fill = form.querySelector<HTMLElement>('[data-step-fill]');
  const stepStatus = form.querySelector<HTMLElement>('[data-step-status]');
  let current = 0;

  const value = (name: string) => ((form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? '').trim();
  const checked = (name: string) =>
    [...form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`)].map((i) => i.value);

  // Arriving from a product page pre-selects that product's demo request
  const DEMOS: Record<string, string> = { ziivos: 'ZIIVOS demo', assess: 'ZIIV Assess demo' };
  const interest = DEMOS[new URLSearchParams(location.search).get('interest') ?? ''];
  if (interest) {
    const demo = form.querySelector<HTMLInputElement>(`input[name="needs"][value="${interest}"]`);
    if (demo) demo.checked = true;
  }

  const setFieldError = (field: HTMLInputElement | HTMLTextAreaElement, message: string) => {
    const error = document.getElementById(`${field.id}-error`);
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) field.setAttribute('aria-describedby', `${field.id}-error`);
    else field.removeAttribute('aria-describedby');
    if (error) error.textContent = message;
  };

  // Returns true when the step is complete; shows errors otherwise.
  const validate = (index: number): boolean => {
    const step = steps[index];
    const error = step.querySelector<HTMLElement>('[data-step-error]');
    const groups: Record<number, [string, string]> = {
      0: ['needs', 'Please choose at least one option.'],
      1: ['timeline', 'Please choose a timeline.'],
      2: ['budget', 'Please choose a budget range.'],
    };
    if (groups[index]) {
      const [name, message] = groups[index];
      const ok = checked(name).length > 0;
      if (error) error.textContent = ok ? '' : message;
      if (!ok) step.querySelector<HTMLInputElement>('input')?.focus();
      return ok;
    }
    const name = form.elements.namedItem('name') as HTMLInputElement;
    const email = form.elements.namedItem('email') as HTMLInputElement;
    const message = form.elements.namedItem('message') as HTMLTextAreaElement;
    const checks: [HTMLInputElement | HTMLTextAreaElement, string][] = [
      [name, name.value.trim() ? '' : 'Please enter your name.'],
      [email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? '' : 'Please enter a valid email address.'],
      [message, message.value.trim().length >= 10 ? '' : 'Please add a few words about the project.'],
    ];
    checks.forEach(([field, msg]) => setFieldError(field, msg));
    const firstInvalid = checks.find(([, msg]) => msg);
    firstInvalid?.[0].focus();
    return !firstInvalid;
  };

  const show = (index: number, moveFocus = true) => {
    current = index;
    steps.forEach((s, i) => (s.hidden = i !== index));
    if (back) back.hidden = index === 0;
    if (next) next.hidden = index === steps.length - 1;
    if (submit) submit.hidden = index !== steps.length - 1;
    if (now) now.textContent = String(index + 1);
    if (fill) fill.style.transform = `scaleX(${(index + 1) / steps.length})`;
    const legend = steps[index].querySelector<HTMLElement>('legend');
    if (stepStatus) stepStatus.textContent = `Step ${index + 1} of ${steps.length}: ${legend?.textContent ?? ''}`;
    if (moveFocus) legend?.focus();
  };

  next?.addEventListener('click', () => {
    if (validate(current)) show(current + 1);
  });
  back?.addEventListener('click', () => show(current - 1));

  // Enter in a text field advances instead of submitting early
  form.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    if (e.key === 'Enter' && target.tagName === 'INPUT' && current < steps.length - 1) {
      e.preventDefault();
      if (validate(current)) show(current + 1);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Without the wizard (one long form), check every step in turn
    for (let i = 0; i < steps.length; i++) {
      if (!validate(i)) {
        if (i !== current) show(i);
        status.textContent = '';
        return;
      }
    }

    const company = value('company');
    const phone = value('phone');
    const subject = `Project brief: ${value('name')}${company ? ` (${company})` : ''}`;
    const body = [
      `Name: ${value('name')}`,
      `Email: ${value('email')}`,
      company ? `Organisation: ${company}` : null,
      phone ? `Phone: ${phone}` : null,
      '',
      `Needs: ${checked('needs').join(', ')}`,
      `Timeline: ${checked('timeline').join('')}`,
      `Budget: ${checked('budget').join('')}`,
      '',
      value('message'),
    ]
      .filter((line) => line !== null)
      .join('\n');

    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = `Your email app should now open with your brief ready to send. If it does not, email us at ${to}.`;
  });

  show(0, false);
}

/* ---------- Boot ---------- */
initReveal();
initMenu();
initFilters();
initContactForm();

const onScroll = initHeader();
if (onScroll) {
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        onScroll();
      });
    },
    { passive: true }
  );
  onScroll();
}
