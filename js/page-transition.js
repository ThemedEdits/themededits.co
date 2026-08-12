if (window.__pageTransitionInitialized) {
  // already running — do nothing
} else {
  window.__pageTransitionInitialized = true;
  window.__pageTransitionReady = false;

  (() => {
    'use strict';

    const overlay = document.getElementById('pageTransitionOverlay');
    if (!overlay) return;

    const svgEl = overlay.querySelector('.page-transition__logo');
    const anim = window.buildLogoDrawAnimation
      ? window.buildLogoDrawAnimation(svgEl)
      : { run: () => Promise.resolve(), reset: () => {} };

    const SETTLE_MS = 80;
    const PANEL_REVEAL_MS = 550;
    const ANIMATED_COVER_MS = 600;

    let isNavigating = false;

    function coverPanel(animated = false) {
      document.documentElement.classList.add('page-transitioning');
      overlay.classList.remove('is-revealing', 'is-revealed', 'is-covering', 'is-covering-animated');
      overlay.classList.add(animated ? 'is-covering-animated' : 'is-covering');
    }

    function revealPanel() {
      return new Promise(resolve => {
        overlay.classList.add('is-revealing');
        overlay.classList.remove('is-covering', 'is-covering-animated');
        setTimeout(() => {
          overlay.classList.remove('is-revealing');
          overlay.classList.add('is-revealed');
          document.documentElement.classList.remove('page-transitioning');
          window.__pageTransitionReady = true;
          window.dispatchEvent(new Event('page-transition:done'));
          resolve();
        }, PANEL_REVEAL_MS + 60);
      });
    }

    /* ---------------------------------------------------------
       Smooth counter — ONLY used during the inbound (arriving /
       loading) phase. Outbound navigation just shows the panel
       rising with no meter, since nothing is "loading" yet at
       that point — this is what stops the double-count feeling.
       --------------------------------------------------------- */
    const meterDigits = [...overlay.querySelectorAll('.page-transition__digit')];
    let meterCancelled = false;
    let meterRafId = null;

    function setMeterValue(num) {
      const clamped = Math.max(0, Math.min(100, Math.round(num)));
      const str = String(clamped).padStart(3, '0');
      meterDigits.forEach((el, i) => { el.textContent = str[i]; });
    }

    function getCurrentMeterValue() {
      return parseInt(meterDigits.map(el => el.textContent).join(''), 10) || 0;
    }

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function smoothCountTo(from, to, duration) {
      return new Promise(resolve => {
        if (meterRafId) cancelAnimationFrame(meterRafId);
        const start = performance.now();
        function tick(now) {
          if (meterCancelled) { resolve(); return; }
          const t = Math.min((now - start) / duration, 1);
          setMeterValue(from + (to - from) * easeOutCubic(t));
          if (t < 1) {
            meterRafId = requestAnimationFrame(tick);
          } else {
            meterRafId = null;
            resolve();
          }
        }
        meterRafId = requestAnimationFrame(tick);
      });
    }

    // asymptotically approaches `cap` — never fully stalls, never
    // overshoots, works regardless of how long anim.run() actually takes
    function smoothCountToward(cap, estimatedDuration) {
      if (meterRafId) cancelAnimationFrame(meterRafId);
      const start = performance.now();
      function tick(now) {
        if (meterCancelled) return;
        const elapsed = now - start;
        const t = 1 - Math.exp(-elapsed / estimatedDuration);
        setMeterValue(cap * t);
        meterRafId = requestAnimationFrame(tick);
      }
      meterRafId = requestAnimationFrame(tick);
      return { stop: () => { if (meterRafId) cancelAnimationFrame(meterRafId); } };
    }

    /* ---------------------------------------------------------
       ON LOAD / REFRESH — the only place both the logo-draw
       animation AND the meter play. Overlay is already covering
       instantly (static HTML), so there's no flash before this
       even starts.
       --------------------------------------------------------- */
    async function playInboundSequence() {
      meterCancelled = false;
      coverPanel(false);
      setMeterValue(0);

      const handle = smoothCountToward(92, 1100);

      await new Promise(r => setTimeout(r, SETTLE_MS));
      await anim.run();

      handle.stop();
      await smoothCountTo(getCurrentMeterValue(), 100, 220);

      await revealPanel();
    }

    window.addEventListener('pageshow', () => {
      isNavigating = false;
      playInboundSequence();
    });

    /* ---------------------------------------------------------
       ON NAVIGATION AWAY — panel animates up smoothly, NO meter
       shown here (nothing is loading yet — the meter's job is
       purely for the arriving page's inbound sequence).
       --------------------------------------------------------- */
    function isSameOriginInternalLink(a) {
      if (!a || !a.getAttribute) return false;
      const href = a.getAttribute('href');
      if (!href) return false;
      if (a.target && a.target !== '' && a.target !== '_self') return false;
      if (a.hasAttribute('download')) return false;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) return false;
      if (href.startsWith('#')) return false;

      const [pathPart, hashPart] = href.split('#');
      if (hashPart && (pathPart === '' || pathPart === window.location.pathname)) return false;

      return true;
    }

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!isSameOriginInternalLink(a)) return;

      e.preventDefault();
      if (isNavigating) return;
      isNavigating = true;

      const href = a.href;

      meterCancelled = true; // meter stays hidden/frozen during outbound
      coverPanel(true);

      setTimeout(() => {
        window.location.href = href;
      }, ANIMATED_COVER_MS);
    }, true);

    window.addEventListener('pagehide', () => {
      meterCancelled = true;
      if (meterRafId) cancelAnimationFrame(meterRafId);
      overlay.classList.remove('is-revealing', 'is-covering', 'is-covering-animated', 'is-revealed');
    });
  })();
}