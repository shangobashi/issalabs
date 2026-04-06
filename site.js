const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
const lowPowerDevice =
  hasCoarsePointer || ((navigator.hardwareConcurrency || 8) <= 4);

document.addEventListener("DOMContentLoaded", () => {
  initScene();
  initAnimations();
  initTilt();
});

function initAnimations() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!gsap || prefersReducedMotion) {
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
    return;
  }

  if (ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  gsap.defaults({ overwrite: "auto" });

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".topbar", { y: -24, autoAlpha: 0, duration: 0.72 })
    .from(".hero-copy .eyebrow", { y: 18, autoAlpha: 0, duration: 0.46 }, "-=0.36")
    .from(".hero-copy h1", { y: 28, autoAlpha: 0, duration: 0.96 }, "-=0.12")
    .from(".hero-lede", { y: 24, autoAlpha: 0, duration: 0.72 }, "-=0.62")
    .from(".hero-actions > *", { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.46 }, "-=0.42")
    .from(".proof-item", { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.54 }, "-=0.32")
    .from(".trust-ribbon span", { y: 12, autoAlpha: 0, stagger: 0.05, duration: 0.38 }, "-=0.28")
    .from(".stage-panel", { y: 24, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, "-=0.6")
    .from(".signal-ribbon", { y: 16, autoAlpha: 0, duration: 0.44 }, "-=0.36");

  gsap.utils.toArray("[data-reveal]").forEach((element) => {
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.84,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 84%"
      }
    });
  });

  gsap.to(".status-dot", {
    boxShadow: "0 0 20px rgba(183, 162, 133, 0.48)",
    duration: 1.6,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  if (!lowPowerDevice) {
    gsap.to(".atlas-node", {
      scale: 1.12,
      opacity: 0.88,
      duration: 1.6,
      stagger: {
        each: 0.14,
        repeat: -1,
        yoyo: true
      },
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      transformOrigin: "center"
    });

    gsap.to(".atlas-link", {
      opacity: 0.28,
      duration: 2.2,
      stagger: 0.18,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  } else {
    gsap.to(".atlas-node", {
      opacity: 0.9,
      duration: 1.4,
      stagger: 0.14,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  gsap.set(".metric-bar span", {
    scaleX: 0,
    transformOrigin: "left center"
  });

  gsap.to(".metric-bar span", {
    scaleX: 1,
    duration: 1.1,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".stage-ledger",
      start: "top 85%"
    }
  });

  gsap.to(".footer-line", {
    opacity: 0.4,
    scaleX: 1.03,
    duration: 3.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    transformOrigin: "center"
  });
}

function initTilt() {
  if (prefersReducedMotion || !hasFinePointer) {
    return;
  }

  document.querySelectorAll("[data-tilt]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
      const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
      element.style.setProperty("--tilt-x", `${(-vertical * 7).toFixed(2)}deg`);
      element.style.setProperty("--tilt-y", `${(horizontal * 9).toFixed(2)}deg`);
      element.classList.add("is-tilting");
    });

    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--tilt-x", "0deg");
      element.style.setProperty("--tilt-y", "0deg");
      element.classList.remove("is-tilting");
    });
  });
}

