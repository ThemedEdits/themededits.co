(() => {
  'use strict';

  const CIRCUMFERENCE = 2 * Math.PI * 52;
  const cards = document.querySelectorAll('.skills__ring-card');
  if (!cards.length) return;

  function animateCard(card){
    if (card.dataset.animated === 'true') return;
    card.dataset.animated = 'true';

    const percent = parseFloat(card.dataset.percent) || 0;
    const fillCircle = card.querySelector('.skills__ring-fill');
    const valueEl = card.querySelector('.skills__ring-value');
    const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

    requestAnimationFrame(() => {
      fillCircle.style.strokeDashoffset = offset;
    });

    const duration = 1400;
    const start = performance.now();

    function tick(now){
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      valueEl.firstChild.textContent = Math.round(eased * percent);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  cards.forEach(card => {
    const revealEl = card.hasAttribute('data-reveal') ? card : card.closest('[data-reveal]');

    if (!revealEl){
      // no reveal wrapper at all — just use plain intersection
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          animateCard(card);
          io.unobserve(card);
        });
      }, { threshold: 0.4 });
      io.observe(card);
      return;
    }

    if (revealEl.classList.contains('is-revealed')){
      animateCard(card);
      return;
    }

    // wait for reveal.js to actually add is-revealed (i.e. the delayed
    // 1.6s CSS transition has started/finished per class toggle), then
    // additionally wait for the CSS transition to visually complete
    const mo = new MutationObserver(() => {
      if (!revealEl.classList.contains('is-revealed')) return;
      mo.disconnect();

      // reveal.js's transition is 1.6s opacity/transform + delay via
      // --reveal-delay; wait that out before starting the ring so the
      // ring never animates while the card is still fading/sliding in
      const delay = parseFloat(getComputedStyle(revealEl).getPropertyValue('--reveal-delay')) || 0;
      const delayMs = getComputedStyle(revealEl).transitionDelay.includes('s')
        ? parseFloat(getComputedStyle(revealEl).transitionDelay) * 1000
        : delay * 1000;

      setTimeout(() => animateCard(card), delayMs + 1150);
    });

    mo.observe(revealEl, { attributes: true, attributeFilter: ['class'] });
  });
})();







(() => {
  'use strict';

  const counters = document.querySelectorAll('.about-intro__meta-count');
  if (!counters.length) return;

  function animateCounter(el) {
    if (el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';

    const target = parseFloat(el.dataset.count) || 0;
    const decimals = parseInt(el.dataset.decimals, 10) || 0;
    const duration = 4400;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (eased * target).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  }

  counters.forEach(el => {
    const revealEl = el.closest('[data-reveal]');

    if (!revealEl) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          animateCounter(el);
          io.unobserve(el);
        });
      }, { threshold: 0.4 });
      io.observe(el);
      return;
    }

    if (revealEl.classList.contains('is-revealed')) {
      animateCounter(el);
      return;
    }

    const mo = new MutationObserver(() => {
      if (!revealEl.classList.contains('is-revealed')) return;
      mo.disconnect();

      const computed = getComputedStyle(revealEl);
      const delayMs = computed.transitionDelay.includes('s')
        ? parseFloat(computed.transitionDelay) * 1000
        : 0;

      setTimeout(() => animateCounter(el), delayMs + 1150);
    });

    mo.observe(revealEl, { attributes: true, attributeFilter: ['class'] });
  });
})();