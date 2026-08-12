(() => {
  'use strict';

  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  let pending = [];

  function commitReveal(el){
    el.classList.add('is-revealed');
  }

  function flushPending(){
    pending.forEach(commitReveal);
    pending = [];
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      if (window.__pageTransitionReady) {
        commitReveal(entry.target);
      } else {
        pending.push(entry.target);
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

  window.addEventListener('page-transition:done', flushPending);

  // safety: if page-transition.js isn't present/failed for some reason,
  // don't leave reveals stuck forever
  setTimeout(() => {
    if (!window.__pageTransitionReady) {
      window.__pageTransitionReady = true;
      flushPending();
    }
  }, 4000);
})();