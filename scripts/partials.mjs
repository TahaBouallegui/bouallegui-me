// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later

// The nav and the footer, as strings, for scripts/render-partials.mjs.
//
// They used to be assembled in the browser by js/partials.js. That meant every page shipped
// an empty <nav> and an empty <footer> and showed nothing until JavaScript ran, so the menu
// was missing for a reader with scripting off and the links were invisible to a crawler that
// does not run it. Now the same markup is stamped into the HTML at build time and committed,
// exactly like css/output.css and feed.xml are.
//
// Run `make partials` after editing anything here, then commit the pages.

const UI = {
  en: {
    home: 'Home', portfolio: 'Portfolio', blog: 'Blog', about: 'About', resume: 'Résumé', contact: 'Contact',
    tagline: 'Cybersecurity and systems done right',
    license: 'Site source and writing under',
    menu: 'Toggle menu', theme: 'Switch to dark theme',
    skip: 'Skip to main content',
  },
  fr: {
    home: 'Accueil', portfolio: 'Projets', blog: 'Notes', about: 'À propos', resume: 'CV', contact: 'Contact',
    tagline: 'Cybersécurité et systèmes, bien faits',
    license: 'Source du site et textes sous',
    menu: 'Ouvrir le menu', theme: 'Passer au thème sombre',
    skip: 'Aller au contenu principal',
  },
};

// Where the language switch points for a page given its path relative to the site root. The
// href is relative to the root and navHtml prefixes it with the page's own ../, which is why
// the English home comes back as an empty string: ../ plus nothing is the site root.
// The posts have no translation, so their switch points at the French blog index, which says so
// on the page itself. The two index pages switch to the clean directory URL, for the same reason
// the nav does: /index.html is 301ed to / by _redirects, and /fr/index.html to /fr/.
export const TRANSLATED = ['index.html', 'portfolio.html', 'blog.html', 'about.html', 'resume.html', 'contact.html', '404.html'];

