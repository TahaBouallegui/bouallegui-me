// Three.js 3D hero. Loaded in <head> AFTER the pinned CDN script for THREE.
// If THREE is unavailable (CDN blocked), the CSS gradient on #hero-canvas is the fallback.
(function () {
  var container = document.getElementById('hero-canvas');
  if (!container) return;
  if (typeof THREE === 'undefined') return; // let the CSS gradient show

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / Math.max(1, container.clientHeight),
    0.1,
    100
  );
  camera.position.z = 5;

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  var group = new THREE.Group();
  scene.add(group);

  // Wireframe icosahedron core (ocean blue edges, navy-tinted fill).
  var coreGeo = new THREE.IcosahedronGeometry(1.55, 1);
  var wire = new THREE.Line(
    new THREE.EdgesGeometry(coreGeo),
    new THREE.LineBasicMaterial({ color: 0x0077B6 })
  );
  var solid = new THREE.Mesh(
    coreGeo,
    new THREE.MeshBasicMaterial({ color: 0x023E8A, transparent: true, opacity: 0.06 })
  );
  group.add(wire, solid);

  // Orbiting particle field.
  var P = 700;
  var positions = new Float32Array(P * 3);
  for (var i = 0; i < P * 3; i++) positions[i] = (Math.random() - 0.5) * 11;
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: 0x0096C7, size: 0.035, transparent: true, opacity: 0.7 })
  );
  scene.add(particles);

  var mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX / window.innerWidth * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function animate() {
    requestAnimationFrame(animate);
    group.rotation.y += 0.003;
    group.rotation.x += 0.0015;
    particles.rotation.y -= 0.0004;
    camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (mouse.y * 1.6 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  function resize() {
    camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener('resize', resize);

  // Pause rendering when the tab is hidden (save CPU/battery).
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) renderer.setAnimationLoop(null);
    else renderer.setAnimationLoop(animate);
  });
})();
