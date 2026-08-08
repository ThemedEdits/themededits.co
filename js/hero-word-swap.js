(() => {
  'use strict';

  const wrap = document.getElementById('swapWord');
  if (!wrap) return;

  const inner = wrap.querySelector('.swap-word__inner');
  const WORDS = (window.SWAP_WORDS && window.SWAP_WORDS.length)
    ? window.SWAP_WORDS
    : ['website', 'brand', 'identity', 'campaign', 'story'];
  const SWAP_MS = 5000;
  const STAGGER_MS = 100; // delay between each letter's individual animation
  let i = 0;

  function splitToChars(word) {
    return [...word].map(ch => {
      const span = document.createElement('span');
      span.className = 'swap-word__char';
      span.textContent = ch;
      return span;
    });
  }

  function renderWord(word) {
    inner.innerHTML = '';
    splitToChars(word).forEach(el => inner.appendChild(el));
  }

  // returns an array of indices (0..len-1) in the order they should animate
  function getOrder(len, mode) {
    const indices = Array.from({ length: len }, (_, idx) => idx);
    if (mode === 'ltr') return indices;
    if (mode === 'rtl') return indices.reverse();
    // random: shuffle
    for (let a = indices.length - 1; a > 0; a--) {
      const b = Math.floor(Math.random() * (a + 1));
      [indices[a], indices[b]] = [indices[b], indices[a]];
    }
    return indices;
  }

  function pickMode(prevMode) {
    const modes = ['ltr', 'rtl', 'random'];
    const options = modes.filter(m => m !== prevMode);
    return options[Math.floor(Math.random() * options.length)];
  }

  let lastOutMode = null;
  let lastInMode = null;

  function swap() {
    const chars = [...inner.querySelectorAll('.swap-word__char')];
    const outMode = pickMode(lastOutMode);
    lastOutMode = outMode;
    const outOrder = getOrder(chars.length, outMode);

    outOrder.forEach((charIndex, orderPos) => {
      setTimeout(() => {
        chars[charIndex].classList.add('is-out');
      }, orderPos * STAGGER_MS);
    });

    const outTotalMs = outOrder.length * STAGGER_MS + 1000;

    setTimeout(() => {
      i = (i + 1) % WORDS.length;
      renderWord(WORDS[i]);
      const newChars = [...inner.querySelectorAll('.swap-word__char')];
      newChars.forEach(c => c.classList.add('is-in-start'));

      const inMode = pickMode(lastInMode);
      lastInMode = inMode;
      const inOrder = getOrder(newChars.length, inMode);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          inOrder.forEach((charIndex, orderPos) => {
            setTimeout(() => {
              newChars[charIndex].classList.remove('is-in-start');
              newChars[charIndex].classList.add('is-in');
            }, orderPos * STAGGER_MS);
          });
        });
      });
    }, outTotalMs);
  }

  renderWord(WORDS[0]);
  setInterval(swap, SWAP_MS);
})();