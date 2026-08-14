(() => {
  'use strict';

  const SLIDE_DURATION = 5000;
  const slides = PORTFOLIO_ITEMS.slice(0, 3);

  const bgTrack = document.querySelector('.featured-projects__bg');
  const textTrack = document.getElementById('fpTextTrack');
  const dotsWrap = document.getElementById('fpDots');

  if (!bgTrack || !textTrack || !dotsWrap || !slides.length) return;

  let current = 0;
  let timer = null;

  slides.forEach((item, i) => {
    const bg = document.createElement('div');
    bg.className = 'featured-projects__slide';
    bg.style.backgroundImage = `url(${item.heroImage})`;
    if (i === 0) bg.classList.add('is-active');
    bgTrack.appendChild(bg);

    const text = document.createElement('div');
    text.className = 'featured-projects__slide-text';
    if (i === 0) text.classList.add('is-active');
    text.innerHTML = `
      <p class="featured-projects__eyebrow">${item.title}</p>
      <p class="featured-projects__sub-label">${item.subtitle}</p>
      <a href="/projects/${item.id}" class="btn btn--ghost featured-projects__cta" data-split-hover>
        View project
        <span aria-hidden="true" class="btn__icon">
          <svg width="18" height="18" viewBox="0 -2 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M13 6L19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </a>
    `;
    textTrack.appendChild(text);

    const dot = document.createElement('button');
    dot.className = 'featured-projects__dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Show ${item.title}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });

  if (window.__splitHoverInit) {
    textTrack.querySelectorAll('[data-split-hover]').forEach(window.__splitHoverInit);
  }

  const bgSlides = () => bgTrack.querySelectorAll('.featured-projects__slide');
  const textSlides = () => textTrack.querySelectorAll('.featured-projects__slide-text');
  const dots = () => dotsWrap.querySelectorAll('.featured-projects__dot');

  function goTo(index, manual = false) {
    if (index === current) return;

    bgSlides()[current].classList.remove('is-active');
    textSlides()[current].classList.remove('is-active');
    dots()[current].classList.remove('is-active');

    const nextText = textSlides()[index];
    nextText.classList.remove('is-active');
    void nextText.offsetWidth;

    current = index;

    bgSlides()[current].classList.add('is-active');
    textSlides()[current].classList.add('is-active');
    dots()[current].classList.add('is-active');

    if (manual) restart();
  }

  function next() { goTo((current + 1) % slides.length); }

  function restart() {
    clearInterval(timer);
    timer = setInterval(next, SLIDE_DURATION);
  }

  if (window.__pageTransitionReady) {
    restart();
  } else {
    window.addEventListener('page-transition:done', restart, { once: true });
  }
})();