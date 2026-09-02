// Comme une Fleur — Fleuriste Mérignac · M.Création

// Header opaque au scroll
const header = document.querySelector('.header');
const onScroll = () => {
  if (window.scrollY > 60) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Menu burger — lock scroll iOS-safe
const burger = document.querySelector('.burger');
const mobileNav = document.querySelector('.mobile-nav');
let savedScrollY = 0;
function openNav() {
  savedScrollY = window.scrollY;
  document.body.classList.add('nav-open');
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.top = `-${savedScrollY}px`;
  mobileNav.classList.add('open');
}
function closeNav() {
  mobileNav.classList.remove('open');
  document.body.classList.remove('nav-open');
  document.body.style.position = '';
  document.body.style.width = '';
  document.body.style.top = '';
  window.scrollTo(0, savedScrollY);
}
if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    mobileNav.classList.contains('open') ? closeNav() : openNav();
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
}

// Année dynamique
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Reveal on scroll (rejouable)
(function initReveal() {
  const selectors = [
    '.sec-head', '.atelier-media', '.atelier-content',
    '.g', '.occ-card', '.review-card', '.reviews-hero .score-block',
    '.contact-info', '.contact-map', '.footer-hero'
  ];
  const els = document.querySelectorAll(selectors.join(','));

  els.forEach(el => {
    if (el.classList.contains('atelier-media')) el.classList.add('reveal-left');
    else if (el.classList.contains('atelier-content')) el.classList.add('reveal-right');
    else el.classList.add('reveal');
  });

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in');
      else if (entry.boundingClientRect.top > window.innerHeight + 60 ||
               entry.boundingClientRect.bottom < -60) entry.target.classList.remove('in');
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

  els.forEach(el => io.observe(el));
})();

// Scroll progress bar
(function initProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const scroll = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? scroll / max : 0;
    bar.style.transform = `scaleX(${p})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

// Lightbox photos galerie
(function initLightbox() {
  const items = document.querySelectorAll('.g');
  if (!items.length) return;
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<button class="lb-close" aria-label="Fermer">&times;</button><button class="lb-prev" aria-label="Précédent">‹</button><button class="lb-next" aria-label="Suivant">›</button><div class="lb-img"></div>';
  document.body.appendChild(lb);
  const imgEl = lb.querySelector('.lb-img');
  const urls = Array.from(items).map(el => {
    const bg = el.style.backgroundImage;
    const m = bg.match(/url\(["']?([^"')]+)["']?\)/);
    return m ? m[1] : '';
  });
  let idx = 0;
  const show = i => {
    idx = (i + urls.length) % urls.length;
    imgEl.style.backgroundImage = `url("${urls[idx]}")`;
  };
  const open = i => { show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  items.forEach((el, i) => { el.addEventListener('click', () => open(i)); el.style.cursor = 'zoom-in'; });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();

// ============ SCROLL-DRIVEN FRAMES (bouquet + pétales) ============
(function initFlowersScroll() {
  const canvas = document.getElementById('flowersCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const section = document.querySelector('.flowers-scroll');
  const TOTAL = 121;
  const frameSrc = i => `img/frames/frame_${String(i).padStart(3, '0')}.jpg`;

  // Précharge progressive : commence par les frames critiques (0, 30, 60, 90) puis remplit
  const images = new Array(TOTAL);
  let currentDrawnIndex = -1;

  const loadImage = (i) => {
    if (images[i]) return images[i];
    const img = new Image();
    img.src = frameSrc(i);
    images[i] = img;
    return img;
  };

  // Préchargement échelonné : d'abord des étapes-clés, puis tout
  const preloadOrder = [];
  const step = Math.floor(TOTAL / 8);
  for (let i = 0; i < TOTAL; i += step) preloadOrder.push(i);
  for (let i = 0; i < TOTAL; i++) if (!preloadOrder.includes(i)) preloadOrder.push(i);
  preloadOrder.forEach((i, k) => setTimeout(() => loadImage(i), k * 30));

  // Redimensionne canvas au device pixel ratio
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(currentDrawnIndex >= 0 ? currentDrawnIndex : 0, true);
  }
  window.addEventListener('resize', resizeCanvas);

  // Dessine une frame en cover
  function drawFrame(index, force) {
    if (!force && index === currentDrawnIndex) return;
    const img = images[index] || loadImage(index);
    if (!img.complete || !img.naturalWidth) {
      img.onload = () => { if (getTargetFrame() === index) drawFrame(index, true); };
      // Fallback : dessine la frame précédente disponible
      let fallback = index;
      while (fallback > 0 && (!images[fallback] || !images[fallback].complete)) fallback--;
      if (images[fallback] && images[fallback].complete) drawFrame(fallback, true);
      return;
    }
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const w = iw * scale;
    const h = ih * scale;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);
    currentDrawnIndex = index;
  }

  function getTargetFrame() {
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(1, Math.max(0, scrolled / total));
    return Math.min(TOTAL - 1, Math.floor(progress * (TOTAL - 1)));
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      drawFrame(getTargetFrame());
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  resizeCanvas();
  // Charge la première frame en priorité
  const first = loadImage(0);
  if (first.complete) drawFrame(0, true);
  else first.onload = () => drawFrame(0, true);
})();

// Smooth scroll pour les ancres
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const y = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});
