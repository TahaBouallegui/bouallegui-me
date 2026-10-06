// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later

// 3D hero. Source for js/vendor/hero.bundle.js, which is what the site actually loads
// (built with `make hero`, i.e. esbuild bundling this file plus three, minified).
//
// three.js is ESM-only since r161: the build/three.min.js UMD file this used to load is gone
// from every version after 0.160.1, so the pinned package is bundled instead of pulled from a
// CDN at page load. The version lives in package.json, and the bundle is committed like
// css/output.css is.
// If the bundle fails (no WebGL, script blocked), we bail and the CSS gradient declared on
// #hero-canvas in src/input.css is the fallback - nothing else changes.

import {
  Scene, PerspectiveCamera, WebGLRenderer, Group,
  IcosahedronGeometry, EdgesGeometry, LineBasicMaterial, Line,
  MeshBasicMaterial, Mesh, BufferGeometry, BufferAttribute,
  Points, PointsMaterial,
} from 'three';

const container = document.getElementById('hero-canvas');

if (container) {
  init(container).catch(function () {
    // Silent by design: the hero still reads correctly as a flat gradient.
  });
}

async function init(el) {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new Scene();
  const camera = new PerspectiveCamera(60, el.clientWidth / Math.max(1, el.clientHeight), 0.1, 100);
  camera.position.z = 5;

  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.display = 'block';
  el.appendChild(renderer.domElement);

  // Wireframe icosahedron core (ocean blue edges, navy-tinted fill).
  const group = new Group();
  scene.add(group);
  const coreGeo = new IcosahedronGeometry(1.55, 1);
  const wire = new Line(
    new EdgesGeometry(coreGeo),
    new LineBasicMaterial({ color: 0x0077b6 })
  );
  const solid = new Mesh(
    coreGeo,
    new MeshBasicMaterial({ color: 0x023e8a, transparent: true, opacity: 0.06 })
  );
  group.add(wire, solid);

  // Orbiting particle field.
  const P = 700;
  const positions = new Float32Array(P * 3);
  for (let i = 0; i < P * 3; i++) positions[i] = (Math.random() - 0.5) * 11;
  const pGeo = new BufferGeometry();
  pGeo.setAttribute('position', new BufferAttribute(positions, 3));
  const particles = new Points(
    pGeo,
    new PointsMaterial({ color: 0x0096c7, size: 0.035, transparent: true, opacity: 0.7 })
  );
  scene.add(particles);

  function draw() { renderer.render(scene, camera); }

  function resize() {
    camera.aspect = el.clientWidth / Math.max(1, el.clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(el.clientWidth, el.clientHeight);
  }
  window.addEventListener('resize', resize);

  // Reduced motion: one static frame, no loop, no pointer-driven camera.
  if (reduceMotion) {
    camera.lookAt(scene.position);
    draw();
    window.addEventListener('resize', function () { resize(); draw(); });
    return;
  }

  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  function frame() {
    group.rotation.y += 0.003;
    group.rotation.x += 0.0015;
    particles.rotation.y -= 0.0004;
    camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (mouse.y * 1.6 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);
    draw();
  }

  // setAnimationLoop is the ONLY animation driver. animate() used to also call
  // requestAnimationFrame(animate) on itself, and every visibilitychange that re-armed
  // setAnimationLoop added a second chain - after a few tab switches the hero was
  // rendering 2x, 4x, 8x the intended number of frames per second.
  function play() { renderer.setAnimationLoop(frame); }
  function pause() { renderer.setAnimationLoop(null); }

  // One play/pause decision, taken from two independent triggers: the tab being hidden and
  // the hero being scrolled out of view. Re-arming through the same sync() keeps one loop.
  let onScreen = true;
  function sync() {
    if (onScreen && !document.hidden) play(); else pause();
  }

  document.addEventListener('visibilitychange', sync);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { onScreen = entry.isIntersecting; });
      sync();
    }, { threshold: 0 }).observe(el);
  }

  sync();
}
