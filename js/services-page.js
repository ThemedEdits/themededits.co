(() => {
  'use strict';

  // =========================================================
  // SERVICES PAGE TABS
  // =========================================================

  const tabs = [...document.querySelectorAll('.sp__tab')];
  const panels = [...document.querySelectorAll('.sp__panel')];
  const tabsWrap = document.getElementById('spTabs');
  const pill = document.getElementById('spPill');

  if (!tabs.length || !panels.length) return;


  // =========================================================
  // VALID PANEL IDS
  // =========================================================

  const VALID_IDS = panels
    .map(panel => panel.id)
    .filter(Boolean);


  // =========================================================
  // MOVE ACTIVE PILL
  // =========================================================

  function movePillTo(tab, instant = false) {

    if (!pill || !tabsWrap || !tab) return;

    const wrapRect = tabsWrap.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();

    if (instant) {
      pill.style.transition = 'none';
    } else {
      pill.style.transition = '';
    }

    pill.style.width = `${tabRect.width}px`;
    pill.style.height = `${tabRect.height}px`;

    pill.style.transform =
      `translate3d(
        ${tabRect.left - wrapRect.left}px,
        ${tabRect.top - wrapRect.top}px,
        0
      )`;

    if (instant) {
      requestAnimationFrame(() => {
        pill.style.transition = '';
      });
    }
  }


  // =========================================================
  // INITIALIZE SPLIT-HOVER TEXT
  // =========================================================

  function initSplitHover(panel) {

    if (!panel || !window.__splitHoverInit) return;

    panel
      .querySelectorAll('[data-split-hover]')
      .forEach(element => {

        if (!element.querySelector('.ch')) {
          window.__splitHoverInit(element);
        }

      });
  }


  // =========================================================
  // ACTIVATE SERVICE PANEL
  // =========================================================

  function activate(id, updateHash = true) {

    if (!VALID_IDS.includes(id)) {
      id = VALID_IDS[0];
    }

    let activeTab = null;
    let activePanel = null;


    // -------------------------------------------------------
    // Tabs
    // -------------------------------------------------------

    tabs.forEach(tab => {

      const isActive =
        tab.dataset.target === id;

      tab.classList.toggle(
        'is-active',
        isActive
      );

      if (isActive) {
        activeTab = tab;
      }

    });


    // -------------------------------------------------------
    // Panels
    // -------------------------------------------------------

    panels.forEach(panel => {

      const isActive =
        panel.id === id;

      panel.classList.toggle(
        'is-active',
        isActive
      );

      if (isActive) {
        activePanel = panel;
      }

    });


    // -------------------------------------------------------
    // Move pill
    // -------------------------------------------------------

    movePillTo(activeTab);


    // -------------------------------------------------------
    // Initialize newly visible text
    // -------------------------------------------------------

    initSplitHover(activePanel);


    // -------------------------------------------------------
    // Update URL
    // -------------------------------------------------------

    if (updateHash) {

      const newHash = `#${id}`;

      if (window.location.hash !== newHash) {
        history.replaceState(
          null,
          '',
          newHash
        );
      }

    }

  }


  // =========================================================
  // TAB CLICK
  // =========================================================

  tabs.forEach(tab => {

    tab.addEventListener('click', () => {

      const target = tab.dataset.target;

      if (!target) return;

      activate(target);

    });

  });


  // =========================================================
  // BROWSER HASH NAVIGATION
  // =========================================================

  window.addEventListener('hashchange', () => {

    const id =
      window.location.hash
        .replace(/^#/, '')
        .trim();

    if (id) {
      activate(id, false);
    }

  });


  // =========================================================
  // RESPONSIVE PILL POSITION
  // =========================================================

  let resizeTimer = null;

  window.addEventListener('resize', () => {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {

      const activeTab =
        tabs.find(tab =>
          tab.classList.contains('is-active')
        );

      movePillTo(activeTab, true);

    }, 100);

  });


  // =========================================================
  // INITIAL STATE
  // =========================================================

  const hashId =
    window.location.hash
      .replace(/^#/, '')
      .trim();

  const initialId =
    VALID_IDS.includes(hashId)
      ? hashId
      : VALID_IDS[0];


  // Wait for layout + fonts before measuring pill.
  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      activate(
        initialId,
        false
      );

    });

  });

})();