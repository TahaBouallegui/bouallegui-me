// Shared nav + footer injected into every page (guarantees identical markup).
window.PARTIALS = window.PARTIALS || {};

window.PARTIALS.nav = `
<header id="site-header" class="fixed inset-x-0 top-0 z-50 transition-all duration-300">
  <div class="container flex h-16 items-center justify-between px-5 md:px-8">
    <a href="index.html" class="flex items-center gap-2.5 font-display text-lg font-bold text-ocean-dark">
      <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-ocean font-mono text-sm font-bold text-white">BL</span>
      <span class="nav-brand">Bouallegui</span>
    </a>
    <button class="menu-toggle flex flex-col justify-center gap-1.5 md:hidden" aria-label="Toggle menu" aria-expanded="false" aria-controls="mobile-menu">
      <span class="block h-0.5 w-6 bg-ink transition-all duration-300"></span>
      <span class="block h-0.5 w-6 bg-ink transition-all duration-300"></span>
      <span class="block h-0.5 w-6 bg-ink transition-all duration-300"></span>
    </button>
    <ul id="main-menu" class="hidden md:flex items-center gap-7 font-display font-medium text-slate-700">
      <li><a href="index.html" class="hover:text-ocean">Home</a></li>
      <li><a href="portfolio.html" class="hover:text-ocean">Portfolio</a></li>
      <li><a href="blog.html" class="hover:text-ocean">Blog</a></li>
      <li><a href="about.html" class="hover:text-ocean">About</a></li>
      <li><a href="contact.html" class="hover:text-ocean">Contact</a></li>
    </ul>
  </div>
  <ul id="mobile-menu" class="flex max-h-[70vh] flex-col gap-1 overflow-auto bg-white px-6 py-4 text-lg font-medium text-slate-800 hidden md:hidden" aria-label="Mobile menu">
    <li><a href="index.html" class="block py-2 hover:text-ocean">Home</a></li>
    <li><a href="portfolio.html" class="block py-2 hover:text-ocean">Portfolio</a></li>
    <li><a href="blog.html" class="block py-2 hover:text-ocean">Blog</a></li>
    <li><a href="about.html" class="block py-2 hover:text-ocean">About</a></li>
    <li><a href="contact.html" class="block py-2 hover:text-ocean">Contact</a></li>
  </ul>
</header>
`;

window.PARTIALS.footer = `
<footer class="mt-24 border-t border-slate-200 bg-slate-50/80">
  <div class="container flex flex-wrap items-center justify-between gap-4 py-7 text-sm text-slate-600">
    <p class="font-display text-slate-700">&copy; <span id="current-year">2026</span> Bouallegui.me &mdash; Cybersecurity and systems done right</p>
    <ul class="flex items-center gap-6">
      <li><a href="https://github.com/bouallegui" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="text-slate-500 transition hover:text-ocean"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-1.96c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/></svg></a></li>
      <li><a href="https://linkedin.com/in/bouallegui" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="text-slate-500 transition hover:text-ocean"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.76V9h3.4v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.36 4.26 5.43v6.21zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg></a></li>
      <li><a href="mailto:hello@bouallegui.me" aria-label="Email" class="text-slate-500 transition hover:text-ocean"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m2 4 10 6 10-6v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z"/><path fill="#fff" d="m3.5 6.2 8.05 4.8a1 1 0 0 0 1 0L20.5 6.2 12 11 3.5 6.2z"/></svg></a></li>
    </ul>
  </div>
</footer>
`;
