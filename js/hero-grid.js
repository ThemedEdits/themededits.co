(() => {
  'use strict';

  // =========================================================
  // HERO CONTENT
  // =========================================================

  const DEFAULT_ITEMS = [
    { text: 'Websites', image: '/assets/hero/Websites.webp' },
    { text: 'Brand Identities', image: '/assets/hero/Brand-Identities.webp' },
    { text: 'Digital Experiences', image: '/assets/hero/Digital-Experiences.webp' },
    { text: 'Web Experiences', image: '/assets/hero/Web-Experiences.webp' },
    { text: 'Logos', image: '/assets/hero/Logos.webp' },
    { text: 'Social Content', image: '/assets/hero/Social-Designs.webp', image2: '/assets/hero/Social-Designs-2.webp' }
  ];


  // =========================================================
  // TIMING
  // =========================================================

  const CYCLE_MS = 1800;
  const ENTER_MS = 700;
  const EXIT_MS = 300;


  // =========================================================
  // IMAGE FRAME SIZES - Desktop & Mobile Responsive
  // =========================================================

  function getFrameSizes() {
    const width = window.innerWidth;

    // Desktop sizes
    if (width > 1024) {
      return [
        { w: 280, h: 470 },
        { w: 280, h: 470 },
        { w: 480, h: 300 },
        { w: 480, h: 300 },
        { w: 300, h: 500 },
        { w: 300, h: 300 }
      ];
    }

    // Tablet — 75% of desktop
    else if (width > 768) {
      return [
        { w: 210, h: 353 },
        { w: 210, h: 353 },
        { w: 360, h: 225 },
        { w: 360, h: 225 },
        { w: 225, h: 375 },
        { w: 225, h: 225 }
      ];
    }

    // Mobile landscape — 50% of desktop
    else if (width > 480) {
      return [
        { w: 140, h: 235 },
        { w: 140, h: 235 },
        { w: 240, h: 150 },
        { w: 240, h: 150 },
        { w: 150, h: 250 },
        { w: 150, h: 150 }
      ];
    }

    // Mobile portrait — 40% of desktop
    else {
      return [
        { w: 112, h: 188 },
        { w: 112, h: 188 },
        { w: 192, h: 120 },
        { w: 192, h: 120 },
        { w: 180, h: 310 },
        { w: 120, h: 120 }
      ];
    }
  }
  function getSecondaryFrameSize() {
    const width = window.innerWidth;

    if (width > 1024) return { w: 300, h: 300 };
    else if (width > 768) return { w: 225, h: 225 };
    else if (width > 480) return { w: 150, h: 150 };
    else return { w: 120, h: 120 };
  }

  function getSecondaryPosition() {
    // always top-left, per breakpoint edge padding
    const width = window.innerWidth;

    if (width > 1024) return { top: '18%', left: '6%' };
    else if (width > 768) return { top: '18%', left: '6%' };
    else if (width > 480) return { top: '18%', left: '6%' };
    else return { top: '18%', left: '6%' };
  }

  // =========================================================
  // FIXED IMAGE POSITIONS - Desktop & Mobile Responsive
  // =========================================================

  function getPositionSlots() {
    const width = window.innerWidth;

    // Desktop positions
    if (width > 1024) {
      return [
        { top: '14%', left: '6%' },
        { top: '14%', right: '6%' },
        { bottom: '5%', left: '6%' },
        { top: '18%', right: '6%' },
        { top: '50%', left: '50%', transformX: true, transformY: true },
        { bottom: '5%', right: '6%' }
      ];
    }
    // Tablet — now follows the same relative pattern as mobile portrait
    else if (width > 768) {
      return [
        { top: '12%', right: '6%' },
        { bottom: '3%', left: '6%' },
        { top: '18%', left: '6%' },
        { top: '18%', right: '6%' },
        { top: '50%', left: '50%', transformX: true, transformY: true },
        { bottom: '12%', right: '12%' }
      ];
    }
    // Mobile landscape — now follows the same relative pattern as mobile portrait
    else if (width > 480) {
      return [
        { top: '12%', right: '6%' },
        { bottom: '3%', left: '6%' },
        { top: '18%', left: '6%' },
        { top: '18%', right: '6%' },
        { top: '50%', left: '50%', transformX: true, transformY: true },
        { bottom: '12%', right: '12%' }
      ];
    }
    // Mobile portrait
    else {
      return [
        { top: '12%', right: '6%' },
        { bottom: '3%', left: '6%' },
        { top: '18%', left: '6%' },
        { top: '18%', right: '6%' },
        { top: '50%', left: '50%', transformX: true, transformY: true },
        { bottom: '12%', right: '12%' }
      ];
    }
  }


  // =========================================================
  // ELEMENTS
  // =========================================================

  const items =
    (window.HERO_ITEMS && window.HERO_ITEMS.length)
      ? window.HERO_ITEMS
      : DEFAULT_ITEMS;

  const wordInner = document.getElementById('heroWordInner');
  const frame = document.getElementById('heroFrame');
  const frameImg = document.getElementById('heroFrameImg');
  const frame2 = document.getElementById('heroFrame2');
  const frameImg2 = document.getElementById('heroFrameImg2');
  const dotGrid = document.getElementById('heroDotGrid');

  if (
    !wordInner ||
    !frame ||
    !frameImg ||
    !dotGrid ||
    !items.length
  ) {
    return;
  }

  // =========================================================
  // SMART HERO IMAGE LOADING
  // =========================================================
  //
  // Only the image currently needed is loaded with priority.
  // The next image is preloaded in the background so the
  // animation stays perfectly synchronized without forcing
  // every hero asset to download on initial page load.
  // =========================================================

  const imageCache = new Map();

  function preloadImage(src, priority = false) {
    if (!src) return Promise.resolve(null);

    // Already requested / decoded.
    if (imageCache.has(src)) {
      return imageCache.get(src);
    }

    const promise = new Promise(resolve => {
      const img = new Image();

      img.decoding = 'async';

      if (priority) {
        img.fetchPriority = 'high';
      }

      img.onload = async () => {
        try {
          if (img.decode) {
            await img.decode();
          }
        } catch (_) {
          // Image is still usable even if decode() rejects.
        }

        resolve(img);
      };

      img.onerror = () => {
        resolve(null);
      };

      img.src = src;
    });

    imageCache.set(src, promise);

    return promise;
  }


  // =========================================================
  // REVEAL IMAGE
  // =========================================================
  //
  // The image is already requested before this function is called.
  // We still wait for decode() so the visual never reveals a stale
  // bitmap or flashes the previous image.
  // =========================================================

  function revealFrameImage(imgEl, frameEl, src, altText) {
    // Always establish the starting state FIRST
    imgEl.style.transition = 'none';
    imgEl.style.opacity = '0';
    imgEl.style.transform = 'scale(1.4)';
    imgEl.alt = altText;

    const reveal = () => {
      imgEl.src = src;

      // Force the browser to commit the starting state
      void imgEl.offsetWidth;
      void frameEl.offsetWidth;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Restore CSS transition
          imgEl.style.transition = '';

          // Trigger zoom-out
          imgEl.style.opacity = '';
          imgEl.style.transform = '';

          // Trigger frame visibility
          frameEl.classList.add('is-active');
        });
      });
    };

    if (imgEl.src === new URL(src, window.location.href).href) {
      // Already displaying this source — still force a fresh animation
      reveal();
      return;
    }

    if (imgEl.decode) {
      imgEl.src = src;

      imgEl.decode()
        .then(() => reveal())
        .catch(() => reveal());
    } else {
      reveal();
    }
  }


  // =========================================================
  // DOT SETTINGS
  // =========================================================

  const DOT = 7;
  const SPACING = 25;


  // =========================================================
  // DOT MORPH PHASES - EXACT SEQUENCE AS REQUESTED
  // =========================================================

  const DOT_PHASES = [

    // =========================================================
    // PHASE 0 — Single dot
    // =========================================================
    [
      [0, 0]
    ],


    // =========================================================
    // PHASE 1 — 4 dots forming a square
    // =========================================================
    [
      [-SPACING, -SPACING],
      [SPACING, -SPACING],
      [-SPACING, SPACING],
      [SPACING, SPACING]
    ],


    // =========================================================
    // PHASE 2 — Rotated square / diamond
    // =========================================================
    [
      [0, -SPACING * 1.1],
      [-SPACING * 1.1, 0],
      [SPACING * 1.1, 0],
      [0, SPACING * 1.1]
    ],


    // =========================================================
    // PHASE 3 — Diamond + center dot
    // =========================================================
    [
      [0, -SPACING * 1.4],
      [-SPACING * 1.4, 0],
      [0, 0],
      [SPACING * 1.4, 0],
      [0, SPACING * 1.4]
    ],


    // =========================================================
    // PHASE 4 — 8-dot 4×2 rectangle rotated +45°
    // =========================================================
    [
      [-SPACING * 1.5, SPACING * 0.5],
      [-SPACING * 0.5, SPACING * 0.5],
      [SPACING * 0.5, SPACING * 0.5],
      [SPACING * 1.5, SPACING * 0.5],

      [-SPACING * 1.5, -SPACING * 0.5],
      [-SPACING * 0.5, -SPACING * 0.5],
      [SPACING * 0.5, -SPACING * 0.5],
      [SPACING * 1.5, -SPACING * 0.5]
    ].map(([x, y]) => {

      const angle = -Math.PI / 4;

      return [
        x * Math.cos(angle) - y * Math.sin(angle),
        x * Math.sin(angle) + y * Math.cos(angle)
      ];

    }),


    // =========================================================
    // PHASE 5 — Reduced 4-dot version of Phase 4
    // Same 45° rotation and same direction
    // =========================================================
    [
      [-SPACING * 0.5, SPACING * 0.5],
      [SPACING * 0.5, SPACING * 0.5],

      [-SPACING * 0.5, -SPACING * 0.5],
      [SPACING * 0.5, -SPACING * 0.5]
    ].map(([x, y]) => {

      const angle = Math.PI / 4;

      return [
        x * Math.cos(angle) - y * Math.sin(angle),
        x * Math.sin(angle) + y * Math.cos(angle)
      ];

    }),


    // =========================================================
    // PHASE 6 — 3 dots
    // =========================================================
    [
      [-SPACING * 1.2, 0],
      [0, 0],
      [SPACING * 1.2, 0]
    ].map(([x, y]) => {

      const angle = -Math.PI / 4;

      return [
        x * Math.cos(angle) - y * Math.sin(angle),
        x * Math.sin(angle) + y * Math.cos(angle)
      ];

    }),

  ];


  // =========================================================
  // RESPONSIVE GRID CONFIGURATION
  // =========================================================

  function getGridConfig() {
    const width = window.innerWidth;

    // Desktop: 5 columns, 3 rows
    if (width > 1024) {
      return { cols: 5, rows: 3, dotSize: 7, spacing: 25 };
    }
    // Tablet: 4 columns, 3 rows
    else if (width > 768) {
      return { cols: 4, rows: 3, dotSize: 6, spacing: 22 };
    }
    // Mobile landscape: 3 columns, 4 rows
    else if (width > 480) {
      return { cols: 3, rows: 4, dotSize: 5, spacing: 18 };
    }
    // Mobile portrait: 3 columns, 5 rows
    else {
      return { cols: 3, rows: 5, dotSize: 4, spacing: 14 };
    }
  }

  let GRID_COLS = 5;
  let GRID_ROWS = 3;
  let GRID_OFFSET_X = 0;
  let GRID_OFFSET_Y = 30;
  let currentDotSize = DOT;
  let currentSpacing = SPACING;


  // =========================================================
  // CREATE CSS FOR DOTS (Dynamic)
  // =========================================================

  function updateDotStyles() {
    const style = document.getElementById('hero-dot-styles');
    if (style) {
      style.remove();
    }

    const newStyle = document.createElement('style');
    newStyle.id = 'hero-dot-styles';
    newStyle.textContent = `
      .hero__dot-grid {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        overflow: hidden;
        opacity: 1;
        contain: layout paint;
      }

      .hero__dot-cluster {
        position: absolute;
        width: 1px;
        height: 1px;
        transform: translate(-50%, -50%);
      }

      .hero__dot {
        position: absolute;

        width: ${currentDotSize}px;
        height: ${currentDotSize}px;
        min-width: ${currentDotSize}px;
        min-height: ${currentDotSize}px;
        max-width: ${currentDotSize}px;
        max-height: ${currentDotSize}px;

        margin-left: -${currentDotSize / 2}px;
        margin-top: -${currentDotSize / 2}px;

        display: block;
        box-sizing: border-box;

        aspect-ratio: 1 / 1;
        border-radius: 50%;

        background: var(--ink);

        opacity: 0;

        transform: translate3d(0, 0, 0);

        transform-origin: 50% 50%;

        will-change: transform, opacity;

        transition:
          transform ${ENTER_MS}ms cubic-bezier(1, .2, .1, 1),
          opacity ${ENTER_MS}ms cubic-bezier(1, .2, .1, 1);
      }

      .hero__dot-grid.is-morphing .hero__dot {
        transition:
          transform ${ENTER_MS}ms cubic-bezier(1, .2, .1, 1),
          opacity ${ENTER_MS}ms cubic-bezier(1, .2, .1, 1);
      }

      /* Hidden dot in middle row center */
      .hero__dot-cluster.is-hidden {
        display: none;
      }
    `;

    document.head.appendChild(newStyle);
  }


  // =========================================================
  // BUILD THE ENTIRE GRID (Responsive)
  // =========================================================

  const clusters = [];

  function getCenterPosition(config) {
    // Calculate which column/row should be the center
    const centerCol = Math.floor(config.cols / 2);
    const centerRow = Math.floor(config.rows / 2);
    return { centerCol, centerRow };
  }

  function buildGrid() {

    const config = getGridConfig();
    GRID_COLS = config.cols;
    GRID_ROWS = config.rows;
    currentDotSize = config.dotSize;
    currentSpacing = config.spacing;

    // Update DOT_PHASES with new spacing
    updatePhasesWithSpacing(currentSpacing);

    // Update CSS with new dot size
    updateDotStyles();

    dotGrid.innerHTML = '';
    clusters.length = 0;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // =========================================================
    // SPACING CONTROLS FOR EACH BREAKPOINT
    // =========================================================

    let spacingX, spacingY, edgePadding = 0;

    if (width <= 480) {
      // Mobile portrait
      edgePadding = 55;
      const availableWidth = width - (edgePadding * 2);
      spacingX = availableWidth / (GRID_COLS - 1);
      spacingY = height / (GRID_ROWS + 1);

    } else if (width <= 768) {
      // Mobile landscape / Tablet
      edgePadding = 60;
      const availableWidth = width - (edgePadding * 2);
      spacingX = availableWidth / (GRID_COLS - 1);
      spacingY = height / (GRID_ROWS + 1);

    } else if (width <= 1024) {
      // Tablet / Small desktop
      edgePadding = 70;
      const availableWidth = width - (edgePadding * 2);
      spacingX = availableWidth / (GRID_COLS - 1);
      spacingY = height / (GRID_ROWS + 1);

    } else {
      // Desktop (1024px+)
      edgePadding = 80;
      const availableWidth = width - (edgePadding * 2);
      spacingX = availableWidth / (GRID_COLS - 1);
      spacingY = height / (GRID_ROWS + 1);
    }

    const { centerCol, centerRow } = getCenterPosition(config);

    for (let row = 0; row < GRID_ROWS; row++) {

      for (let col = 0; col < GRID_COLS; col++) {

        // Skip the center dot to keep text area clear
        if (row === centerRow && col === centerCol) {
          continue;
        }

        const cluster = document.createElement('div');

        cluster.className = 'hero__dot-cluster';

        let posX, posY;

        // Position calculation
        posX = edgePadding + (spacingX * col);
        posY = spacingY * (row + 1) + GRID_OFFSET_Y;

        cluster.style.left = `${posX}px`;
        cluster.style.top = `${posY}px`;

        const dots = [];

        // Maximum dots in any phase is 8
        for (let i = 0; i < 8; i++) {

          const dot = document.createElement('span');

          dot.className = 'hero__dot';

          cluster.appendChild(dot);
          dots.push(dot);
        }

        dotGrid.appendChild(cluster);

        clusters.push({
          element: cluster,
          dots,
          row,
          col
        });
      }
    }
  }


  // =========================================================
  // UPDATE PHASES WITH CURRENT SPACING
  // =========================================================

  function updatePhasesWithSpacing(spacing) {
    // Rebuild DOT_PHASES with current spacing
    const newPhases = [

      // PHASE 0 — Single dot
      [
        [0, 0]
      ],

      // PHASE 1 — 4 dots forming a square
      [
        [-spacing, -spacing],
        [spacing, -spacing],
        [-spacing, spacing],
        [spacing, spacing]
      ],

      // PHASE 2 — Rotated square / diamond
      [
        [0, -spacing * 1.1],
        [-spacing * 1.1, 0],
        [spacing * 1.1, 0],
        [0, spacing * 1.1]
      ],

      // PHASE 3 — Diamond + center dot
      [
        [0, -spacing * 1.4],
        [-spacing * 1.4, 0],
        [0, 0],
        [spacing * 1.4, 0],
        [0, spacing * 1.4]
      ],

      // PHASE 4 — 8-dot 4×2 rectangle rotated +45°
      [
        [-spacing * 1.5, spacing * 0.5],
        [-spacing * 0.5, spacing * 0.5],
        [spacing * 0.5, spacing * 0.5],
        [spacing * 1.5, spacing * 0.5],

        [-spacing * 1.5, -spacing * 0.5],
        [-spacing * 0.5, -spacing * 0.5],
        [spacing * 0.5, -spacing * 0.5],
        [spacing * 1.5, -spacing * 0.5]
      ].map(([x, y]) => {

        const angle = -Math.PI / 4;

        return [
          x * Math.cos(angle) - y * Math.sin(angle),
          x * Math.sin(angle) + y * Math.cos(angle)
        ];

      }),

      // PHASE 5 — Reduced 4-dot version of Phase 4
      [
        [-spacing * 0.5, spacing * 0.5],
        [spacing * 0.5, spacing * 0.5],

        [-spacing * 0.5, -spacing * 0.5],
        [spacing * 0.5, -spacing * 0.5]
      ].map(([x, y]) => {

        const angle = Math.PI / 4;

        return [
          x * Math.cos(angle) - y * Math.sin(angle),
          x * Math.sin(angle) + y * Math.cos(angle)
        ];

      }),

      // PHASE 6 — 3 dots
      [
        [-spacing * 1.2, 0],
        [0, 0],
        [spacing * 1.2, 0]
      ].map(([x, y]) => {

        const angle = -Math.PI / 4;

        return [
          x * Math.cos(angle) - y * Math.sin(angle),
          x * Math.sin(angle) + y * Math.cos(angle)
        ];

      }),

    ];

    // Replace the global DOT_PHASES
    DOT_PHASES.length = 0;
    DOT_PHASES.push(...newPhases);
  }


  // =========================================================
  // APPLY A DOT PHASE
  // =========================================================

  function applyPhase(phaseIndex, instant = false) {

    const phase =
      DOT_PHASES[
      Math.max(
        0,
        Math.min(
          phaseIndex,
          DOT_PHASES.length - 1
        )
      )
      ];

    clusters.forEach(cluster => {

      cluster.dots.forEach((dot, index) => {

        const point = phase[index];

        if (point) {

          const x = point[0];
          const y = point[1];

          if (instant) {
            dot.style.transition = 'none';
          } else {
            dot.style.transition = '';
          }

          dot.style.transform =
            `translate3d(${x}px, ${y}px, 0)`;

          dot.style.opacity = '1';

        } else {

          if (instant) {
            dot.style.transition = 'none';
          } else {
            dot.style.transition = '';
          }

          dot.style.transform =
            'translate3d(0, 0, 0)';

          dot.style.opacity = '0';
        }

      });

    });
  }


  // =========================================================
  // INITIALIZE DOT GRID
  // =========================================================

  buildGrid();

  // Start with phase 0 (single dot)
  applyPhase(0, true);

  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      dotGrid.classList.add('is-morphing');

    });

  });


  // =========================================================
  // MORPH TO NEXT DOT PHASE
  // =========================================================

  let dotPhase = 0;

  function morphDots() {

    dotPhase++;

    if (dotPhase >= DOT_PHASES.length) {
      dotPhase = 0;
    }

    applyPhase(dotPhase);
  }


  // =========================================================
  // KEEP GRID RESPONSIVE
  // =========================================================

  let resizeTimer = null;

  window.addEventListener('resize', () => {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {

      // Rebuild grid with new responsive config
      buildGrid();

      applyPhase(dotPhase, true);

      dotGrid.classList.add('is-morphing');

    }, 150);

  });


  // =========================================================
  // IMAGE FRAME - Responsive sizes and positions
  // =========================================================

  function applySlot(slot) {
    frame.style.top = slot.top || '';
    frame.style.bottom = slot.bottom || '';
    frame.style.left = slot.left || '';
    frame.style.right = slot.right || '';

    frame.style.transform =
      `${slot.transformX ? 'translateX(-50%)' : ''} ${slot.transformY ? 'translateY(-50%)' : ''}`.trim();
  }
  function applySlot2(slot) {
    frame2.style.top = slot.top || '';
    frame2.style.bottom = slot.bottom || '';
    frame2.style.left = slot.left || '';
    frame2.style.right = slot.right || '';

    frame2.style.transform =
      `${slot.transformX ? 'translateX(-50%)' : ''} ${slot.transformY ? 'translateY(-50%)' : ''}`.trim();
  }

  // =========================================================
  // PROGRESSIVE PRELOADING
  // =========================================================

  function preloadNextImage(currentIndex) {

    const nextIndex = (currentIndex + 1) % items.length;
    const nextItem = items[nextIndex];

    if (!nextItem) return;

    // Primary image for the next slide.
    preloadImage(nextItem.image);

    // Secondary image is only needed for the final
    // Social Content slide.
    if (
      nextIndex === items.length - 1 &&
      nextItem.image2
    ) {
      preloadImage(nextItem.image2);
    }
  }


  // =========================================================
  // HERO CYCLE
  // =========================================================

  let index = 0;
  let timer = null;


  function showCycle(i) {

    const item = items[i];

    // -------------------------------------------------------
    // PRELOAD NEXT SLIDE IMMEDIATELY
    // -------------------------------------------------------
    //
    // This gives the browser the entire CYCLE_MS window
    // to download/decode the next image.
    //
    preloadNextImage(i);


    // -------------------------------------------------------
    // RESPONSIVE FRAME CONFIG
    // -------------------------------------------------------

    const FRAME_SIZES = getFrameSizes();
    const POSITION_SLOTS = getPositionSlots();

    const size = FRAME_SIZES[i % FRAME_SIZES.length];


    // -------------------------------------------------------
    // TEXT
    // -------------------------------------------------------

    wordInner.classList.remove(
      'is-revealing',
      'is-leaving'
    );

    wordInner.textContent = item.text;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wordInner.classList.add('is-revealing');
      });
    });


    // -------------------------------------------------------
    // DOT GRID
    // -------------------------------------------------------

    morphDots();


    // -------------------------------------------------------
    // PRIMARY IMAGE
    // -------------------------------------------------------

    // -------------------------------------------------------
    // IMAGE
    // -------------------------------------------------------

    frame.classList.remove('is-active');

    // Force removal of the previous active state
    void frame.offsetWidth;

    frame.style.width = `${size.w}px`;
    frame.style.height = `${size.h}px`;

    applySlot(
      POSITION_SLOTS[
      i % POSITION_SLOTS.length
      ]
    );

    // Force the new position/size to commit BEFORE
    // the zoom-out animation starts.
    void frame.offsetWidth;

    revealFrameImage(
      frameImg,
      frame,
      item.image,
      item.text
    );


    // -------------------------------------------------------
    // SECONDARY IMAGE
    // -------------------------------------------------------

    if (frame2 && frameImg2) {

      const isLastItem =
        i === items.length - 1 &&
        item.image2;

      if (isLastItem) {

        const secSize = getSecondaryFrameSize();
        const secPos = getSecondaryPosition();

        frame2.classList.remove('is-active');

        frame2.style.width = `${secSize.w}px`;
        frame2.style.height = `${secSize.h}px`;

        applySlot2(secPos);

        // Secondary image has already been progressively
        // preloaded when this slide was approaching.
        revealFrameImage(
          frameImg2,
          frame2,
          item.image2,
          item.text + ' secondary'
        );

      } else {

        frame2.classList.remove('is-active');

      }
    }
  }


  // =========================================================
  // NEXT
  // =========================================================

  function next() {

    index =
      (index + 1) % items.length;

    showCycle(index);
  }


  // =========================================================
  // START
  // =========================================================

  function start() {

    // Reset to phase 0 before starting.
    dotPhase = 0;
    applyPhase(0, true);

    showCycle(index);

    timer = setInterval(
      next,
      CYCLE_MS
    );
  }


  // =========================================================
  // PAGE TRANSITION COMPATIBILITY
  // =========================================================
  //
  // Only the FIRST hero image is allowed to block the
  // initial hero start.
  //
  // The remaining images are loaded progressively.
  // =========================================================

 // =========================================================
// INITIAL HERO START
// =========================================================
//
// The transition overlay already covers the viewport.
// We do NOT wait for the transition to finish before
// initializing the hero.
//
// This allows the browser to load + decode the LCP image
// and prepare the hero animation underneath the overlay.
//
// The user still sees nothing until the page transition
// reveals the page.
// =========================================================

const firstImageReady = preloadImage(
  items[0]?.image,
  true
);

firstImageReady.then(() => {
  start();
});
})();