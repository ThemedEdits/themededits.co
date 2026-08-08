(() => {
  'use strict';

  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  overlay.innerHTML = `
    <div class="page-transition__panel"></div>
    <div class="page-transition__mark">
      <img src="${document.body.dataset.assetsRoot || ''}assets/logo.png" alt="">
    </div>
  `;
  document.documentElement.appendChild(overlay);

  const PANEL_MS = 550;
  const REVEAL_DELAY_MS = 100; // matches the .1s delay on .is-revealing panel transition
  const HOLD_MS = 220;

  function playIn() {
    document.documentElement.classList.add('page-transitioning');
    requestAnimationFrame(() => {
      overlay.classList.add('is-covering');
    });
  }

  function playOut() {
    requestAnimationFrame(() => {
      overlay.classList.add('is-revealing');
      // wait for the FULL reveal transition (delay + duration) to finish
      // before stripping classes — previously this fired 50ms too early,
      // cutting the panel off mid-animation instead of letting it finish.
      setTimeout(() => {
        overlay.classList.remove('is-covering', 'is-revealing');
        document.documentElement.classList.remove('page-transitioning');
      }, PANEL_MS + REVEAL_DELAY_MS + 50);
    });
  }

  window.addEventListener('pageshow', () => {
    document.documentElement.classList.add('page-transitioning');
    overlay.classList.add('is-covering');
    setTimeout(playOut, HOLD_MS);
  });

  function isSameOriginInternalLink(a) {
    if (!a || !a.getAttribute) return false;
    const href = a.getAttribute('href');
    if (!href) return false;
    if (a.target && a.target !== '' && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) return false; // external
    if (href.startsWith('#')) return false; // pure in-page anchor

    // strip a same-page hash target (e.g. href="/index.html#about" from a
    // different page is fine; href="#about" on the SAME page is not)
    const [pathPart, hashPart] = href.split('#');
    if (hashPart && (pathPart === '' || pathPart === window.location.pathname)) return false;

    return true;
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!isSameOriginInternalLink(a)) return;

    e.preventDefault();
    const href = a.href;
    playIn();
    setTimeout(() => { window.location.href = href; }, PANEL_MS);
  });

  window.addEventListener('pagehide', () => {
    overlay.classList.remove('is-revealing');
  });
})();