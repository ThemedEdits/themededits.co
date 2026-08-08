(() => {
  'use strict';

  const form = document.getElementById('hireForm');
  if (!form) return;

  // floating-label state for text/email/textarea fields
  form.querySelectorAll('.cform__field:not(.cform__field--select) .cform__input').forEach(input => {
    const field = input.closest('.cform__field');

    const sync = () => field.classList.toggle('has-value', input.value.trim().length > 0);
    input.addEventListener('input', sync);
    input.addEventListener('blur', sync);
    sync();

    if (input.tagName === 'TEXTAREA'){
      const grow = () => {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
      };
      input.addEventListener('input', grow);
    }
  });

  // custom select
  const selectWrap = document.getElementById('cf-typeWrap');
  const selectBtn = document.getElementById('cf-typeBtn');
  const selectValue = document.getElementById('cf-typeValue');
  const selectInput = document.getElementById('cf-typeInput');
  const optionsList = document.getElementById('cf-typeOptions');
  const options = [...optionsList.querySelectorAll('li')];

  function closeSelect(){
    selectWrap.classList.remove('is-open');
    selectBtn.setAttribute('aria-expanded', 'false');
  }

  function openSelect(){
    selectWrap.classList.add('is-open');
    selectBtn.setAttribute('aria-expanded', 'true');
  }

  selectBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectWrap.classList.contains('is-open') ? closeSelect() : openSelect();
  });

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('is-active'));
      opt.classList.add('is-active');
      selectValue.textContent = opt.dataset.value;
      selectInput.value = opt.dataset.value;
      selectWrap.classList.add('has-value');
      closeSelect();
    });
  });

  document.addEventListener('click', (e) => {
    if (!selectWrap.contains(e.target)) closeSelect();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSelect();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // wire up to your actual submission endpoint here
  });
})();