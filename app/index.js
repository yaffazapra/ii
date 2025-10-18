/* index.js */
(function () {
  'use strict';

  // Global state for verification
  let generatedCode = null;
  let sentToPhone = null;
  let listenersAttached = false; // Flag to prevent duplicate listeners

  function init() {
    try { localStorage.setItem('savedUrl', window.location.href); } catch (e) { /* ignore */ }
    console.log('index.js initialized');

    const screens = document.querySelectorAll('.screen');

    // Exposed functions (for inline onclicks)
    function navigateTo(hash) {
      location.hash = hash;
    }
    window.navigateTo = navigateTo;

    async function validatePhone() {
      const phoneEl = document.getElementById('phoneInput');
      const nextBtn = document.querySelector('#login button[onclick="validatePhone()"]');
      const config = window.APP_CONFIG || {};

      const pattern = /^05[0-9]{8}$/;
      if (!phoneEl) {
        alert(config.MESSAGES?.PHONE_MISSING || 'Phone input missing on page.');
        return;
      }
      if (!pattern.test(phoneEl.value)) {
        alert(config.MESSAGES?.PHONE_INVALID || 'Please enter a valid Israeli phone number (e.g. 0501234567).');
        return;
      }

      // Send real WhatsApp verification code
      const phone = phoneEl.value.trim();
      const internationalPhone = '972' + phone.substring(1);

      // Generate 4-digit code
      generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
      sentToPhone = phone;

      const message = `Your verification code: ${generatedCode}\n\nקוד האימות שלך: ${generatedCode}`;

      // Show loading state
      const originalText = nextBtn ? nextBtn.textContent : '';
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.textContent = config.MESSAGES?.SENDING || 'שולח קוד...';
      }

      try {
        const apiUrl = config.WHATSAPP_API_URL || 'https://interference-mental-ssl-friendship.trycloudflare.com/api/send';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: internationalPhone,
            message: message
          })
        });

        const data = await response.json();

        if (data.success) {
          navigateTo('#confirm');
        } else {
          alert((config.MESSAGES?.SEND_FAILED || 'Failed to send verification code: ') + data.message);
        }
      } catch (error) {
        alert(config.MESSAGES?.SEND_ERROR || 'Error sending verification code. Please try again.');
        console.error('Error:', error);
      } finally {
        // Restore button state
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.textContent = originalText;
        }
      }
    }
    window.validatePhone = validatePhone;

    // Screen rendering
    function renderScreen() {
      try {
        screens.forEach(s => s.classList.remove('active'));
        const stage = (location.hash.replace('#', '') || 'stage1');
        const activeScreen = document.getElementById(stage);
        if (activeScreen) activeScreen.classList.add('active');

        if (stage === 'confirm') {
          setupCodeVerification();
        } else if (stage === 'final') {
          // read redirect URL from <meta name="redirect-url"> in the head
          var meta = document.querySelector('meta[name="redirect-url"]');
          var redirectUrl = meta ? meta.content : null;
          if (redirectUrl) {
            const config = window.APP_CONFIG || {};
            setTimeout(function () {
              location.href = redirectUrl;
            }, config.FINAL_REDIRECT_DELAY || 1000);
          }
        }
      } catch (err) {
        console.error('renderScreen error', err);
      }
    }

    window.addEventListener('hashchange', renderScreen);
    window.addEventListener('load', renderScreen);
    renderScreen(); // initial render (in case hash already set)

    // Carousel setup (guarded)
    const track = document.getElementById('carouselTrack');
    const dots = document.querySelectorAll('.dot');
    let currentIndex = 0;
    let startX = 0;

    function updateCarousel() {
      if (track) track.style.transform = `translateX(-${currentIndex * 100}%)`;
      if (dots) dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    function touchStart(e) {
      startX = e.touches ? e.touches[0].clientX : e.clientX;
    }
    function touchMove(e) {
      if (!startX) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const diff = startX - x;
      if (diff > 50 && currentIndex < dots.length - 1) {
        currentIndex++;
        updateCarousel();
        startX = 0;
      } else if (diff < -50 && currentIndex > 0) {
        currentIndex--;
        updateCarousel();
        startX = 0;
      }
    }
    function touchEnd() { startX = 0; }

    if (track) {
      track.addEventListener('touchstart', touchStart);
      track.addEventListener('mousedown', touchStart);
      track.addEventListener('touchmove', touchMove);
      track.addEventListener('mousemove', e => { if (e.buttons) touchMove(e); });
      track.addEventListener('touchend', touchEnd);
      track.addEventListener('mouseup', touchEnd);
    }

    if (dots) {
      dots.forEach((dot, i) => dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
      }));
    }

    // Setup code verification - only attach listeners once
    function setupCodeVerification() {
      const inputs = document.querySelectorAll('.digit');
      const config = window.APP_CONFIG || {};

      // Clear inputs
      inputs.forEach(input => {
        input.value = '';
        input.classList.remove('fade-in');
        input.removeAttribute('readonly');
        input.setAttribute('type', 'text');
        input.setAttribute('maxlength', '1');
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('pattern', '[0-9]');
        input.style.borderColor = '';
        input.disabled = false;
      });

      // Only attach listeners once
      if (!listenersAttached) {
        listenersAttached = true;

        inputs.forEach((input, index) => {
          // Handle paste - fill all 4 boxes
          input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');

            if (pastedData.length === 4) {
              inputs.forEach((inp, i) => {
                inp.value = pastedData[i] || '';
              });
              inputs[3].focus();
              verifyEnteredCode();
            }
          });

          // Auto-advance to next input
          input.addEventListener('input', function() {
            const value = this.value.replace(/[^0-9]/g, '');
            this.value = value;

            if (value && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }

            // Check if all 4 digits are filled
            const allFilled = Array.from(inputs).every(inp => inp.value.length === 1);
            if (allFilled) {
              verifyEnteredCode();
            }
          });

          // Handle backspace
          input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
              inputs[index - 1].focus();
            }
          });
        });
      }

      // Auto-focus first input
      setTimeout(() => {
        if (inputs[0]) inputs[0].focus();
      }, config.INPUT_FOCUS_DELAY || 100);
    }

    // Verify the code entered by user
    function verifyEnteredCode() {
      const inputs = document.querySelectorAll('.digit');
      const enteredCode = Array.from(inputs).map(inp => inp.value).join('');
      const config = window.APP_CONFIG || {};

      if (enteredCode.length === 4) {
        if (enteredCode === generatedCode) {
          // Code is correct - show green and auto-proceed
          inputs.forEach(input => {
            input.classList.add('fade-in');
            input.style.borderColor = '#25D366';
            input.disabled = true;
          });

          // Automatically proceed to next stage after brief delay
          setTimeout(() => {
            navigateTo('#final');
          }, config.AUTO_PROCEED_DELAY || 500);
        } else {
          // Code is incorrect
          inputs.forEach(input => {
            input.style.borderColor = '#f44336';
            input.value = '';
          });
          setTimeout(() => {
            inputs.forEach(input => input.style.borderColor = '');
            inputs[0].focus();
          }, config.ERROR_FLASH_DURATION || 500);
          alert(config.MESSAGES?.CODE_INCORRECT || 'קוד שגוי. אנא נסה שוב.\nIncorrect code. Please try again.');
        }
      }
    }

    updateCarousel();
  } // end init()

  // Run init after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
