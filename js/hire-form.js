(() => {
  'use strict';

  const form = document.getElementById('hireForm');
  if (!form) return;

  // --------------------------------
  // SUCCESS STATE ELEMENTS
  // --------------------------------

  const successState = form.querySelector('.cform__success');
  const sendAnotherButton = document.getElementById('cf-sendAnother');


  // --------------------------------
  // FLOATING-LABEL STATE
  // --------------------------------

  form
    .querySelectorAll(
      '.cform__field:not(.cform__field--select) .cform__input'
    )
    .forEach(input => {

      const field = input.closest('.cform__field');

      const sync = () => {
        field.classList.toggle(
          'has-value',
          input.value.trim().length > 0
        );
      };

      input.addEventListener('input', sync);
      input.addEventListener('blur', sync);

      sync();


      // Auto-grow textarea
      if (input.tagName === 'TEXTAREA') {

        const grow = () => {
          input.style.height = 'auto';
          input.style.height = input.scrollHeight + 'px';
        };

        input.addEventListener('input', grow);
      }

    });


  // --------------------------------
  // CUSTOM SELECT
  // --------------------------------

  const selectWrap = document.getElementById('cf-typeWrap');
  const selectBtn = document.getElementById('cf-typeBtn');
  const selectValue = document.getElementById('cf-typeValue');
  const selectInput = document.getElementById('cf-typeInput');
  const optionsList = document.getElementById('cf-typeOptions');

  const options = optionsList
    ? [...optionsList.querySelectorAll('li')]
    : [];


  function closeSelect() {

    if (!selectWrap || !selectBtn) return;

    selectWrap.classList.remove('is-open');

    selectBtn.setAttribute(
      'aria-expanded',
      'false'
    );
  }


  function openSelect() {

    if (!selectWrap || !selectBtn) return;

    selectWrap.classList.add('is-open');

    selectBtn.setAttribute(
      'aria-expanded',
      'true'
    );
  }


  if (selectBtn) {

    selectBtn.addEventListener('click', (e) => {

      e.stopPropagation();

      selectWrap.classList.contains('is-open')
        ? closeSelect()
        : openSelect();

    });

  }


  options.forEach(option => {

    option.addEventListener('click', () => {

      options.forEach(o => {
        o.classList.remove('is-active');
      });

      option.classList.add('is-active');

      selectValue.textContent = option.dataset.value;

      selectInput.value = option.dataset.value;

      selectWrap.classList.add('has-value');

      closeSelect();

    });

  });


  document.addEventListener('click', (e) => {

    if (
      selectWrap &&
      !selectWrap.contains(e.target)
    ) {
      closeSelect();
    }

  });


  document.addEventListener('keydown', (e) => {

    if (e.key === 'Escape') {
      closeSelect();
    }

  });


  // --------------------------------
  // FORM SUBMISSION
  // --------------------------------

  form.addEventListener('submit', async (e) => {

    e.preventDefault();


    // --------------------------------
    // NORMAL FORM VALIDATION
    // --------------------------------

    if (!form.checkValidity()) {

      form.reportValidity();

      return;

    }


    // --------------------------------
    // PROJECT TYPE VALIDATION
    // --------------------------------

    if (!selectInput.value.trim()) {

      selectWrap.classList.add('is-error');

      selectBtn.focus();

      setTimeout(() => {

        selectWrap.classList.remove('is-error');

      }, 2000);

      return;

    }


    // --------------------------------
    // SUBMIT BUTTON
    // --------------------------------

    const submitButton =
      form.querySelector('.cform__submit');

    const submitText =
      submitButton?.querySelector('span');


    if (!submitButton || !submitText) {
      console.error(
        'Submit button or submit text element not found.'
      );

      return;
    }


    const originalText = 'Send message';


    // --------------------------------
    // LOADING STATE
    // --------------------------------

    submitButton.disabled = true;

    submitButton.classList.add('is-sending');

    submitText.textContent = 'Sending...';


    // --------------------------------
    // FORM DATA
    // --------------------------------

    const formData = {

      firstName:
        form
          .querySelector('[name="firstName"]')
          ?.value
          .trim() || '',

      lastName:
        form
          .querySelector('[name="lastName"]')
          ?.value
          .trim() || '',

      email:
        form
          .querySelector('[name="email"]')
          ?.value
          .trim() || '',

      company:
        form
          .querySelector('[name="company"]')
          ?.value
          .trim() || '',

      projectType:
        form
          .querySelector('[name="projectType"]')
          ?.value
          .trim() || '',

      detail:
        form
          .querySelector('[name="detail"]')
          ?.value
          .trim() || '',

      // Honeypot spam field
      website:
        form
          .querySelector('[name="website"]')
          ?.value || ''

    };


    // --------------------------------
    // SEND TO API
    // --------------------------------

    try {

      const response = await fetch(
        '/api/contact',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(formData)
        }
      );


      // --------------------------------
      // SAFELY READ RESPONSE
      // --------------------------------

      const responseText =
        await response.text();

      let result = null;


      try {

        result = responseText
          ? JSON.parse(responseText)
          : null;

      } catch {

        result = null;

      }


      // --------------------------------
      // SERVER ERROR
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


      // --------------------------------
      // API FAILURE
      // --------------------------------

      if (!result?.success) {

        throw new Error(
          result?.message ||
          'Unable to send message.'
        );

      }


      // =================================
      // SUCCESS
      // =================================

      submitButton.disabled = false;

      submitButton.classList.remove(
        'is-sending',
        'is-error'
      );


      // --------------------------------
      // RESET FORM DATA
      // --------------------------------

      form.reset();


      // --------------------------------
      // RESET CUSTOM SELECT
      // --------------------------------

      if (selectValue) {
        selectValue.innerHTML = '&nbsp;';
      }

      if (selectInput) {
        selectInput.value = '';
      }

      if (selectWrap) {
        selectWrap.classList.remove(
          'has-value',
          'is-open',
          'is-error'
        );
      }

      options.forEach(option => {
        option.classList.remove('is-active');
      });


      // --------------------------------
      // RESET FLOATING LABELS
      // --------------------------------

      form
        .querySelectorAll('.cform__field')
        .forEach(field => {

          field.classList.remove('has-value');

        });


      // --------------------------------
      // RESET TEXTAREA HEIGHT
      // --------------------------------

      form
        .querySelectorAll('textarea')
        .forEach(textarea => {

          textarea.style.height = '';

        });


      // --------------------------------
      // SHOW SUCCESS SCREEN
      // --------------------------------

      if (successState) {

        form.classList.add('is-submitted');

        successState.setAttribute(
          'aria-hidden',
          'false'
        );

      }


    } catch (error) {


      // =================================
      // ERROR STATE
      // =================================

      console.error(
        'Form submission error:',
        error
      );


      submitButton.disabled = false;

      submitButton.classList.remove(
        'is-sending'
      );

      submitButton.classList.add(
        'is-error'
      );

      submitText.textContent =
        'Failed — Try again';


      // --------------------------------
      // RESTORE BUTTON
      // --------------------------------

      setTimeout(() => {

        submitButton.classList.remove(
          'is-error'
        );

        submitText.textContent =
          originalText;

      }, 2500);

    }

  });


  // =================================
  // SEND ANOTHER MESSAGE
  // =================================

  if (sendAnotherButton) {

    sendAnotherButton.addEventListener(
      'click',
      () => {


        // --------------------------------
        // HIDE SUCCESS SCREEN
        // --------------------------------

        form.classList.remove(
          'is-submitted'
        );


        if (successState) {

          successState.setAttribute(
            'aria-hidden',
            'true'
          );

        }


        // --------------------------------
        // RESET SUCCESS ANIMATION
        // --------------------------------

        if (successState) {

          const circle =
            successState.querySelector(
              '.cform__success-circle'
            );

          const tick =
            successState.querySelector(
              '.cform__success-tick'
            );


          if (circle && tick) {

            circle.style.animation = 'none';

            tick.style.animation = 'none';


            // Force browser reflow
            void circle.offsetWidth;


            // Allow CSS animation to run again
            circle.style.animation = '';

            tick.style.animation = '';

          }

        }


        // --------------------------------
        // RESTORE BUTTON
        // --------------------------------

        const submitButton =
          form.querySelector('.cform__submit');

        const submitText =
          submitButton?.querySelector('span');


        if (submitButton) {

          submitButton.disabled = false;

          submitButton.classList.remove(
            'is-sending',
            'is-error',
            'is-success'
          );

        }


        if (submitText) {

          submitText.textContent =
            'Send message';

        }


        // --------------------------------
        // FOCUS FIRST FIELD
        // --------------------------------

        const firstInput =
          form.querySelector(
            '[name="firstName"]'
          );


        if (firstInput) {

          setTimeout(() => {

            firstInput.focus();

          }, 150);

        }

      }
    );

  }

})();