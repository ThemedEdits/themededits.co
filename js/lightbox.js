(() => {
  'use strict';

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `
    <div class="lightbox__backdrop"></div>
    <button class="lightbox__close" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </button>
    <div class="lightbox__stage">
      <img class="lightbox__img" src="" alt="">
    </div>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector('.lightbox__img');
  const closeBtn = overlay.querySelector('.lightbox__close');
  const backdrop = overlay.querySelector('.lightbox__backdrop');

  let lastFocused = null;

  let scrollY = 0;

  function open(src, title) {
    lastFocused = document.activeElement;
    img.src = src;
    img.alt = title || '';
    overlay.classList.add('is-open');

    scrollY = window.scrollY || window.pageYOffset;
    document.documentElement.classList.add('lightbox-locked');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';

    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('is-open');
    document.documentElement.classList.remove('lightbox-locked');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, scrollY);
    setTimeout(() => { img.src = ''; }, 300);
    if (lastFocused) lastFocused.focus();
  }

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });

  window.__openLightbox = open;
})();