const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,
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
    document.body.style.setProperty('--scroll-lock-y', `-${scrollY}px`);
    lenis.stop();
  }

  function unlockScroll() {
    html.classList.remove('nav-locked');
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



