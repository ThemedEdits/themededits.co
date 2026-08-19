(() => {
  'use strict';

  const filterWrap = document.getElementById('portfolioFilter');
  const pill = document.getElementById('portfolioPill');
  const backToTop = document.getElementById('backToTop');

  // ---- filter pill ----
  if (filterWrap) {
    const buttons = [...filterWrap.querySelectorAll('.portfolio-filter__btn')];
    const initial = new URLSearchParams(window.location.search).get('type');
    const activeValue = (initial === 'web' || initial === 'graphics') ? initial : 'all';

    function movePillTo(btn) {
      if (!pill || !btn) return;
      const wrapRect = filterWrap.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();

      pill.style.width = `${btnRect.width}px`;
      pill.style.height = `${btnRect.height}px`;
      pill.style.transform = `translate(${btnRect.left - wrapRect.left}px, ${btnRect.top - wrapRect.top}px)`;
    }

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

        movePillTo(btn);

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

    window.addEventListener('resize', () => {
      const active = filterWrap.querySelector('.portfolio-filter__btn.is-active');
      movePillTo(active);
    });

    // position the pill correctly on load, once layout has settled
    requestAnimationFrame(() => {
      const active = filterWrap.querySelector('.portfolio-filter__btn.is-active');
      movePillTo(active);
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
        window.lenis.scrollTo(0, {
          duration: 2.8,
          easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
        });
      } else {
        smoothScrollToTop(2800);
      }
    });
  }

  // fallback smooth-scroll with proper ease-in-out, for when Lenis isn't present
  function smoothScrollToTop(durationMs) {
    const startY = window.scrollY;
    const startTime = performance.now();

    function easeInOutQuint(t) {
      return t < 0.5
        ? 16 * t * t * t * t * t
        : 1 - Math.pow(-2 * t + 2, 5) / 2;
    }

    function step(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = easeInOutCubic(t);

      window.scrollTo(0, startY * (1 - eased));

      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }
})();