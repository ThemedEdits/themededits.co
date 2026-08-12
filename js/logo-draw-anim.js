/* =========================================================
   Reusable logo brick-draw animation.
   buildLogoDrawAnimation(svgEl) expects svgEl to contain:
   - <defs id="logoDrawClips"></defs>
   - three .logo-draw__shape elements (rect/rect/polygon)
   - <g id="bricksLayer"></g>
   Returns { run(): Promise<void>, reset(): void }
   ========================================================= */
function buildLogoDrawAnimation(svgEl) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const shapes = svgEl.querySelectorAll('.logo-draw__shape');
  const clipsDefs = svgEl.querySelector('#logoDrawClips');
  const bricksLayer = svgEl.querySelector('#bricksLayer');

  const DRAW_MS = 1000;
  const STAGGER_MS = 180;
  const BRICK_SIZE = 48;
  const BRICK_FLY_MS = 550;
  const BRICK_STAGGER_MAX = 380;
  const HOLD_MS = 250;

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

  const brickGroups = [];

  shapes.forEach((shape, shapeIndex) => {
    const clipId = `logoClip-${Math.random().toString(36).slice(2)}-${shapeIndex}`;
    const clipPath = document.createElementNS(SVG_NS, 'clipPath');
    clipPath.setAttribute('id', clipId);

    const clipShape = shape.cloneNode(true);
    clipShape.removeAttribute('transform');
    clipPath.appendChild(clipShape);
    clipsDefs.appendChild(clipPath);

    const bbox = shape.getBBox();
    const shapeTransform = shape.getAttribute('transform') || '';

    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('clip-path', `url(#${clipId})`);
    if (shapeTransform) group.setAttribute('transform', shapeTransform);

    const color = shape.dataset.fill;
    const cols = Math.ceil(bbox.width / BRICK_SIZE) + 1;
    const rows = Math.ceil(bbox.height / BRICK_SIZE) + 1;
    const bricks = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const brick = document.createElementNS(SVG_NS, 'rect');
        const bx = bbox.x + c * BRICK_SIZE;
        const by = bbox.y + r * BRICK_SIZE;
        brick.setAttribute('x', bx - 0.5);
        brick.setAttribute('y', by - 0.5);
        brick.setAttribute('width', BRICK_SIZE + 1.5);
        brick.setAttribute('height', BRICK_SIZE + 1.5);
        brick.setAttribute('fill', color);
        brick.classList.add('logo-draw__brick');

        const angle = Math.random() * Math.PI * 2;
        const dist = 180 + Math.random() * 220;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const rot = (Math.random() - 0.5) * 260;

        brick.style.setProperty('--dx', `${dx}px`);
        brick.style.setProperty('--dy', `${dy}px`);
        brick.style.setProperty('--rot', `${rot}deg`);
        brick.style.transform = `translate(var(--dx), var(--dy)) rotate(var(--rot))`;
        brick.style.transformOrigin = `${bx + BRICK_SIZE / 2}px ${by + BRICK_SIZE / 2}px`;
        brick.style.opacity = '0';

        group.appendChild(brick);
        bricks.push(brick);
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