export function langLink(rel) {
  const page = rel.replace(/^fr\//, '') || 'index.html';
  if (rel.startsWith('fr/')) {
    const href = page === 'index.html' ? '' : page;
    return { href, hreflang: 'en', label: 'EN', aria: 'Read this page in English' };
  }
  if (TRANSLATED.includes(page)) {
    const href = page === 'index.html' ? 'fr/' : `fr/${page}`;
    return { href, hreflang: 'fr', label: 'FR', aria: 'Lire cette page en français' };
  }
  return { href: 'fr/blog.html', hreflang: 'fr', label: 'FR', aria: 'Lire cette page en français' };
}

// hrefs in the stamped markup are relative to the page. `home` doubles as the prefix for the other
// five nav targets, because it is the current page's own directory: ./ at the root, ./ inside fr/,
// ../ from posts/. Using root for those instead sends every French page to the English portfolio,
// blog, about, CV and contact, which resolves fine and is therefore invisible to a link check.
//
// `home` is passed in rather than built from root: the home page of a French page is /fr/, not
// the English root, and root alone cannot tell those two apart. It is the clean URL (./ or ../),
// not index.html, because _redirects 301s /index.html to / and the canonical tag says /: linking
// the file name would put a redirect in the middle of the most common click on the site.
// `root` stays for the language switch, which by design crosses the boundary.
export function navHtml({ root = '', home = './', lang = 'en', link = null }) {
  const t = UI[lang];
  const switchHref = link ? root + link.href : '';
  return `
  <div id="site-header" class="fixed inset-x-0 top-0 z-50 transition-all duration-300">
    <div class="container flex h-16 items-center justify-between px-5 md:px-8">
      <a href="${home}" class="flex items-center gap-2.5 font-display text-lg font-bold text-white">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-ocean font-mono text-sm font-bold text-white">BL</span>
        <span class="nav-brand">Bouallegui</span>
      </a>
      <div class="flex items-center gap-6">
        <ul id="main-menu" class="hidden md:flex items-center gap-7 font-display font-medium text-white">
          <li><a href="${home}" class="hover:text-link">${t.home}</a></li>
          <li><a href="${home}portfolio.html" class="hover:text-link">${t.portfolio}</a></li>
          <li><a href="${home}blog.html" class="hover:text-link">${t.blog}</a></li>
          <li><a href="${home}about.html" class="hover:text-link">${t.about}</a></li>
          <li><a href="${home}resume.html" class="hover:text-link">${t.resume}</a></li>
          <li><a href="${home}contact.html" class="hover:text-link">${t.contact}</a></li>
        </ul>
        ${link ? `<a class="lang-switch flex h-8 items-center justify-center rounded-md border border-white/25 px-2 font-display text-xs font-semibold tracking-wider text-white/80 transition-colors duration-200 hover:border-white hover:text-white" href="${switchHref}" hreflang="${link.hreflang}" lang="${link.hreflang}" aria-label="${link.aria}">${link.label}</a>` : ''}
        <button id="theme-toggle" type="button" class="theme-toggle -mr-1 flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200" aria-pressed="false" aria-label="${t.theme}">
          <svg class="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.1 5.1l1.4 1.4M17.5 17.5l1.4 1.4M18.9 5.1l-1.4 1.4M6.5 17.5l-1.4 1.4"/></svg>
          <svg class="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>
        </button>
        <button class="menu-toggle flex flex-col justify-center gap-1.5 md:hidden" aria-label="${t.menu}" aria-expanded="false" aria-controls="mobile-menu">
          <span class="block h-0.5 w-6 bg-white transition-all duration-300"></span>
          <span class="block h-0.5 w-6 bg-white transition-all duration-300"></span>
          <span class="block h-0.5 w-6 bg-white transition-all duration-300"></span>
        </button>
      </div>
    </div>
    <ul id="mobile-menu" class="flex max-h-[70vh] flex-col gap-1 overflow-auto bg-surface px-6 py-4 text-lg font-medium text-ink hidden md:hidden" aria-label="Mobile menu">
      <li><a href="${home}" class="block py-2 hover:text-link">${t.home}</a></li>
      <li><a href="${home}portfolio.html" class="block py-2 hover:text-link">${t.portfolio}</a></li>
      <li><a href="${home}blog.html" class="block py-2 hover:text-link">${t.blog}</a></li>
      <li><a href="${home}about.html" class="block py-2 hover:text-link">${t.about}</a></li>
      <li><a href="${home}resume.html" class="block py-2 hover:text-link">${t.resume}</a></li>
      <li><a href="${home}contact.html" class="block py-2 hover:text-link">${t.contact}</a></li>
      ${link ? `<li><a href="${switchHref}" hreflang="${link.hreflang}" lang="${link.hreflang}" class="block py-2 font-semibold text-link">${link.aria}</a></li>` : ''}
    </ul>
  </div>
`;
}

export function footerHtml({ root = '', lang = 'en', year = 2026 }) {
  const t = UI[lang];
  return `<footer data-part="footer" class="mt-24 border-t border-slate-200 bg-slate-50/80">
  <div class="container flex flex-wrap items-center justify-between gap-4 py-7 text-sm text-slate-600">
    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <p class="font-display text-slate-700">&copy; <span id="current-year">${year}</span> Bouallegui.me - ${t.tagline}</p>
      <p>${t.license} <a href="https://www.gnu.org/licenses/gpl-3.0.html" rel="license" class="text-link transition hover:underline">GPL-3.0-or-later</a></p>
    </div>
    <ul class="flex items-center gap-6">
      <li><a href="https://github.com/TahaBouallegui" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="text-slate-500 transition hover:text-link"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-1.96c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/></svg></a></li>
      <li><a href="https://www.linkedin.com/in/ahmed-taha-bouallegui-474215306" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="text-slate-500 transition hover:text-link"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.76V9h3.4v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.36 4.26 5.43v6.21zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg></a></li>
      <li><a href="mailto:ahmedtbou@tutamail.com" aria-label="Email" class="text-slate-500 transition hover:text-link"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m2 4 10 6 10-6v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z"/><path class="fill-surface" d="m3.5 6.2 8.05 4.8a1 1 0 0 0 1 0L20.5 6.2 12 11 3.5 6.2z"/></svg></a></li>
      <li><a href="${root}feed.xml" type="application/rss+xml" aria-label="RSS feed" class="text-slate-500 transition hover:text-link"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5.5" cy="18.5" r="2.2"/><path d="M3.5 4.5v3a12.5 12.5 0 0 1 12.5 12.5h3A15.5 15.5 0 0 0 3.5 4.5z"/><path d="M3.5 10.5v3a6.5 6.5 0 0 1 6.5 6.5h3a9.5 9.5 0 0 0-9.5-9.5z"/></svg></a></li>
    </ul>
  </div>
</footer>`;
}

export function skipHtml({ lang = 'en' }) {
  return `<a id="skip" class="skip-link" href="#main">${UI[lang].skip}</a>`;
}
