// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later

// Load the three.js hero only when it can actually be seen and used.
//
// js/vendor/hero.bundle.js is 528 KB. The scene inside it already refuses to run under
// prefers-reduced-motion and stops when the hero scrolls out of view, but by then the bytes
// have been downloaded. This file makes the same three checks before asking for them, so a
// phone on a slow connection, a reduced-motion visitor and a browser without WebGL never pay.
//
// The hero keeps the CSS gradient painted on #hero-canvas, so when nothing loads the section
// still looks intentional.

(function () {
  var host = document.getElementById('hero-canvas');
  if (!host) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // The bundle is a sibling of this file. import() in a classic script resolves against this
  // script's own URL, so the path is built from that URL rather than from the page's, which is
  // different for / and /fr/.
  var self = document.currentScript.getAttribute('src') || 'js/hero-loader.js';
  var here = new URL(self, document.baseURI);

  function load() {
    import(new URL('vendor/hero.bundle.js', here).href).catch(function () { /* the gradient stays */ });
  }

  function whenVisible() {
    if (!('IntersectionObserver' in window)) { load(); return; }
    new IntersectionObserver(function (entries, obs) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) { obs.disconnect(); load(); return; }
      }
    }).observe(host);
  }

  // After first paint, not during it.
  if ('requestIdleCallback' in window) requestIdleCallback(whenVisible);
  else setTimeout(whenVisible, 200);
})();
