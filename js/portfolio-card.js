/* =========================================================
   Reusable portfolio card — builds a DOM node from a
   PORTFOLIO_ITEMS entry. Used on the /projects/ trail and
   anywhere else a project card is needed.
   ========================================================= */
function createPortfolioCard(item){
  const el = document.createElement('a');
  el.href = `/projects/${item.id}`;
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
          <span class="p-card__link" data-split-hover>View project <span aria-hidden="true">→</span></span>
        </span>
      </span>
    </span>
  `;

  if (window.__splitHoverInit){
    el.querySelectorAll('[data-split-hover]').forEach(window.__splitHoverInit);
  }

  return el;
}