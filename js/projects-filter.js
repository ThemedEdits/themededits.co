(() => {
  'use strict';

  const filterWrap = document.getElementById('portfolioFilter');
  const backToTop = document.getElementById('backToTop');

  // ---- filter pill ----
  if (filterWrap) {
    const buttons = [...filterWrap.querySelectorAll('.portfolio-filter__btn')];
    const initial = new URLSearchParams(window.location.search).get('type');
    const activeValue = (initial === 'web' || initial === 'graphics') ? initial : 'all';

    buttons.forEach(btn => {
      const isActive = btn.dataset.filter === activeValue;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.filter;

        buttons.forEach(b => {
          const isActive = b === btn;
          b.classList.toggle('is-active', isActive);
          b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        const url = new URL(window.location.href);
        if (value === 'all') {
          url.searchParams.delete('type');
        } else {
          url.searchParams.set('type', value);
        }
        history.replaceState(null, '', url);

        if (window.__setProjectsFilter) {
          window.__setProjectsFilter(value);
        }
      });
    });
  }

  // ---- back to top ----
  if (backToTop) {
    const toggleVisibility = () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    backToTop.addEventListener('click', () => {
      if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        window.lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
})();