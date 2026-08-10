(() => {
  'use strict';

  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target); // reveal once, never re-hide
      }
    });
  }, {
    threshold: 0.20,
    rootMargin: '0px 0px -18% 0px'
  });

  els.forEach((el, i) => {
    if (!el.style.getPropertyValue('--reveal-delay')) {
      el.style.setProperty('--reveal-delay', `${(i % 6) * 0.08}s`);
    }
    observer.observe(el);
  });
})();