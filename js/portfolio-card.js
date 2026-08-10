function createPortfolioCard(item){
  const isPoster = item.type === 'poster';
  const el = document.createElement(isPoster ? 'button' : 'a');

  if (isPoster){
    el.type = 'button';
    el.dataset.lightboxSrc = item.fullImage;
    el.dataset.lightboxTitle = item.title;
  } else {
    el.href = `/projects/${item.id}`;
  }

  el.className = 'p-card';
  el.setAttribute('data-category', item.category);
  el.setAttribute('aria-label', `${item.title} — ${item.subtitle}`);

  el.innerHTML = `
    <span class="p-card__thumb-wrap">
      <img src="${item.thumbnail}" alt="${item.title}" class="p-card__thumb" loading="lazy">
      <span class="p-card__glass">
        <span class="p-card__glass-inner">
          <span class="p-card__cat">${item.category === 'web' ? 'Web' : 'Graphics'}</span>
          <span class="p-card__title">${item.title}</span>
          <span class="p-card__link" data-split-hover>${isPoster ? 'View poster' : 'View project'} <span aria-hidden="true">→</span></span>
        </span>
      </span>
    </span>
  `;

  if (isPoster){
    el.addEventListener('click', () => {
      window.__openLightbox && window.__openLightbox(item.fullImage, item.title);
    });
  }

  if (window.__splitHoverInit){
    el.querySelectorAll('[data-split-hover]').forEach(window.__splitHoverInit);
  }

  return el;
}