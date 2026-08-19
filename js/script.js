const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: true,
});
window.lenis = lenis; // exposed so other scripts (back-to-top) can call lenis.scrollTo()


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
    { label: 'Step 01', cat: 'Discovery', title: 'Understanding Your Goals', mid: "We start with a conversation about your goals, audience, ideas, and what you want the final result to achieve." },
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







(() => {
  'use strict';

  const list = document.getElementById('servicesList');
  const preview = document.getElementById('servicesPreview');
  if (!list || !preview) return;

  // Move the preview to <body> directly so it's never trapped inside a
  // transformed ancestor (data-reveal elements use transform, which
  // breaks position:fixed's viewport-relative behavior for descendants)
  document.body.appendChild(preview);

  const rows = list.querySelectorAll('.services__row');
  const images = preview.querySelectorAll('.services__preview-img');
  const isDesktop = () => window.innerWidth > 900;

  // ---- Accordion logic ----
  function toggleRow(row) {
    const isOpen = row.classList.contains('is-open');

    // Close all other rows
    rows.forEach(r => {
      if (r !== row) {
        r.classList.remove('is-open');
        const header = r.querySelector('.services__row-header');
        if (header) header.setAttribute('aria-expanded', 'false');
      }
    });

    if (isOpen) {
      row.classList.remove('is-open');
      const header = row.querySelector('.services__row-header');
      if (header) header.setAttribute('aria-expanded', 'false');
    } else {
      row.classList.add('is-open');
      const header = row.querySelector('.services__row-header');
      if (header) header.setAttribute('aria-expanded', 'true');
    }
  }

  function closeAllAccordions() {
    rows.forEach(row => {
      row.classList.remove('is-open');
      const header = row.querySelector('.services__row-header');
      if (header) header.setAttribute('aria-expanded', 'false');
    });
  }

  // ---- Preview image logic ----
  function showPreviewFor(row) {
    if (!isDesktop()) return;

    const idx = row.dataset.service;
    const img = preview.querySelector(`[data-idx="${idx}"]`);
    if (!img) return;

    images.forEach(i => i.classList.remove('is-visible'));
    img.classList.add('is-visible');
    preview.classList.add('is-active');
  }

  function hidePreview() {
    preview.classList.remove('is-active');
  }

  // ---- Event listeners ----
  rows.forEach(row => {
    const header = row.querySelector('.services__row-header');
    const toggleBtn = row.querySelector('.services__row-toggle');

    // Click on header toggles accordion
    const handleToggle = (e) => {
      // Don't toggle if clicking on the title link (navigation)
      if (e.target.closest('.services__row-title')) return;
      e.preventDefault();
      toggleRow(row);
    };

    header.addEventListener('click', handleToggle);

    // Toggle button click - now properly toggles
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleRow(row);
    });

    // Keyboard support for header
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleRow(row);
      }
    });

    // Desktop: hover expands accordion AND shows preview
    if (isDesktop()) {
      row.addEventListener('mouseenter', () => {
        // Expand accordion on hover
        if (!row.classList.contains('is-open')) {
          rows.forEach(r => {
            r.classList.remove('is-open');
            const h = r.querySelector('.services__row-header');
            if (h) h.setAttribute('aria-expanded', 'false');
          });
          row.classList.add('is-open');
          const h = row.querySelector('.services__row-header');
          if (h) h.setAttribute('aria-expanded', 'true');
        }
        // Show preview
        showPreviewFor(row);
      });
    }
  });

  // Close accordion on click outside (works for both desktop and mobile)
  document.addEventListener('click', (e) => {
    const isClickInside = list.contains(e.target);
    if (!isClickInside) {
      closeAllAccordions();
      if (isDesktop()) {
        hidePreview();
      }
    }
  });

  // Hide preview and close accordion on mouse leave (desktop only)
  list.addEventListener('mouseleave', () => {
    if (isDesktop()) {
      hidePreview();
      closeAllAccordions();
    }
  });

  // Handle focus out for accessibility
  list.addEventListener('focusout', (e) => {
    if (!list.contains(e.relatedTarget)) {
      hidePreview();
      closeAllAccordions();
    }
  });

  // Close all accordions on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllAccordions();
      hidePreview();
    }
  });

  // Re-check desktop on resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const desktop = isDesktop();
      if (!desktop) {
        hidePreview();
      }
    }, 200);
  });

})();









(() => {
  'use strict';

  const targets = [
    { el: document.getElementById('logoLine1'), word: 'Themed' },
    { el: document.getElementById('logoLine2'), word: 'Edits' }
  ].filter(t => t.el);

  if (!targets.length) return;

  const HOLD_MS = 4000;
  const STAGGER_MS = 80;

  function splitToChars(el, word) {
    el.innerHTML = '';
    return [...word].map(ch => {
      const span = document.createElement('span');
      span.className = 'logo-pulse__char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      el.appendChild(span);
      return span;
    });
  }

  function getOrder(len, mode) {
    const indices = Array.from({ length: len }, (_, idx) => idx);
    if (mode === 'ltr') return indices;
    if (mode === 'rtl') return indices.reverse();
    for (let a = indices.length - 1; a > 0; a--) {
      const b = Math.floor(Math.random() * (a + 1));
      [indices[a], indices[b]] = [indices[b], indices[a]];
    }
    return indices;
  }

  function pickMode(prevMode) {
    const modes = ['ltr', 'rtl', 'random'];
    const options = modes.filter(m => m !== prevMode);
    return options[Math.floor(Math.random() * options.length)];
  }

  const state = targets.map(t => ({
    el: t.el,
    word: t.word,
    lastOutMode: null,
    lastInMode: null
  }));

  function pulseOne(entry) {
    const chars = [...entry.el.querySelectorAll('.logo-pulse__char')];
    const outMode = pickMode(entry.lastOutMode);
    entry.lastOutMode = outMode;
    const outOrder = getOrder(chars.length, outMode);

    outOrder.forEach((charIndex, orderPos) => {
      setTimeout(() => {
        chars[charIndex].classList.add('is-out');
      }, orderPos * STAGGER_MS);
    });

    const outTotalMs = outOrder.length * STAGGER_MS + 500;

    setTimeout(() => {
      const newChars = splitToChars(entry.el, entry.word);
      newChars.forEach(c => c.classList.add('is-in-start'));

      const inMode = pickMode(entry.lastInMode);
      entry.lastInMode = inMode;
      const inOrder = getOrder(newChars.length, inMode);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          inOrder.forEach((charIndex, orderPos) => {
            setTimeout(() => {
              newChars[charIndex].classList.remove('is-in-start');
              newChars[charIndex].classList.add('is-in');
            }, orderPos * STAGGER_MS);
          });
        });
      });
    }, outTotalMs);
  }

  function pulseAll() {
    state.forEach(entry => pulseOne(entry));
  }

  // initial render
  state.forEach(entry => splitToChars(entry.el, entry.word));

  setInterval(pulseAll, HOLD_MS);
})();