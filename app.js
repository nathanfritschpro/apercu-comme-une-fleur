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
