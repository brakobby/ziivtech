// All client-side behaviour for the site. It runs on every page, and each
// feature checks for its own markup first, so pages only get what they use.

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = window.matchMedia('(min-width: 1025px)');
const finePointer = window.matchMedia('(pointer: fine)').matches;
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

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

/* ---------- Floating pill header ---------- */
function initPillHeader() {
  const pill = document.querySelector<HTMLElement>('[data-pill-header]');
  if (!pill) return;
  // Appear once the opening section is mostly scrolled past.
  const opener = document.querySelector<HTMLElement>('main > section');
  const focusables = pill.querySelectorAll<HTMLElement>('a, button');
  let visible = false;

  const set = (show: boolean) => {
    if (show === visible) return;
    visible = show;
    pill.classList.toggle('is-visible', show);
    pill.toggleAttribute('inert', !show);
    focusables.forEach((el) => (el.tabIndex = show ? 0 : -1));
  };
  pill.toggleAttribute('inert', true);
  return () => {
    const threshold = Math.min((opener?.offsetHeight ?? 400) * 0.65, window.innerHeight * 0.8);
    set(window.scrollY > Math.max(240, threshold));
  };
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

/* ---------- Custom cursor ---------- */
function initCursor() {
  const cursor = document.querySelector<HTMLElement>('.cursor');
  if (!cursor || reducedMotion || !finePointer) return;
  const label = cursor.querySelector<HTMLElement>('.cursor__label');
  root.classList.add('has-cursor');

  let x = 0;
  let y = 0;
  let queued = false;
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      if (cursor.dataset.variant === 'hidden') cursor.dataset.variant = 'dot';
      if (!queued) {
        queued = true;
        requestAnimationFrame(() => {
          cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          queued = false;
        });
      }
    },
    { passive: true }
  );

  document.addEventListener('pointerover', (e) => {
    const target = e.target as Element;
    if (target.closest('input[type="text"], input[type="email"], input[type="tel"], textarea')) {
      cursor.dataset.variant = 'hidden';
      return;
    }
    const hit = target.closest<HTMLElement>('[data-cursor], a, button, label');
    if (hit?.dataset.cursor === 'pill' && label) {
      label.textContent = hit.dataset.cursorLabel ?? 'View';
      cursor.dataset.variant = 'pill';
    } else {
      cursor.dataset.variant = hit ? 'hover' : 'dot';
    }
  });
  document.documentElement.addEventListener('pointerleave', () => (cursor.dataset.variant = 'hidden'));
}

/* ---------- Page transitions ---------- */
// Internal links play the curtain, then navigate. The next page starts
// covered (see BaseLayout) and the curtain lifts on a CSS timer.
function initPageTransitions() {
  if (reducedMotion) return;

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.protocol.startsWith('mailto')) return;
    // Same-page anchors scroll as normal
    if (url.pathname === location.pathname && url.search === location.search) return;

    e.preventDefault();
    try {
      sessionStorage.setItem('ziiv-transition', '1');
    } catch {}
    root.classList.add('is-leaving');
    window.setTimeout(() => location.assign(url.href), 520);
  });

  // Returning via back/forward restores a cached page; drop the curtain.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) root.classList.remove('is-leaving', 'is-entering');
  });
}

/* ---------- Home: selected work, scroll-driven active project ---------- */
function initWork() {
  const scroller = document.querySelector<HTMLElement>('[data-work]');
  if (!scroller) return;
  const items = [...scroller.querySelectorAll<HTMLElement>('[data-work-item]')];
  const slides = [...scroller.querySelectorAll<HTMLElement>('[data-work-slide]')];
  const counter = scroller.querySelector<HTMLElement>('[data-work-counter]');
  let current = 0;

  const activate = (index: number) => {
    if (index === current) return;
    current = index;
    items.forEach((el, i) => el.classList.toggle('is-active', i === index));
    slides.forEach((el, i) => el.classList.toggle('is-active', i === index));
    if (counter) counter.textContent = String(index + 1).padStart(2, '0');
  };

  return () => {
    if (!desktop.matches) return;
    const step = window.innerHeight * 0.75;
    const offset = -scroller.getBoundingClientRect().top;
    activate(clamp(Math.floor(offset / step), 0, items.length - 1));
  };
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
      let firstVisible = true;
      list.querySelectorAll<HTMLElement>('[data-category]').forEach((item) => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.hidden = !match;
        // The first visible card in the grid spans the full width
        item.classList.toggle('is-featured', match && firstVisible && item.classList.contains('card'));
        if (match) firstVisible = false;
        if (match && li === 0) shown++;
      });
    });
    if (status) status.textContent = `Showing ${shown} ${shown === 1 ? 'project' : 'projects'}`;
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter ?? 'all')));
}

