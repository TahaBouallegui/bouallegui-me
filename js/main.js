// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later

// Global interaction layer. Loaded before </body>, after js/theme.js has run.
(function () {
  'use strict';

  // Labels for the parts this script touches (toggles, lightbox). The nav and the footer are
  // in the page already, stamped at build time by scripts/render-partials.mjs, so the only
  // thing left to localise here is the strings this script writes at runtime.
  var T = document.documentElement.lang === 'fr'
    ? { light: 'Passer au thème clair', dark: 'Passer au thème sombre', skip: 'Aller au contenu principal',
        open: 'Ouvrir le menu', close: 'Fermer le menu', top: 'Haut de page',
        preview: 'Aperçu de l’image', closeImg: "Fermer l'image", enlarge: 'agrandir', image: 'Image' }
    : { light: 'Switch to light theme', dark: 'Switch to dark theme', skip: 'Skip to main content',
        open: 'Open menu', close: 'Close menu', top: 'Back to top',
        preview: 'Image preview', closeImg: 'Close image', enlarge: 'enlarge', image: 'Image' };

  // Footer copyright year.
  var cy = document.getElementById('current-year');
  if (cy) cy.textContent = String(new Date().getFullYear());

  // Theme toggle. The initial theme is set by js/theme.js in <head>, before paint,
  // so there is no flash; this handles the button, persistence, and chrome colours.
  (function themeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    var metaScheme = document.querySelector('meta[name="color-scheme"]');

    function effective() {
      var chosen = document.documentElement.getAttribute('data-theme');
      if (chosen) return chosen;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function paint() {
      var dark = effective() === 'dark';
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label', dark ? T.light : T.dark);
      if (metaTheme) metaTheme.setAttribute('content', dark ? '#09101C' : '#023E8A');
      if (metaScheme) metaScheme.setAttribute('content', dark ? 'dark' : 'light');
    }

    // Cards and buttons carry 300ms transitions, links 200ms, and the rest of the page has
    // none, so a theme flip used to cross-fade some areas a fifth of a second behind the
    // others. Transitions are switched off for the frame in which the theme changes; the
    // matching rule is .theme-swap in src/input.css.
    var swapSeq = 0;
    function swap(apply) {
      var root = document.documentElement;
      var seq = ++swapSeq;
      root.classList.add('theme-swap');
      apply();
      void root.offsetWidth; // force the new colours to be computed while transitions are off
      // A timer rather than requestAnimationFrame: rAF is paused in hidden tabs, and a
      // class left behind would switch hover transitions off for good.
      setTimeout(function () {
        if (seq === swapSeq) root.classList.remove('theme-swap');
      }, 50);
    }

    btn.addEventListener('click', function () {
      var next = effective() === 'dark' ? 'light' : 'dark';
      swap(function () {
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (err) { /* private mode */ }
        paint();
      });
    });

    // Follow the OS until the visitor chooses for themselves.
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', function () { swap(paint); });
    else if (mq.addListener) mq.addListener(function () { swap(paint); });
    paint();
  })();

  // Skip link. Every page carries it in the markup already; this only covers a page that was
  // generated without it, so the keyboard path to #main never depends on the build step.
  if (!document.getElementById('skip')) {
    var skip = document.createElement('a');
    skip.id = 'skip';
    skip.href = '#main';
    skip.className = 'skip-link';
    skip.textContent = T.skip;
    document.body.insertBefore(skip, document.body.firstChild);
  }

  // Highlight the active nav link. The hrefs are relative to the page, and the same stamped
  // markup serves the root, fr/ and posts/, so compare on the file name.
  (function () {
    var here = location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('#main-menu a');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href') || '';
      if (href.split('/').pop() === here) links[i].setAttribute('aria-current', 'page');
    }
  })();

  // Hamburger toggle.
  var toggle = document.querySelector('.menu-toggle');
  var mobile = document.getElementById('mobile-menu');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      var nowOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!nowOpen));
      toggle.setAttribute('aria-label', nowOpen ? T.open : T.close);
      mobile.classList.toggle('hidden', nowOpen);
    });
    mobile.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && toggle.getAttribute('aria-expanded') === 'true') toggle.click();
    });
    // If the menu is left open and the viewport grows past the md breakpoint, the panel is
    // hidden by `md:hidden` while aria-expanded still claims it is open. Reset the state.
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768 && toggle.getAttribute('aria-expanded') === 'true') {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', T.open);
        mobile.classList.add('hidden');
      }
    }, { passive: true });
  }

  // Nav solidifies after scrolling 80px.
  // The class has to go on #site-header itself: that is the position:fixed bar, and the rules
  // that flip the link/burger colours are `#site-header.nav-solid …` (src/input.css). Applied
  // to the <nav data-part="nav"> wrapper it also gave a zero-height element the white
  // background, so there was never any backdrop and the links stayed white on white.
  var header = document.getElementById('site-header');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function navSolid() {
    if (header) header.classList.toggle('nav-solid', window.scrollY > 80);
  }
  navSolid();
  window.addEventListener('scroll', navSolid, { passive: true });

  // Smooth scroll for in-page anchors (CSS scroll-behavior handles most; JS is the fallback).
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var t = id && document.getElementById(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // Scroll-triggered fade-ins.
  (function () {
    var els = document.querySelectorAll('[data-animate]');
    var list = Array.prototype.slice.call(els);
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Stagger on document order, not on position within this batch - batch membership
            // varies with scroll speed, which made the delays non-deterministic before.
            var delay = (list.indexOf(entry.target) % 6) * 70;
            (function (el, d) { setTimeout(function () { el.classList.add('in'); }, d); })(entry.target, delay);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      list.forEach(function (el) { io.observe(el); });
    } else {
      list.forEach(function (el) { el.classList.add('in'); });
    }
  })();

  // Back-to-top button.
  (function () {
    if (document.getElementById('back-to-top')) return;
    var btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.type = 'button';
    btn.className = 'fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-ocean text-white shadow-glow transition hover:bg-ocean-dark hover:-translate-y-0.5';
    btn.innerHTML = '<span aria-hidden="true">&#8593;</span><span class="sr-only">' + T.top + '</span>';
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(btn);
    function onScroll() { btn.classList.toggle('hidden', window.scrollY <= 400); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  // Lightbox gallery - keyboard-operable: triggers get role/tabindex, the dialog keeps focus
  // while open and hands it back to the trigger on close.
  (function () {
    if (document.getElementById('lightbox-root')) return;
    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox="img"]'));
    if (!triggers.length) return;

    var root = document.createElement('div');
    root.id = 'lightbox-root';
    root.innerHTML = '<div id="lightbox" class="lightbox" role="dialog" aria-modal="true" aria-label="' + T.preview + '"><button id="lightbox-close" class="lightbox-close" aria-label="' + T.closeImg + '">&times;</button><img id="lightbox-img" class="lightbox-img" alt=""></div>';
    document.body.appendChild(root);
    var lb = root.querySelector('#lightbox');
    var img = root.querySelector('#lightbox-img');
    var closeBtn = root.querySelector('#lightbox-close');
    var lastFocus = null;

    function open(el) {
      lastFocus = el;
      img.src = el.src;
      img.alt = el.alt || '';
      lb.classList.add('open');
      closeBtn.focus();
    }
    function close() {
      if (!lb.classList.contains('open')) return;
      lb.classList.remove('open');
      img.removeAttribute('src');
      if (lastFocus) lastFocus.focus();
    }

    triggers.forEach(function (el) {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', (el.alt || T.image) + ' - ' + T.enlarge);
      el.addEventListener('click', function () { open(el); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); open(el); }
      });
    });

    closeBtn.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') { close(); return; }
      // Minimal focus trap: the dialog contains exactly one focusable control.
      if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
    });
  })();

  // Parallax: translate [data-parallax] layers at a fraction of scroll.
  (function () {
    var layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length || reduceMotion) return;
    var ticking = false;
    function update() {
      var y = window.scrollY;
      layers.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        el.style.transform = 'translate3d(0,' + (y * speed) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  })();
})();
