const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: true,
});


function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);





(() => {
  'use strict';

  /* ---------------------------------------------------------
     1. Split every [data-split-hover] element into characters
        so CSS can bounce each letter up-and-out while a
        duplicate rises in from below, on hover / focus.
     --------------------------------------------------------- */
  function wrapChar(char, globalIndex) {
    const wrap = document.createElement('span');
    wrap.className = 'ch';
    wrap.style.setProperty('--i', globalIndex);

    const top = document.createElement('span');
    top.className = 'ch__top';
    top.textContent = char === ' ' ? '\u00A0' : char;

    const bottom = document.createElement('span');
    bottom.className = 'ch__bottom';
    bottom.setAttribute('aria-hidden', 'true');
    bottom.textContent = char === ' ' ? '\u00A0' : char;

    wrap.append(top, bottom);
    return wrap;
  }

  function splitTextNode(node, counterRef) {
    const words = node.textContent.split(/(\s+)/); // keep separators
    const frag = document.createDocumentFragment();

    words.forEach(word => {
      if (word === '') return;
      if (/^\s+$/.test(word)) {
        // whitespace run: render as a plain (non-bouncing) space
        frag.append(document.createTextNode(word));
        return;
      }
      const wordWrap = document.createElement('span');
      wordWrap.className = 'split-word';
      [...word].forEach(char => {
        wordWrap.append(wrapChar(char, counterRef.i++));
      });
      frag.append(wordWrap);
    });

    node.replaceWith(frag);
  }

  function splitElement(el) {
    const counterRef = { i: 0 };
    // collect text nodes first (live NodeList issues otherwise)
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        return n.textContent.trim().length
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });
    const textNodes = [];
    let n;
    while ((n = walker.nextNode())) textNodes.push(n);
    textNodes.forEach(tn => splitTextNode(tn, counterRef));
  }

  document.querySelectorAll('[data-split-hover]').forEach(splitElement);
  window.__splitHoverInit = splitElement; // let other scripts (hero-slider) split dynamically-injected elements

  /* ---------------------------------------------------------
     2. Menu open / close + body scroll lock that keeps the
        page exactly where it was.
     --------------------------------------------------------- */
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('siteNav');
  const html = document.documentElement;
  let scrollY = 0;
  let isOpen = false;

  function lockScroll() {
    scrollY = window.scrollY || window.pageYOffset;
    html.classList.add('nav-locked');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    lenis.stop();
  }

  function unlockScroll() {
    html.classList.remove('nav-locked');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
    lenis.start();
  }

  function openNav() {
    isOpen = true;
    window.dispatchEvent(new Event('nav:willOpen'));
    lockScroll();
    menuBtn.classList.add('is-active');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    nav.classList.add('is-open');
    nav.setAttribute('aria-hidden', 'false');
  }

  function closeNav() {
    isOpen = false;
    menuBtn.classList.remove('is-active');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('is-open');
    nav.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      unlockScroll();
      window.dispatchEvent(new Event('nav:willClose'));
    }, 600);
  }

  menuBtn.addEventListener('click', () => (isOpen ? closeNav() : openNav()));

  nav.querySelectorAll('.site-nav__link').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeNav();
  });
})();



(() => {
  'use strict';

  const STEPS = [
    { label: 'Step 01', cat: 'Discovery Call', title: 'Understanding Your Brand', mid: "We start with a conversation about your goals, audience, and what success looks like for your brand." },
    { label: 'Step 02', cat: 'Design Direction', title: 'Moodboards & Wireframes', mid: "Visual direction and structure get mapped out before a single pixel is finalized." },
    { label: 'Step 03', cat: 'Build & Refine', title: 'Development & Revisions', mid: "The site or identity gets built, tested, and refined with you until it's exactly right." }
  ];

  const panels = document.querySelectorAll('.hiw__panel');
  const prevBtn = document.getElementById('hiwPrev');
  const nextBtn = document.getElementById('hiwNext');
  const nextBtnBig = document.getElementById('hiwNextBtn');
  const midText = document.getElementById('hiwMidText');
  const nextLabel = document.getElementById('hiwNextLabel');
  const nextTitle = document.getElementById('hiwNextTitle');
  const stepLabel = document.querySelector('.hiw__pagination .hiw__step-label');

  if (!panels.length) return;

  let current = 0;

  function render() {
    panels.forEach((p, i) => {
      p.classList.toggle('is-active', i === current);
    });

    const nextIndex = (current + 1) % STEPS.length;

    midText.textContent = STEPS[current].mid;
    nextLabel.textContent = STEPS[nextIndex].label;
    nextTitle.textContent = STEPS[nextIndex].title;

    stepLabel.textContent = STEPS[current].label; // ✅ THIS FIX

    prevBtn.disabled = current === 0;
  }

  function goTo(i) {
    current = Math.max(0, Math.min(STEPS.length - 1, i));
    render();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo((current + 1) % STEPS.length));
  nextBtnBig.addEventListener('click', () => goTo((current + 1) % STEPS.length));

  render();
})();





document.querySelectorAll('.finale__rating').forEach(ratingEl => {
  const rating = parseFloat(ratingEl.dataset.rating) || 0;
  const starsContainer = ratingEl.querySelector('.finale__stars');

  const starSVG = `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21 16.54 13.97 
               22 9.24l-7.19-.61L12 2 9.19 8.63 
               2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  `;

  starsContainer.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    const star = document.createElement('div');
    star.className = 'finale__star';

    const base = document.createElement('div');
    base.className = 'finale__star--base';
    base.innerHTML = starSVG;

    const fill = document.createElement('div');
    fill.className = 'finale__star--fill';
    fill.innerHTML = starSVG;

    // ⭐ FIX: cleaner fill calculation
    let fillAmount = Math.max(0, Math.min(1, rating - i));
    fill.style.width = (fillAmount * 100) + '%';

    star.appendChild(base);
    star.appendChild(fill);
    starsContainer.appendChild(star);
  }
});




// =========== GRID CELLS BACKGROUND FOR PROJECTS HERO ===========
(() => {
  const grid = document.getElementById('heroGrid');
  if (!grid) return;

  const cellSize = 60;
  const cols = Math.ceil(grid.parentElement.offsetWidth / cellSize);
  const rows = Math.ceil(grid.parentElement.offsetHeight / cellSize);

  grid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  grid.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

  const total = cols * rows;
  for (let i = 0; i < total; i++) {
    const cell = document.createElement('div');
    cell.className = 'hero-grid__cell';
    if (Math.random() < 0.35) {
      cell.classList.add('is-filled');
      cell.style.setProperty('--fill-opacity', (Math.random() * 0.01 + 0.04).toFixed(2));
    }
    grid.appendChild(cell);
  }
})();