/* ---------- Process page: pinned stepper ---------- */
function initProcessSteps() {
  const scroller = document.querySelector<HTMLElement>('[data-steps]');
  const section = scroller?.closest<HTMLElement>('.psteps');
  if (!scroller || !section) return;
  const panels = [...scroller.querySelectorAll<HTMLElement>('[data-step-panel]')];
  const pills = [...scroller.querySelectorAll<HTMLElement>('[data-step-pill]')];
  const count = scroller.querySelector<HTMLElement>('[data-step-count]');
  const n = panels.length;
  let current = 0;

  const travel = () => scroller.offsetHeight - window.innerHeight;

  pills.forEach((pill, i) =>
    pill.addEventListener('click', () => {
      const top = scroller.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + ((i + 0.5) / n) * travel(), behavior: reducedMotion ? 'auto' : 'smooth' });
    })
  );

  return () => {
    if (!desktop.matches) return;
    const progress = clamp(-scroller.getBoundingClientRect().top / travel());
    const index = Math.min(n - 1, Math.floor(progress * n));
    section.style.setProperty('--draw', clamp((progress * n - 0.5) / (n - 1)).toFixed(3));
    pills.forEach((p, i) => {
      p.classList.toggle('is-reached', i <= index);
      p.classList.toggle('is-active', i === index);
    });
    if (index === current) return;
    current = index;
    panels.forEach((p, i) => p.classList.toggle('is-active', i === index));
    if (count) count.textContent = String(index + 1).padStart(2, '0');
  };
}

/* ---------- Services page: light-catching card ---------- */
function initShine() {
  const card = document.querySelector<HTMLElement>('[data-shine]');
  if (!card || reducedMotion || !finePointer) return;
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1));
    card.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(1));
    card.classList.add('is-lit');
  });
  card.addEventListener('pointerleave', () => {
    card.classList.remove('is-lit');
    card.style.setProperty('--mx', '50');
    card.style.setProperty('--my', '50');
  });
}

/* ---------- Services: draw the mark with scroll ---------- */
function initServicesMark() {
  const section = document.querySelector<HTMLElement>('[data-services]');
  const mark = section?.querySelector<HTMLElement>('.services__mark');
  if (!section || !mark || reducedMotion) return;
  return () => {
    const rect = mark.getBoundingClientRect();
    const vh = window.innerHeight;
    section.style.setProperty('--p', clamp((vh * 0.85 - rect.top) / (rect.height * 0.75)).toFixed(3));
  };
}

/* ---------- About statement: fill word by word ---------- */
function initAboutFill() {
  const statement = document.querySelector<HTMLElement>('[data-fill]');
  const section = statement?.closest<HTMLElement>('.about');
  if (!statement || !section || reducedMotion) return;
  return () => {
    const rect = statement.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = clamp((vh * 0.9 - rect.top) / (vh * 0.55 + rect.height * 0.5), 0, 1.1);
    section.style.setProperty('--fill', progress.toFixed(3));
  };
}

/* ---------- Services accordion (home) ---------- */
function initAccordion() {
  document.querySelectorAll<HTMLButtonElement>('[data-accordion]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.closest('.service')?.classList.toggle('is-open', open);
    });
  });
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

  // Arriving from the ZIIVOS page pre-selects a demo request
  if (new URLSearchParams(location.search).get('interest') === 'ziivos') {
    const demo = form.querySelector<HTMLInputElement>('input[name="needs"][value="ZIIVOS demo"]');
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
initCursor();
initPageTransitions();
initFilters();
initShine();
initAccordion();
initContactForm();

const onScroll = [initPillHeader(), initWork(), initProcessSteps(), initServicesMark(), initAboutFill()].filter(
  (fn): fn is () => void => typeof fn === 'function'
);
let ticking = false;
const update = () => {
  ticking = false;
  onScroll.forEach((fn) => fn());
};
const requestUpdate = () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
};
window.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', requestUpdate);
update();
