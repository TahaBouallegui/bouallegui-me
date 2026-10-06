// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later

// Shared nav + footer injected into every page (guarantees identical markup).
window.PARTIALS = window.PARTIALS || {};

// The nav and footer are reused at the site root (index.html), one level down
// (posts/*.html), and in the French mirror (fr/*.html), so a single relative href cannot
// work for all three. Resolve the links against this script's own URL instead of the page's:
// partials.js always lives in <root>/js/, which also makes the links correct when the site is
// opened from file:// or served from a subdirectory.
window.SITE_ROOT = (function () {
  var src = document.currentScript && document.currentScript.src;
  if (!src) return '';
  return src.replace(/js\/partials\.js(\?.*)?$/, '');
})();

// The page's path relative to the site root decides two things: which language the chrome is
// written in, and which page the language switch points at. Pages with no translation (the
// posts) send the switch to the French index, which says so on the page itself.
window.SITE_LANG = 'en';
window.LANG_LINK = null;
(function () {
  var TRANSLATED = ['index.html', 'portfolio.html', 'blog.html', 'about.html', 'resume.html', 'contact.html', '404.html'];
  try {
    var root = new URL(SITE_ROOT || '/', window.location.href);
    var rel = decodeURIComponent(window.location.pathname).slice(root.pathname.length).replace(/^\/+/, '');
    var page = rel.replace(/^fr\//, '') || 'index.html';
    if (rel.indexOf('fr/') === 0) {
      window.SITE_LANG = 'fr';
      window.LANG_LINK = { href: SITE_ROOT + page, hreflang: 'en', label: 'EN', aria: 'Read this page in English' };
    } else if (TRANSLATED.indexOf(page) !== -1) {
      window.LANG_LINK = { href: SITE_ROOT + 'fr/' + page, hreflang: 'fr', label: 'FR', aria: 'Lire cette page en français' };
    } else {
      window.LANG_LINK = { href: SITE_ROOT + 'fr/blog.html', hreflang: 'fr', label: 'FR', aria: 'Lire cette page en français' };
    }
  } catch (err) { /* no switch rather than a broken one */ }
})();

// Chrome strings. The page body is written by hand in its own language; only the nav, the
// footer and the switch are generated here.
window.UI = (function () {
  var fr = window.SITE_LANG === 'fr';
  return {
    home: fr ? 'Accueil' : 'Home',
    portfolio: fr ? 'Projets' : 'Portfolio',
    blog: fr ? 'Notes' : 'Blog',
    about: fr ? 'À propos' : 'About',
    resume: fr ? 'CV' : 'Résumé',
    contact: 'Contact',
    tagline: fr ? 'Cybersécurité et systèmes, bien faits' : 'Cybersecurity and systems done right',
    license: fr ? 'Source du site et textes sous' : 'Site source and writing under',
    menu: fr ? 'Ouvrir le menu' : 'Toggle menu',
    theme: fr ? 'Passer au thème sombre' : 'Switch to dark theme'
  };
})();

window.PARTIALS.nav = `
<header id="site-header" class="fixed inset-x-0 top-0 z-50 transition-all duration-300">
  <div class="container flex h-16 items-center justify-between px-5 md:px-8">
    <a href="${SITE_ROOT}index.html" class="flex items-center gap-2.5 font-display text-lg font-bold text-white">
      <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-ocean font-mono text-sm font-bold text-white">BL</span>
      <span class="nav-brand">Bouallegui</span>
    </a>
    <div class="flex items-center gap-6">
      <ul id="main-menu" class="hidden md:flex items-center gap-7 font-display font-medium text-white">
        <li><a href="${SITE_ROOT}index.html" class="hover:text-link">${UI.home}</a></li>
        <li><a href="${SITE_ROOT}portfolio.html" class="hover:text-link">${UI.portfolio}</a></li>
        <li><a href="${SITE_ROOT}blog.html" class="hover:text-link">${UI.blog}</a></li>
        <li><a href="${SITE_ROOT}about.html" class="hover:text-link">${UI.about}</a></li>
        <li><a href="${SITE_ROOT}resume.html" class="hover:text-link">${UI.resume}</a></li>
        <li><a href="${SITE_ROOT}contact.html" class="hover:text-link">${UI.contact}</a></li>
      </ul>
      ${window.LANG_LINK ? `<a class="lang-switch flex h-8 items-center justify-center rounded-md border border-white/25 px-2 font-display text-xs font-semibold tracking-wider text-white/80 transition-colors duration-200 hover:border-white hover:text-white" href="${window.LANG_LINK.href}" hreflang="${window.LANG_LINK.hreflang}" lang="${window.LANG_LINK.hreflang}" aria-label="${window.LANG_LINK.aria}">${window.LANG_LINK.label}</a>` : ''}
      <button id="theme-toggle" type="button" class="theme-toggle -mr-1 flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200" aria-pressed="false" aria-label="${UI.theme}">
        <svg class="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.1 5.1l1.4 1.4M17.5 17.5l1.4 1.4M18.9 5.1l-1.4 1.4M6.5 17.5l-1.4 1.4"/></svg>
        <svg class="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>
      </button>
      <button class="menu-toggle flex flex-col justify-center gap-1.5 md:hidden" aria-label="${UI.menu}" aria-expanded="false" aria-controls="mobile-menu">
        <span class="block h-0.5 w-6 bg-white transition-all duration-300"></span>
        <span class="block h-0.5 w-6 bg-white transition-all duration-300"></span>
        <span class="block h-0.5 w-6 bg-white transition-all duration-300"></span>
      </button>
    </div>
  </div>
  <ul id="mobile-menu" class="flex max-h-[70vh] flex-col gap-1 overflow-auto bg-surface px-6 py-4 text-lg font-medium text-ink hidden md:hidden" aria-label="Mobile menu">
    <li><a href="${SITE_ROOT}index.html" class="block py-2 hover:text-link">${UI.home}</a></li>
    <li><a href="${SITE_ROOT}portfolio.html" class="block py-2 hover:text-link">${UI.portfolio}</a></li>
    <li><a href="${SITE_ROOT}blog.html" class="block py-2 hover:text-link">${UI.blog}</a></li>
    <li><a href="${SITE_ROOT}about.html" class="block py-2 hover:text-link">${UI.about}</a></li>
    <li><a href="${SITE_ROOT}resume.html" class="block py-2 hover:text-link">${UI.resume}</a></li>
    <li><a href="${SITE_ROOT}contact.html" class="block py-2 hover:text-link">${UI.contact}</a></li>
    ${window.LANG_LINK ? `<li><a href="${window.LANG_LINK.href}" hreflang="${window.LANG_LINK.hreflang}" lang="${window.LANG_LINK.hreflang}" class="block py-2 font-semibold text-link">${window.LANG_LINK.aria}</a></li>` : ''}
  </ul>
</header>
`;

window.PARTIALS.footer = `
<footer class="mt-24 border-t border-slate-200 bg-slate-50/80">
  <div class="container flex flex-wrap items-center justify-between gap-4 py-7 text-sm text-slate-600">
    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <p class="font-display text-slate-700">&copy; <span id="current-year">2026</span> Bouallegui.me - ${UI.tagline}</p>
      <p>${UI.license} <a href="https://www.gnu.org/licenses/gpl-3.0.html" rel="license" class="text-link transition hover:underline">GPL-3.0-or-later</a></p>
    </div>
    <ul class="flex items-center gap-6">
      <li><a href="https://github.com/TahaBouallegui" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="text-slate-500 transition hover:text-link"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-1.96c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/></svg></a></li>
      <li><a href="https://www.linkedin.com/in/ahmed-taha-bouallegui-474215306" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="text-slate-500 transition hover:text-link"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.76V9h3.4v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.36 4.26 5.43v6.21zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg></a></li>
      <li><a href="mailto:ahmedtbou@tutamail.com" aria-label="Email" class="text-slate-500 transition hover:text-link"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m2 4 10 6 10-6v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z"/><path class="fill-surface" d="m3.5 6.2 8.05 4.8a1 1 0 0 0 1 0L20.5 6.2 12 11 3.5 6.2z"/></svg></a></li>
      <li><a href="${SITE_ROOT}feed.xml" type="application/rss+xml" aria-label="RSS feed" class="text-slate-500 transition hover:text-link"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5.5" cy="18.5" r="2.2"/><path d="M3.5 4.5v3a12.5 12.5 0 0 1 12.5 12.5h3A15.5 15.5 0 0 0 3.5 4.5z"/><path d="M3.5 10.5v3a6.5 6.5 0 0 1 6.5 6.5h3a9.5 9.5 0 0 0-9.5-9.5z"/></svg></a></li>
    </ul>
  </div>
</footer>
`;
