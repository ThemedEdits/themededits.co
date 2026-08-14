/* =========================================================
   Reusable logo brick-draw animation.
   buildLogoDrawAnimation(svgEl) expects svgEl to contain:
   - <defs id="logoDrawClips"></defs>
   - three .logo-draw__shape elements (rect/rect/polygon)
   - <g id="bricksLayer"></g>
   Returns { run(): Promise<void>, reset(): void }

   Brick layout strategy:
   - RECT shapes: sliced into full-width horizontal strips that
     exactly tile the rectangle — brick width == rect width, so
     every brick is a real, uncut piece of the final shape.
   - POLYGON shape: bricks reuse the SAME rotation angle and
     SAME width as the rectangles (read directly off them), laid
     out as a rotated strip grid aligned to that angle. Since the
     grid is oriented to match the shape's own diagonal, almost
     every brick lands as a full, uncut piece — a shared clip-path
     only trims the handful of bricks at the pointed tips, which
     is unavoidable for any pointed shape (same as real brickwork
     needs cut bricks at a corner).
   ========================================================= */
function buildLogoDrawAnimation(svgEl) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const shapes = svgEl.querySelectorAll('.logo-draw__shape');
  const clipsDefs = svgEl.querySelector('#logoDrawClips');
  const bricksLayer = svgEl.querySelector('#bricksLayer');

  const DRAW_MS = 1000;
  const STAGGER_MS = 180;
  const TARGET_BRICK_SIZE = 68; // desired brick length; actual is adjusted per-shape for an exact fit
  const BRICK_FLY_MS = 550;
  const BRICK_STAGGER_MAX = 380;
  const HOLD_MS = 250;
  const BRICK_OVERLAP = 2.6; // tiny overlap so tiled edges don't show antialiasing seams

  if (!shapes.length || !clipsDefs || !bricksLayer) {
    return { run: () => Promise.resolve(), reset: () => {} };
  }

  clipsDefs.innerHTML = '';
  bricksLayer.innerHTML = '';

  shapes.forEach(shape => {
    const length = shape.getTotalLength ? shape.getTotalLength() : 0;
    shape.style.strokeDasharray = length;
    shape.style.strokeDashoffset = length;
    shape.style.transition = 'none';
  });

  // ---- derive the shared brick angle + width from the rectangles ----
  let sharedAngleDeg = -45;
  let sharedBrickWidth = TARGET_BRICK_SIZE;
  const firstRect = [...shapes].find(s => s.tagName.toLowerCase() === 'rect');
  if (firstRect) {
    const transformAttr = firstRect.getAttribute('transform') || '';
    const angleMatch = transformAttr.match(/rotate\(\s*(-?[\d.]+)/);
    if (angleMatch) sharedAngleDeg = parseFloat(angleMatch[1]);
    sharedBrickWidth = firstRect.width.baseVal.value;
  }

  const brickGroups = [];

  function applyFlyInStyle(el, cx, cy) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 180 + Math.random() * 220;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const rot = (Math.random() - 0.5) * 260;

    el.style.setProperty('--dx', `${dx}px`);
    el.style.setProperty('--dy', `${dy}px`);
    el.style.setProperty('--rot', `${rot}deg`);
    el.style.transform = `translate(var(--dx), var(--dy)) rotate(var(--rot))`;
    el.style.transformOrigin = `${cx}px ${cy}px`;
    el.style.opacity = '0';
  }

  function makeRectBrick(bx, by, bw, bh, color) {
    const brick = document.createElementNS(SVG_NS, 'rect');
    brick.setAttribute('x', bx - BRICK_OVERLAP / 2);
    brick.setAttribute('y', by - BRICK_OVERLAP / 2);
    brick.setAttribute('width', bw + BRICK_OVERLAP);
    brick.setAttribute('height', bh + BRICK_OVERLAP);
    brick.setAttribute('fill', color);
    brick.classList.add('logo-draw__brick');
    applyFlyInStyle(brick, bx + bw / 2, by + bh / 2);
    return brick;
  }

  // quad brick for the polygon: 4 explicit absolute-coordinate corners,
  // already rotated to the shared angle — no SVG transform attribute
  // needed, so CSS transform stays free to handle the fly-in animation
  function makePolygonBrick(cx, cy, u, w, halfLen, halfWidth, color) {
    const p1 = { x: cx - halfLen * u.x - halfWidth * w.x, y: cy - halfLen * u.y - halfWidth * w.y };
    const p2 = { x: cx + halfLen * u.x - halfWidth * w.x, y: cy + halfLen * u.y - halfWidth * w.y };
    const p3 = { x: cx + halfLen * u.x + halfWidth * w.x, y: cy + halfLen * u.y + halfWidth * w.y };
    const p4 = { x: cx - halfLen * u.x + halfWidth * w.x, y: cy - halfLen * u.y + halfWidth * w.y };

    const brick = document.createElementNS(SVG_NS, 'polygon');
    brick.setAttribute('points', [p1, p2, p3, p4].map(p => `${p.x},${p.y}`).join(' '));
    brick.setAttribute('fill', color);
    brick.classList.add('logo-draw__brick');
    applyFlyInStyle(brick, cx, cy);
    return brick;
  }

  shapes.forEach((shape, shapeIndex) => {
    const color = shape.dataset.fill;
    const shapeTransform = shape.getAttribute('transform') || '';
    const isRect = shape.tagName.toLowerCase() === 'rect';
    const bricks = [];
    let group;

    if (isRect) {
      // ---- exact-fit slicing: no clip-path needed at all ----
      const rx = shape.x.baseVal.value;
      const ry = shape.y.baseVal.value;
      const rw = shape.width.baseVal.value;
      const rh = shape.height.baseVal.value;

      group = document.createElementNS(SVG_NS, 'g');
      if (shapeTransform) group.setAttribute('transform', shapeTransform);

      const rows = Math.max(1, Math.round(rh / TARGET_BRICK_SIZE));
      const brickHeight = rh / rows; // exact division — every strip is full, uncut

      for (let r = 0; r < rows; r++) {
        const by = ry + r * brickHeight;
        const brick = makeRectBrick(rx, by, rw, brickHeight, color);
        group.appendChild(brick);
        bricks.push(brick);
      }
    } else {
      // ---- polygon: rotated strip grid at the SAME angle + width as
      // the rectangles, clipped to the true outline as a safety net ----
      const clipId = `logoClip-${Math.random().toString(36).slice(2)}-${shapeIndex}`;
      const clipPath = document.createElementNS(SVG_NS, 'clipPath');
      clipPath.setAttribute('id', clipId);
      const clipShape = shape.cloneNode(true);
      clipShape.removeAttribute('transform');
      clipPath.appendChild(clipShape);
      clipsDefs.appendChild(clipPath);

      const angleRad = sharedAngleDeg * Math.PI / 180;
      // u = long axis of each strip (matches the rectangles' own diagonal)
      // w = short axis, across the strip — width fixed to sharedBrickWidth
      const u = { x: Math.cos(angleRad), y: Math.sin(angleRad) };
      const w = { x: Math.cos(angleRad + Math.PI / 2), y: Math.sin(angleRad + Math.PI / 2) };

      // project every vertex onto (u, w) to find exactly how far the
      // rotated grid needs to extend in each direction to cover the shape
      // project every vertex onto (u, w) to find exactly how far the
// rotated grid needs to extend in each direction to cover the shape.
// points can be space- or comma-separated pairs — split on any run of
// either, then take numbers two at a time, so both formats work.
const rawNums = shape.getAttribute('points').trim().split(/[\s,]+/).map(Number);
const pointsAttr = [];
for (let i = 0; i < rawNums.length - 1; i += 2) {
  pointsAttr.push({ x: rawNums[i], y: rawNums[i + 1] });
}

      let uMin = Infinity, uMax = -Infinity, wMin = Infinity, wMax = -Infinity;
      pointsAttr.forEach(p => {
        const pu = p.x * u.x + p.y * u.y;
        const pw = p.x * w.x + p.y * w.y;
        uMin = Math.min(uMin, pu); uMax = Math.max(uMax, pu);
        wMin = Math.min(wMin, pw); wMax = Math.max(wMax, pw);
      });

      const rows = Math.max(1, Math.round((uMax - uMin) / TARGET_BRICK_SIZE));
      const cols = Math.max(1, Math.round((wMax - wMin) / sharedBrickWidth));
      const brickLen = (uMax - uMin) / rows;   // exact division along the strip length
      const brickWidth = (wMax - wMin) / cols; // exact division across the strip width

      group = document.createElementNS(SVG_NS, 'g');
      group.setAttribute('clip-path', `url(#${clipId})`);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const uCenter = uMin + (r + 0.5) * brickLen;
          const wCenter = wMin + (c + 0.5) * brickWidth;
          const cx = uCenter * u.x + wCenter * w.x;
          const cy = uCenter * u.y + wCenter * w.y;
          const brick = makePolygonBrick(cx, cy, u, w, brickLen / 2 + BRICK_OVERLAP / 2, brickWidth / 2 + BRICK_OVERLAP / 2, color);
          group.appendChild(brick);
          bricks.push(brick);
        }
      }
    }

    bricksLayer.appendChild(group);
    brickGroups.push(bricks);
  });

  function drawOutline(shape, index) {
    return new Promise(resolve => {
      setTimeout(() => {
        shape.style.transition = `stroke-dashoffset ${DRAW_MS}ms ease-in-out`;
        shape.style.strokeDashoffset = '0';
        setTimeout(resolve, DRAW_MS);
      }, index * STAGGER_MS);
    });
  }

  function flyInBricks(bricks) {
    return new Promise(resolve => {
      const order = [...bricks.keys()].sort(() => Math.random() - 0.5);
      let maxDelay = 0;

      order.forEach((brickIdx, i) => {
        const brick = bricks[brickIdx];
        const delay = (i / order.length) * BRICK_STAGGER_MAX;
        maxDelay = Math.max(maxDelay, delay);

        setTimeout(() => {
          brick.style.transition = `transform ${BRICK_FLY_MS}ms cubic-bezier(.2,.8,.2,1), opacity ${BRICK_FLY_MS * 0.6}ms ease-out`;
          brick.style.transform = 'translate(0px, 0px) rotate(0deg)';
          brick.style.opacity = '1';
        }, delay);
      });

      setTimeout(resolve, maxDelay + BRICK_FLY_MS);
    });
  }

  function reset() {
    shapes.forEach(shape => {
      shape.style.transition = 'none';
      const length = shape.getTotalLength ? shape.getTotalLength() : 0;
      shape.style.strokeDashoffset = length;
    });
    brickGroups.forEach(bricks => {
      bricks.forEach(brick => {
        brick.style.transition = 'none';
        brick.style.opacity = '0';
        brick.style.transform = `translate(var(--dx), var(--dy)) rotate(var(--rot))`;
      });
    });
  }

  async function run() {
    reset();
    // force reflow so the reset is applied before the draw starts
    void svgEl.getBoundingClientRect();

    await Promise.all([...shapes].map((s, i) => drawOutline(s, i)));
    await Promise.all(brickGroups.map((bricks, i) =>
      new Promise(resolve => setTimeout(() => flyInBricks(bricks).then(resolve), i * 110))
    ));
    await new Promise(r => setTimeout(r, HOLD_MS));
  }

  return { run, reset };
}

window.buildLogoDrawAnimation = buildLogoDrawAnimation;