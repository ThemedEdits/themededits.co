(() => {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const slug = window.location.pathname.split('/').filter(Boolean).filter(s => s !== 'index.html').pop();

  const index = PORTFOLIO_ITEMS.findIndex(i => i.id === slug);
  const item = index >= 0 ? PORTFOLIO_ITEMS[index] : PORTFOLIO_ITEMS[0];
  const prevItem = PORTFOLIO_ITEMS[(index - 1 + PORTFOLIO_ITEMS.length) % PORTFOLIO_ITEMS.length];
  const nextItem = PORTFOLIO_ITEMS[(index + 1) % PORTFOLIO_ITEMS.length];

  document.title = `${item.title} | ${item.subtitle} | Themed Edits`;
  document.getElementById('pageTitle').textContent = `${item.title} | Themed Edits`;
  document.getElementById('pageDesc').setAttribute('content', item.description);

  document.getElementById('pdTitle').textContent = item.title;
  document.getElementById('pdDesc').textContent = item.description;

  const servicesWrap = document.getElementById('pdServices');
  (item.services || [item.subtitle]).forEach(s => {
    const li = document.createElement('li');
    li.className = 'pd__service';
    li.textContent = s;
    servicesWrap.appendChild(li);
  });

  const liveCta = document.getElementById('pdLiveCta');
  if (item.category === 'web' && item.liveUrl) {
    liveCta.href = item.liveUrl;
    liveCta.target = '_blank';
    liveCta.rel = 'noopener';
    liveCta.style.display = '';
  }
  const hireCta = document.getElementById('pdHireCta');
  if (hireCta) {
    const projectType = item.category === 'web' ? 'Website' : 'Brand identity';
    hireCta.href = `/hire/?type=${encodeURIComponent(projectType)}`;
  }

  const prevLink = document.getElementById('pdPrev');
  const nextLink = document.getElementById('pdNext');
  prevLink.href = `/projects/${prevItem.id}`;
  nextLink.href = `/projects/${nextItem.id}`;
  const pdNav = document.querySelector('.pd__nav');
  if (pdNav) {
    requestAnimationFrame(() => {
      pdNav.classList.add('is-revealed');
    });
  }

  const rightWrap = document.getElementById('pdRight');
  const images = (item.gallery && item.gallery.length) ? item.gallery : [item.heroImage];

  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = item.title;
    img.className = 'pd__image';
    img.loading = 'lazy';
    rightWrap.appendChild(img);
  });

  if (window.__splitHoverInit) {
    document.querySelectorAll('[data-split-hover]').forEach(el => {
      if (!el.querySelector('.ch')) window.__splitHoverInit(el);
    });
  }
})();