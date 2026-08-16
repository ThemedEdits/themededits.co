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

    if (input.tagName === 'TEXTAREA') {
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

  function closeSelect() {
    selectWrap.classList.remove('is-open');
    selectBtn.setAttribute('aria-expanded', 'false');
  }

  function openSelect() {
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // -----------------------------
    // NORMAL FORM VALIDATION
    // -----------------------------

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // -----------------------------
    // PROJECT TYPE VALIDATION
    // -----------------------------

    if (!selectInput.value.trim()) {

      selectWrap.classList.add('is-error');

      selectBtn.focus();

      setTimeout(() => {
        selectWrap.classList.remove('is-error');
      }, 2000);

      return;
    }

    const submitButton = form.querySelector('.cform__submit');
    const submitText = submitButton.querySelector('span');

    const originalText = submitText.textContent;

    submitButton.disabled = true;
    submitText.textContent = 'Sending...';

    // -----------------------------
    // FORM DATA
    // -----------------------------

    const formData = {
      firstName: form.querySelector('[name="firstName"]').value.trim(),

      lastName: form.querySelector('[name="lastName"]').value.trim(),

      email: form.querySelector('[name="email"]').value.trim(),

      company: form.querySelector('[name="company"]').value.trim(),

      projectType: form.querySelector('[name="projectType"]').value.trim(),

      detail: form.querySelector('[name="detail"]').value.trim(),

      website: form.querySelector('[name="website"]')?.value || ''
    };

    try {

      const response = await fetch('/api/contact', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(formData)
      });

      // --------------------------------
      // SAFELY READ SERVER RESPONSE
      // --------------------------------

      const responseText = await response.text();

      let result = null;

      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        result = null;
      }

      // --------------------------------
      // HANDLE SERVER ERROR
      // --------------------------------

      if (!response.ok) {

        console.error(
          'Server error:',
          response.status,
          responseText
        );

        throw new Error(
          result?.message ||
          `Server error (${response.status})`
        );
      }

      if (!result?.success) {

        throw new Error(
          result?.message ||
          'Unable to send message.'
        );
      }

      // --------------------------------
      // SUCCESS
      // --------------------------------

      submitText.textContent = 'Message sent ✓';

      form.reset();

      // Reset custom select
      selectValue.innerHTML = '&nbsp;';
      selectInput.value = '';

      selectWrap.classList.remove('has-value');

      options.forEach(option => {
        option.classList.remove('is-active');
      });

      // Reset floating labels
      form.querySelectorAll('.cform__field').forEach(field => {
        field.classList.remove('has-value');
      });

      setTimeout(() => {

        submitText.textContent = originalText;

        submitButton.disabled = false;

      }, 2500);

    } catch (error) {

      console.error('Form submission error:', error);

      submitText.textContent = 'Failed — Try again';

      submitButton.disabled = false;

      setTimeout(() => {

        submitText.textContent = originalText;

      }, 2500);
    }
  });
})();