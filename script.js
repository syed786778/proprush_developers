/* ============================================================
   PROPRUSH DEVELOPERS — script.js
   Key fix: testimonials use proper per-view card width
            so text always wraps and is never cut off
============================================================ */
'use strict';

// ============================================================
// NAVBAR SCROLL
// ============================================================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);

  // Active link tracking
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 130) current = s.id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}, { passive: true });

// ============================================================
// HAMBURGER
// ============================================================
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
  document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ============================================================
// SCROLL REVEAL
// ============================================================
const revealEls = document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
revealEls.forEach(el => revealObs.observe(el));

// ============================================================
// COUNTER — easeOutCubic, no jitter
// ============================================================
let countersRun = false;

function runCounters() {
  if (countersRun) return;
  countersRun = true;
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const totalTime = 1600;
    const fps = 60;
    const steps = Math.round(totalTime / (1000 / fps));
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const p = step / steps;
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target);
      if (step >= steps) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, 1000 / fps);
  });
}

const statsEl = document.querySelector('.hero-stats');
if (statsEl) {
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { runCounters(); }
  }, { threshold: 0.4 }).observe(statsEl);
}

// ============================================================
// PROJECT TABS
// ============================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => {
      c.classList.toggle('active', c.id === `tab-${tab}`);
    });
    document.querySelectorAll(`#tab-${tab} .reveal-up`).forEach(el => {
      el.classList.remove('visible');
      setTimeout(() => revealObs.observe(el), 50);
    });
  });
});

// ============================================================
// TESTIMONIALS SLIDER
// Key fixes:
//  1. Card width = (sliderWidth - gaps) / perView  → measured from DOM
//  2. overflow:hidden on .testimonials-slider (CSS)
//  3. translate by exact (cardWidth + gap) per step
// ============================================================
const sliderEl   = document.querySelector('.testimonials-slider');
const trackEl    = document.getElementById('testimonialTrack') || document.getElementById('testiTrack');
const dotsWrap   = document.getElementById('sliderDots')       || document.getElementById('testiDots');
const prevBtnEl  = document.getElementById('prevBtn')          || document.getElementById('testiPrev');
const nextBtnEl  = document.getElementById('nextBtn')          || document.getElementById('testiNext');

let cur = 0;
let perView = 3;
let dots = [];
let total = 0;
let autoT;
const GAP = 20; // must match CSS gap on .testimonials-track

function getPerView() {
  if (window.innerWidth <= 768)  return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function buildSlider() {
  if (!trackEl || !sliderEl) return;

  const cards = trackEl.querySelectorAll('.testimonial-card');
  if (!cards.length) return;

  perView = getPerView();
  total   = Math.max(0, cards.length - perView);

  // Measure the slider container's inner width
  const sliderWidth = sliderEl.offsetWidth;

  // Card width = (sliderWidth - gaps between visible cards) / perView
  const totalGap = GAP * (perView - 1);
  const cardW    = Math.floor((sliderWidth - totalGap) / perView);

  // Apply width to every card
  cards.forEach(c => {
    c.style.width    = `${cardW}px`;
    c.style.minWidth = `${cardW}px`;
    c.style.maxWidth = `${cardW}px`;
  });

  // Rebuild dots
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    dots = [];
    for (let i = 0; i <= total; i++) {
      const d = document.createElement('div');
      d.className = `slider-dot${i === 0 ? ' active' : ''}`;
      d.addEventListener('click', () => { slideTo(i); resetAuto(); });
      dotsWrap.appendChild(d);
      dots.push(d);
    }
  }

  slideTo(Math.min(cur, total));
}

function slideTo(i) {
  if (!trackEl) return;
  cur = Math.max(0, Math.min(i, total));

  const cards  = trackEl.querySelectorAll('.testimonial-card');
  if (!cards.length) return;
  const cardW  = cards[0].offsetWidth;

  trackEl.style.transform = `translateX(-${cur * (cardW + GAP)}px)`;

  // Update dots
  dots.forEach((d, idx) => d.classList.toggle('active', idx === cur));

  // Dim arrow buttons at edges
  if (prevBtnEl) prevBtnEl.style.opacity = cur === 0     ? '0.35' : '1';
  if (nextBtnEl) nextBtnEl.style.opacity = cur >= total  ? '0.35' : '1';
}

