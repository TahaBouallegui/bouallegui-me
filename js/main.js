// Global interaction layer. Loaded AFTER js/partials.js and BEFORE </body>.
(function () {
  'use strict';

  var nav = document.querySelector('[data-part="nav"]');
  var footer = document.querySelector('[data-part="footer"]');

  // Inject shared nav + footer (identical markup on every page).
  if (window.PARTIALS) {
    if (window.PARTIALS.nav && nav) nav.insertAdjacentHTML('afterbegin', window.PARTIALS.nav);
    if (window.PARTIALS.footer && footer) footer.insertAdjacentHTML('afterbegin', window.PARTIALS.footer);
  }

  // Footer copyright year.
  var cy = document.getElementById('current-year');
  if (cy) cy.textContent = String(new Date().getFullYear());

  // Skip link (injected once, first focusable element).
  if (!document.getElementById('skip')) {
    var skip = document.createElement('a');
    skip.id = 'skip';
    skip.href = '#main';
    skip.className = 'skip-link';
    skip.textContent = 'Skip to main content';
    document.body.insertBefore(skip, document.body.firstChild);
  }

  // Highlight the active nav link.
  (function () {
    var path = location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('#main-menu a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('href') === path) links[i].setAttribute('aria-current', 'page');
    }
  })();

  // Hamburger toggle.
  var toggle = document.querySelector('.menu-toggle');
  var mobile = document.getElementById('mobile-menu');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      var nowOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!nowOpen));
      toggle.setAttribute('aria-label', nowOpen ? 'Open menu' : 'Close menu');
      mobile.classList.toggle('hidden', nowOpen);
    });
    mobile.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && toggle.getAttribute('aria-expanded') === 'true') toggle.click();
    });
  }

  // Nav solidifies after scrolling 80px.
  function navSolid() {
    if (nav) nav.classList.toggle('nav-solid', window.scrollY > 80);
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
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry, idx) {
          if (entry.isIntersecting) {
            (function (el, d) { setTimeout(function () { el.classList.add('in'); }, d); })(entry.target, idx * 70);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add('in'); });
    }
  })();

  // Back-to-top button.
  (function () {
    if (document.getElementById('back-to-top')) return;
    var btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.type = 'button';
    btn.className = 'fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-ocean text-white shadow-glow transition hover:bg-ocean-dark hover:-translate-y-0.5';
    btn.innerHTML = '<span aria-hidden="true">&#8593;</span><span class="sr-only">Back to top</span>';
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(btn);
    function onScroll() { btn.classList.toggle('hidden', window.scrollY <= 400); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  // Lightbox gallery.
  (function () {
    if (document.getElementById('lightbox-root')) return;
    var root = document.createElement('div');
    root.id = 'lightbox-root';
    root.innerHTML = '<div id="lightbox" class="lightbox" role="dialog" aria-modal="true" aria-label="Image preview"><button id="lightbox-close" class="lightbox-close" aria-label="Close image">&times;</button><img id="lightbox-img" class="lightbox-img" src="" alt=""></div>';
    document.body.appendChild(root);
    var lb = root.querySelector('#lightbox');
    var img = root.querySelector('#lightbox-img');
    var closeBtn = root.querySelector('#lightbox-close');
    document.querySelectorAll('[datalightbox="img"]').forEach(function (el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function () {
        img.src = el.src;
        img.alt = el.alt || '';
        lb.classList.add('open');
      });
    });
    var closeBox = function () { lb.classList.remove('open'); };
    closeBtn.addEventListener('click', closeBox);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeBox(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeBox(); });
  })();

  // Parallax: translate [data-parallax] layers at a fraction of scroll.
  (function () {
    var layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length) return;
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