function initScene() {
  const canvas = document.getElementById("scene");
  const THREE = window.THREE;
  if (!(canvas instanceof HTMLCanvasElement) || !THREE) {
    return;
  }

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
  } catch {
    return;
  }

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, lowPowerDevice ? 1.05 : 1.35)
  );

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.2, 12);

  const rig = new THREE.Group();
  scene.add(rig);

  const core = new THREE.Group();
  rig.add(core);

  const shellMaterial = new THREE.MeshBasicMaterial({
    color: 0x7d8a99,
    transparent: true,
    opacity: prefersReducedMotion ? 0.06 : lowPowerDevice ? 0.1 : 0.14
  });

  const orbitA = new THREE.Mesh(
    new THREE.TorusGeometry(3.9, 0.042, 18, lowPowerDevice ? 120 : 160),
    shellMaterial
  );
  orbitA.rotation.x = 1.08;
  orbitA.rotation.y = 0.34;
  core.add(orbitA);

  const orbitB = new THREE.Mesh(
    new THREE.TorusGeometry(3.15, 0.034, 18, lowPowerDevice ? 100 : 140),
    shellMaterial.clone()
  );
  orbitB.material.opacity = prefersReducedMotion ? 0.04 : lowPowerDevice ? 0.08 : 0.12;
  orbitB.rotation.x = 0.38;
  orbitB.rotation.y = 1.06;
  if (!lowPowerDevice) {
    core.add(orbitB);
  }

  const wireframe = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.4, lowPowerDevice ? 0 : 1),
    new THREE.MeshBasicMaterial({
      color: 0xb7a285,
      wireframe: true,
      transparent: true,
      opacity: prefersReducedMotion ? 0.04 : lowPowerDevice ? 0.08 : 0.14
    })
  );
  core.add(wireframe);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(4.6, 5.2, 96),
    new THREE.MeshBasicMaterial({
      color: 0xb7a285,
      transparent: true,
      opacity: prefersReducedMotion ? 0.02 : lowPowerDevice ? 0.04 : 0.06,
      side: THREE.DoubleSide
    })
  );
  halo.rotation.x = 1.26;
  halo.position.z = -0.4;
  rig.add(halo);

  const nodeCount = lowPowerDevice ? 52 : 84;
  const dustCount = lowPowerDevice ? 120 : 220;
  const nodes = [];
  const nodePositions = new Float32Array(nodeCount * 3);
  const nodeColors = new Float32Array(nodeCount * 3);

  for (let index = 0; index < nodeCount; index += 1) {
    const phi = Math.acos(1 - (2 * (index + 0.5)) / nodeCount);
    const theta = Math.PI * (1 + Math.sqrt(5)) * index;
    const radius = 2.7 + ((index % 7) * 0.055);
    const point = new THREE.Vector3(
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi)
    );
    nodes.push(point);

    const cursor = index * 3;
    nodePositions[cursor] = point.x;
    nodePositions[cursor + 1] = point.y;
    nodePositions[cursor + 2] = point.z;

    const palette = index % 2 === 0 ? 0xb7a285 : 0x7d8a99;
    const color = new THREE.Color(palette);
    nodeColors[cursor] = color.r;
    nodeColors[cursor + 1] = color.g;
    nodeColors[cursor + 2] = color.b;
  }

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
  nodeGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

  const nodeCloud = new THREE.Points(
    nodeGeometry,
    new THREE.PointsMaterial({
      size: lowPowerDevice ? 0.08 : 0.085,
      vertexColors: true,
      transparent: true,
      opacity: prefersReducedMotion ? 0.18 : lowPowerDevice ? 0.54 : 0.68,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  core.add(nodeCloud);

  const linkPositions = [];
  const linkColors = [];

  for (let source = 0; source < nodes.length; source += 1) {
    for (let target = source + 1; target < nodes.length; target += 1) {
      const distance = nodes[source].distanceTo(nodes[target]);
      if (
        distance > (lowPowerDevice ? 1.58 : 1.72) ||
        (source + target) % (lowPowerDevice ? 9 : 7) !== 0
      ) {
        continue;
      }

      linkPositions.push(
        nodes[source].x,
        nodes[source].y,
        nodes[source].z,
        nodes[target].x,
        nodes[target].y,
        nodes[target].z
      );

      const edgeColor = new THREE.Color((source + target) % 2 === 0 ? 0x7d8a99 : 0xb7a285);
      linkColors.push(
        edgeColor.r,
        edgeColor.g,
        edgeColor.b,
        edgeColor.r,
        edgeColor.g,
        edgeColor.b
      );
    }
  }

  const linkGeometry = new THREE.BufferGeometry();
  linkGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linkPositions, 3));
  linkGeometry.setAttribute("color", new THREE.Float32BufferAttribute(linkColors, 3));

  const links = new THREE.LineSegments(
    linkGeometry,
    new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: prefersReducedMotion ? 0.04 : lowPowerDevice ? 0.1 : 0.14
    })
  );
  core.add(links);

  const dustPositions = new Float32Array(dustCount * 3);
  for (let index = 0; index < dustCount; index += 1) {
    const cursor = index * 3;
    dustPositions[cursor] = (Math.random() - 0.5) * 28;
    dustPositions[cursor + 1] = (Math.random() - 0.5) * 18;
    dustPositions[cursor + 2] = (Math.random() - 0.5) * 14;
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      color: 0xebe7df,
      size: lowPowerDevice ? 0.03 : 0.036,
      transparent: true,
      opacity: prefersReducedMotion ? 0.08 : lowPowerDevice ? 0.12 : 0.16,
      depthWrite: false
    })
  );
  scene.add(dust);

  const pointer = { x: 0, y: 0 };
  let scrollProgress = 0;

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function handleScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  function animate() {
    const time = performance.now() * 0.00018;
    rig.rotation.y += prefersReducedMotion ? 0.00016 : lowPowerDevice ? 0.00042 : 0.00062;
    rig.rotation.x += prefersReducedMotion ? 0.00006 : lowPowerDevice ? 0.0001 : 0.00014;
    core.rotation.z = time * (lowPowerDevice ? 1.2 : 1.6);
    wireframe.rotation.x += prefersReducedMotion ? 0.0001 : lowPowerDevice ? 0.00018 : 0.00028;
    wireframe.rotation.y -= prefersReducedMotion ? 0.00008 : lowPowerDevice ? 0.00014 : 0.00022;
    halo.rotation.z -= prefersReducedMotion ? 0.00008 : lowPowerDevice ? 0.00022 : 0.00034;
    dust.rotation.y -= prefersReducedMotion ? 0.00005 : lowPowerDevice ? 0.00008 : 0.00014;

    const targetX = pointer.x * 0.8 + (scrollProgress - 0.5) * 0.8;
    const targetY = pointer.y * 0.46 - (scrollProgress - 0.5) * 0.36;
    rig.position.x += (targetX - rig.position.x) * (lowPowerDevice ? 0.085 : 0.065);
    rig.position.y += (targetY - rig.position.y) * (lowPowerDevice ? 0.085 : 0.065);

    camera.position.x += ((pointer.x * 0.45) - camera.position.x) * (lowPowerDevice ? 0.075 : 0.055);
    camera.position.y += ((pointer.y * 0.26) - camera.position.y) * (lowPowerDevice ? 0.075 : 0.055);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );
  window.addEventListener("scroll", handleScroll, { passive: true });

  resize();
  handleScroll();
  animate();
}