if (prevBtnEl) prevBtnEl.addEventListener('click', () => { slideTo(cur - 1); resetAuto(); });
if (nextBtnEl) nextBtnEl.addEventListener('click', () => { slideTo(cur + 1); resetAuto(); });

function startAuto() {
  autoT = setInterval(() => slideTo(cur >= total ? 0 : cur + 1), 4500);
}
function resetAuto() { clearInterval(autoT); startAuto(); }

// Touch swipe
let touchX = 0;
if (trackEl) {
  trackEl.addEventListener('touchstart', e => { touchX = e.changedTouches[0].screenX; }, { passive: true });
  trackEl.addEventListener('touchend',   e => {
    const diff = touchX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 48) { slideTo(diff > 0 ? cur + 1 : cur - 1); resetAuto(); }
  }, { passive: true });
}

// Keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  { slideTo(cur - 1); resetAuto(); }
  if (e.key === 'ArrowRight') { slideTo(cur + 1); resetAuto(); }
});

// Rebuild on resize (debounced)
let resizeT;
window.addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(buildSlider, 220);
}, { passive: true });

// Init after fonts load to get accurate measurements
if (document.fonts) {
  document.fonts.ready.then(buildSlider);
} else {
  window.addEventListener('load', buildSlider);
}
startAuto();

// ============================================================
// CONTACT FORM
// ============================================================
const formEl      = document.getElementById('contactForm');
const successEl   = document.getElementById('formSuccess');
const submitText  = document.getElementById('submitText');
const submitLoad  = document.getElementById('submitLoader');

if (formEl) {
  formEl.addEventListener('submit', async e => {
    e.preventDefault();
    const name  = document.getElementById('name')?.value.trim()  || '';
    const phone = document.getElementById('phone')?.value.trim() || '';

    if (!name)             { flash('name',  'Please enter your name'); return; }
    if (phone.length < 10) { flash('phone', 'Please enter a valid number'); return; }

    // Show loader
    if (submitText) submitText.style.display = 'none';
    if (submitLoad) submitLoad.style.display = 'inline-flex';

    await new Promise(r => setTimeout(r, 1800));

    formEl.style.display   = 'none';
    if (successEl) successEl.style.display = 'block';
  });
}

function flash(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = 'var(--error)';
  el.focus();
  el.addEventListener('input', function clear() {
    el.style.borderColor = '';
    el.removeEventListener('input', clear);
  });
}

// ============================================================
// BACK TO TOP
// ============================================================
const backTopBtn = document.getElementById('backToTop');
if (backTopBtn) {
  window.addEventListener('scroll', () =>
    backTopBtn.classList.toggle('visible', window.scrollY > 400),
    { passive: true }
  );
  backTopBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
}

// ============================================================
// SMOOTH ANCHOR SCROLL
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.offsetTop - navbar.offsetHeight - 16,
        behavior: 'smooth'
      });
    }
  });
});

// ============================================================
// GALLERY TILES — click to enlarge
// ============================================================
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const caption = item.querySelector('.gallery-overlay span')?.textContent || 'Gallery Image';
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.9);
      display:flex;align-items:center;justify-content:center;cursor:pointer;
    `;
    overlay.innerHTML = `
      <div style="text-align:center;padding:24px;max-width:80vw">
        <div style="
          padding:48px 32px;border-radius:12px;
          background:var(--dk3);border:1px solid rgba(201,168,76,.2);
          font-family:'Jost',sans-serif;color:rgba(205,228,234,.5);
        ">
          <i class="fas fa-image" style="font-size:3rem;color:rgba(201,168,76,.3);display:block;margin-bottom:14px;"></i>
          <p style="font-size:.95rem;margin-bottom:8px;color:rgba(205,228,234,.7);">${caption}</p>
          <p style="font-size:.75rem;opacity:.5;">Replace with your actual project photo</p>
        </div>
        <p style="margin-top:14px;font-size:.82rem;font-family:'Jost',sans-serif;color:rgba(255,255,255,.4);">Click anywhere to close</p>
      </div>
    `;
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  });
});

// ============================================================
// PAGE LOAD — trigger hero reveals
// ============================================================
window.addEventListener('load', () => {
  document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 200 + i * 140);
  });
});

console.log(
  '%cProprush Developers 🏡 — Building Dreams with Trust',
  'color:#c9a84c;font-size:13px;font-weight:bold;font-family:serif;'
);
