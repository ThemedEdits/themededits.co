(() => {
  'use strict';

  const trail = document.getElementById('projectsTrail');
  const itemsWrap = document.getElementById('projectsTrailItems');
  const canvas = document.getElementById('trailCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  if (!trail || !itemsWrap || !canvas || !ctx) return;

  const isMobile = () => window.innerWidth <= 780;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const TRIGGER_VH = 0.68;

  let points = [];
  let cardDocY = [];
  let cards = [];
  let rectW = 0, rectH = 0;
  let sparks = [];
  let progress = 0;
  let targetProgress = 0;
  let canvasTopY = 0;
  let trailDocTop = 0;
  let cardTs = [];
  let navIsOpen = false;
  let currentFilter = (() => {
    const t = new URLSearchParams(window.location.search).get('type');
    return (t === 'web' || t === 'graphics') ? t : 'all';
  })();

  function getFilteredItems() {
    if (currentFilter === 'all') return ALL_PORTFOLIO_ITEMS;
    return ALL_PORTFOLIO_ITEMS.filter(item => item.category === currentFilter);
  }

  function layoutCards() {
    itemsWrap.innerHTML = '';
    const mobile = isMobile();

    getFilteredItems().forEach((item, i) => {
      const node = createPortfolioCard(item);
      node.classList.add('p-card--trail');
      node.dataset.revealed = 'false';

      const side = mobile ? 'center' : (i % 2 === 0 ? 'left' : 'right');
      node.dataset.side = side;
      node.style.setProperty('--order', i);

      const dot = document.createElement('span');
      dot.className = 'p-card__origin-dot';
      node.appendChild(dot);

      itemsWrap.appendChild(node);
    });

    cards = [...itemsWrap.querySelectorAll('.p-card--trail')];
  }

  function docTop(el) {
    const rect = el.getBoundingClientRect();
    return rect.top + window.scrollY;
  }

  function measure() {
    const rect = itemsWrap.getBoundingClientRect();
    trailDocTop = docTop(trail);

    // Origin anchored to the trail section's own top edge in document
    // coordinates — NOT viewport-center-at-load-time. This is stable
    // regardless of scroll position when init()/measure() runs, so a
    // mid-page refresh still produces a correct origin and the trail
    // always starts from the same place on reload from anywhere.
    const originDocY = trailDocTop;
    canvasTopY = 0;

    rectW = rect.width;
    const trailHeight = trail.getBoundingClientRect().height;
    rectH = Math.max(trailHeight - canvasTopY, 100);

    canvas.style.top = canvasTopY + 'px';
    canvas.width = rectW * DPR;
    canvas.height = rectH * DPR;
    canvas.style.width = rectW + 'px';
    canvas.style.height = rectH + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const originX = rectW / 2;
    const originPoint = { x: originX, y: 0, centerY: 0, h: 0 };

    const cardPoints = cards.map(card => {
      const prevTransform = card.style.transform;
      const prevTransition = card.style.transition;
      card.style.transition = 'none';
      card.style.transform = 'none'; // measure the card's LAID-OUT position, ignoring the pre-reveal translateY/scale/rotate offset

      const cardRect = card.getBoundingClientRect();
      const cardDocTop = docTop(card);
      const dotRect = card.querySelector('.p-card__origin-dot').getBoundingClientRect();

      card.style.transform = prevTransform;
      card.style.transition = prevTransition;

      return {
        x: dotRect.left - rect.left + dotRect.width / 2,
        y: (cardDocTop - trailDocTop) - canvasTopY,
        centerY: (cardDocTop - trailDocTop) - canvasTopY,
        h: cardRect.height,
        docY: cardDocTop
      };
    });

    points = [originPoint, ...cardPoints];
    cardDocY = [originDocY, ...cardPoints.map(p => p.docY)];
  }

  function curvePoint(t) {
    const segCount = points.length - 1;
    if (segCount < 1) return points[0] || { x: 0, y: 0 };

    const segF = t * segCount;
    const i = Math.min(Math.floor(segF), segCount - 1);
    const localT = segF - i;

    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[Math.min(i + 1, points.length - 1)];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const y = catmullRom(p0.centerY, p1.centerY, p2.centerY, p3.centerY, localT);
    const wobble = Math.sin(t * Math.PI * segCount * 1.1) * 34;
    const baseX = catmullRom(p0.x, p1.x, p2.x, p3.x, localT);

    return { x: baseX + wobble, y };
  }

  function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
  }

  function spawnLightning(x, y) {
    const segs = 7;
    const bolt = [];
    let cx = x, cy = y - 46;
    bolt.push({ x: cx, y: cy });
    for (let s = 0; s < segs; s++) {
      cy += 46 / segs;
      cx = x + (Math.random() - 0.5) * 26;
      bolt.push({ x: cx, y: cy });
    }
    sparks.push({ bolt, life: 1 });
  }

  function drawSparks() {
    sparks.forEach(spark => {
      ctx.save();
      ctx.globalAlpha = spark.life;
      ctx.strokeStyle = '#ffd370';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#fbae17';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      spark.bolt.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.restore();
      spark.life -= 0.06;
    });
    sparks = sparks.filter(s => s.life > 0);
  }

  function pointProgressFraction(i) {
    const vh = window.innerHeight;
    const totalScrollable = Math.max(trail.offsetHeight - vh, 1);
    const scrollNeeded = cardDocY[i] - TRIGGER_VH * vh;
    const scrollAtSectionStart = trailDocTop;
    const frac = (scrollNeeded - scrollAtSectionStart) / totalScrollable;
    return Math.min(Math.max(frac, 0), 1);
  }

  function recomputeCardTs() {
    cardTs = points.map((_, i) => pointProgressFraction(i));
  }

  function scrollProgressToCurveT(sp) {
    const n = cardTs.length;
    if (n < 2) return sp;
    if (sp <= cardTs[0]) return 0;
    if (sp >= cardTs[n - 1]) return 1;

    for (let i = 0; i < n - 1; i++) {
      const a = cardTs[i], b = cardTs[i + 1];
      if (sp >= a && sp <= b) {
        const localFrac = b > a ? (sp - a) / (b - a) : 0;
        const tA = i / (n - 1);
        const tB = (i + 1) / (n - 1);
        return tA + (tB - tA) * localFrac;
      }
    }
    return sp;
  }

  function drawOriginDots() {
    points.forEach((p, i) => {
      if (i === 0) return; // skip the origin/start point, only mark card tops
      const card = cards[i - 1];
      if (!card || card.dataset.revealed === 'true') return; // was: continue

      const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 450);
      const radius = 4.5 + pulse * 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251,174,23,0.85)';
      ctx.shadowColor = '#fbae17';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, rectW, rectH);
    if (points.length < 2) return;

    const steps = Math.max(points.length * 30, 60);
    const curveProgress = scrollProgressToCurveT(progress);
    const drawSteps = Math.floor(steps * curveProgress);

    ctx.beginPath();
    for (let s = 0; s <= drawSteps; s++) {
      const t = s / steps;
      const pt = curvePoint(t);
      s === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.strokeStyle = 'rgba(251,174,23,0.55)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.beginPath();
    for (let s = 0; s <= drawSteps; s++) {
      const t = s / steps;
      const p1 = curvePoint(t);
      const wobble2 = Math.sin(t * Math.PI * (points.length - 1) * 1.1 + Math.PI) * 34;
      const baseWobble = Math.sin(t * Math.PI * (points.length - 1) * 1.1) * 34;
      s === 0
        ? ctx.moveTo(p1.x - baseWobble + wobble2, p1.y)
        : ctx.lineTo(p1.x - baseWobble + wobble2, p1.y);
    }
    ctx.strokeStyle = 'rgba(255,211,112,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    drawSparks();
    drawOriginDots();
  }

  function revealCard(card) {
    card.dataset.revealed = 'true';
    const i = cards.indexOf(card);
    const p = points[i + 1];
    if (p) spawnLightning(p.x, p.y);
    requestAnimationFrame(() => {
      card.classList.add('is-revealed', 'is-waving');
      setTimeout(() => card.classList.remove('is-waving'), 3000);
    });
  }

  function unrevealCard(card) {
    card.dataset.revealed = 'false';
    card.classList.remove('is-revealed', 'is-waving');
  }

  function syncCardReveals() {
    cards.forEach((card, i) => {
      const cardT = cardTs[i + 1];
      if (cardT === undefined) return;
      const isRevealed = card.dataset.revealed === 'true';

      if (!isRevealed && progress >= cardT) {
        revealCard(card);
      } else if (isRevealed && progress < cardT) {
        unrevealCard(card);
      }
    });
  }

  function onScroll() {
    const vh = window.innerHeight;
    const totalScrollable = Math.max(trail.offsetHeight - vh, 1);
    const scrolled = Math.min(Math.max(window.scrollY - trailDocTop, 0), totalScrollable);
    targetProgress = scrolled / totalScrollable;
  }

  let lastFrameTime = performance.now();

  function loop(now) {
    const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;

    if (!navIsOpen) {
      syncCardReveals();

      const diff = targetProgress - progress;
      const lerpSpeed = 3.2;
      progress += diff * (1 - Math.exp(-lerpSpeed * dt));

      if (Math.abs(targetProgress - progress) < 0.0005) {
        progress = targetProgress;
      }

      draw();
    }
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  function init() {
    layoutCards();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measure();
        recomputeCardTs();
        onScroll();
        // start progress at the CURRENT scroll position (so a mid-page
        // refresh correctly shows however much trail should already be
        // drawn), not hardcoded to 0 — but since canvasTopY/points are
        // now scroll-independent, this correctly reconstructs the full
        // trail up to wherever the user actually is on reload
        progress = targetProgress;
      });
    });
  }

  if (window.lenis) {
    window.lenis.on('scroll', () => {
      if (navIsOpen) return;
      onScroll();
    });
  } else {
    window.addEventListener('scroll', () => {
      if (navIsOpen) return;
      onScroll();
    }, { passive: true });
  }

  window.addEventListener('resize', () => {
    if (navIsOpen) return;
    measure();
    recomputeCardTs();
    onScroll();
  });

  window.addEventListener('nav:willOpen', () => { navIsOpen = true; });
  window.addEventListener('nav:willClose', () => { navIsOpen = false; });

  init();
  window.__setProjectsFilter = function(filter){
  currentFilter = filter;
  sparks = [];
  layoutCards();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      measure();
      recomputeCardTs();
      progress = 0;
      targetProgress = 0;
      onScroll();
    });
  });
};
})();