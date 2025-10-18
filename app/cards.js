/* cards.js */

(function () {
  'use strict';

  /**
   * cards.js
   * Renders petition cards from a data array and initializes per-card carousels/bubbles.
   * Drops no inline JS into main.html — just include <script src="cards.js"></script>.
   *
   * It expects main.html to contain:
   *  - <template id="petition-template"> ... </template>
   *  - <div id="petitions-list"></div>
   *
   * Hooks:
   *  - If window.PETITIONS_DATA is present (array) it will be used as the source.
   *  - Otherwise a small sample dataset is used.
   *  - After rendering it will call initCarouselById(trackId) and setupBubble(bubbleEl, desc)
   *    if those functions exist in the global scope (so your existing main.js carousel/bubble code works).
   */

  function renderPetitions(list) {
    const out = document.getElementById('petitions-list');
    const tpl = document.getElementById('petition-template');
    if (!out || !tpl) {
      console.warn('cards.js: #petitions-list or #petition-template not found.');
      return;
    }

    out.innerHTML = '';

    list.forEach((item, idx) => {
      const clone = tpl.content.cloneNode(true);
      // prefer .petition-card element inside template, otherwise first child
      const card = clone.querySelector('.petition-card') || clone.firstElementChild;
      if (!card) return;

      // Title & date
      const titleEl = card.querySelector('.petition-title');
      if (titleEl) titleEl.textContent = item.title || '';
      const dateEl = card.querySelector('.petition-date');
      if (dateEl) dateEl.textContent = item.date || '';

      // Carousel area
      const track = card.querySelector('.carousel-track');
      const indicators = card.querySelector('.carousel-indicators');
      const trackId = 'petitionTrack_' + Date.now().toString(36) + '_' + idx;
      if (track) track.id = trackId;

      const images = Array.isArray(item.images) ? item.images : [];
      images.forEach((imgObj, sIdx) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.setAttribute('data-description', imgObj.desc || '');

        const img = document.createElement('img');
        img.src = imgObj.src || '';
        img.alt = imgObj.alt || '';
        slide.appendChild(img);

        if (track) track.appendChild(slide);

        if (indicators) {
          const dot = document.createElement('span');
          dot.className = 'dot';
          if (sIdx === 0) dot.classList.add('active');
          indicators.appendChild(dot);
        }
      });

      // Bubble initial description — also ensure bubble has a stable id so main.js can find it later
      const bubble = card.querySelector('.bubble');
      if (bubble) {
        // unique but predictable id: petitionBubble_<idx>_<shorttimestamp>
        const timeKey = Date.now().toString(36);
        bubble.id = 'petitionBubble_' + idx + '_' + timeKey;
        bubble.dataset._initialDesc = (images[0] && images[0].desc) || '';
      }

      // Progress
      const fill = card.querySelector('.progress-fill.pro');
      const text = card.querySelector('.petition-progress-text');
      const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));
      if (fill) fill.style.width = progress + '%';
      if (text) text.textContent = progress + '%';

      // Append to DOM
      out.appendChild(clone);

      // Initialize carousel & bubble after layout.
      // Instead of polling, register this track+bubble to a shared pending list.
      // main.js will process the pending list once after it defines initCarouselById/setupBubble.
      requestAnimationFrame(() => {
        // register in the shared pending list so main.js can initialize it
        window.__cards_pending = window.__cards_pending || [];
        window.__cards_pending.push({
          trackId: track.id,
          bubbleId: bubble ? bubble.id : null
        });

        // Preferred: if main.js provided a processor, call it (one short call, no loops).
        if (typeof window.processCardsPending === 'function') {
          try {
            window.processCardsPending();
          } catch (err) {
            // ignore — main.js will process pending on init or next opportunity
          }
          return;
        }

        // Fallback: if an initializer exists globally (rare in your setup), try immediate init.
        if (typeof initCarouselById === 'function') {
          try {
            initCarouselById(track.id);
            if (bubble && typeof setupBubble === 'function') {
              setupBubble(bubble, bubble.dataset._initialDesc || '');
            }
            // remove the last pushed item since we initialized it
            window.__cards_pending.pop();
          } catch (err) {
            // leave for main.js
          }
        }
      });
    });
  }

  function initPetitionCards() {
    const data = Array.isArray(window.PETITIONS_DATA)
      ? window.PETITIONS_DATA
      : [
          // shallow sample — replace by setting window.PETITIONS_DATA before including cards.js
          {
            title: 'נושא הדוגמה — עצומה 1',
            date: '15.06.2021',
            images: [
              { src: 'https://picsum.photos/seed/pet1/800/420', desc: '<strong>תיאור 1</strong><br>טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה טקסט לדוגמה ' },
              { src: 'https://picsum.photos/seed/pet2/800/420', desc: '<strong>תיאור 2</strong><br>עוד טקסט' }
            ],
            progress: 0
          },
          {
            title: 'נושא הדוגמה — עצומה 2',
            date: '20.07.2021',
            images: [
              { src: 'https://picsum.photos/seed/refA/800/420', desc: '<strong>הצגה</strong><br>תיאור המשאל.<br>תיאור המשאל.' },
			  { src: 'https://picsum.photos/seed/refA/800/420', desc: '<strong>הצגה</strong><br>תיאור המשאל.<br>תיאור המשאל.<br>תיאור המשאל.' }
            ],
            progress: 0
          }
        ];

    renderPetitions(data);

    // expose for debugging / future dynamic updates
    window.renderPetitions = renderPetitions;
    window._petitionsData = data;
  }

  /***** REFERENDUMS: same template approach as petitions (no changes to petitions code) *****/

  function renderReferendums(list) {
    const out = document.getElementById('referendums-list');
    const tpl = document.getElementById('referendum-template');
    if (!out || !tpl) {
      // nothing to render
      return;
    }

    out.innerHTML = '';

    list.forEach((item, idx) => {
      const clone = tpl.content.cloneNode(true);
      const card = clone.querySelector('.referendum-card') || clone.firstElementChild;
      if (!card) return;

      // title & date
      const titleEl = card.querySelector('.petition-title');
      if (titleEl) titleEl.textContent = item.title || '';
      const dateEl = card.querySelector('.petition-date');
      if (dateEl) dateEl.textContent = item.date || '';

      // carousel area
      const track = card.querySelector('.carousel-track');
      const indicators = card.querySelector('.carousel-indicators');
      const trackId = 'referendumTrack_' + Date.now().toString(36) + '_' + idx;
      if (track) track.id = trackId;

      const images = Array.isArray(item.images) ? item.images : [];
      images.forEach((imgObj, sIdx) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.setAttribute('data-description', imgObj.desc || '');

        const img = document.createElement('img');
        img.src = imgObj.src || '';
        img.alt = imgObj.alt || '';
        slide.appendChild(img);

        if (track) track.appendChild(slide);

        if (indicators) {
          const dot = document.createElement('span');
          dot.className = 'dot';
          if (sIdx === 0) dot.classList.add('active');
          indicators.appendChild(dot);
        }
      });

      // bubble id + initial desc (matches petitions approach)
      const bubble = card.querySelector('.bubble');
      if (bubble) {
        const timeKey = Date.now().toString(36);
        bubble.id = 'referendumBubble_' + idx + '_' + timeKey;
        bubble.dataset._initialDesc = (images[0] && images[0].desc) || '';
      }

      // progress initial values (per-card)
      const proFill = card.querySelector('.progress-fill.pro');
      const conFill = card.querySelector('.progress-fill.con');
      const proText = card.querySelector('.referendum-pro-text');
      const conText = card.querySelector('.referendum-con-text');
      const pro = Math.max(0, Math.min(100, Number(item.pro || 0)));
      const con = Math.max(0, Math.min(100, Number(item.con || 0)));
      if (proFill) proFill.style.width = pro + '%';
      if (conFill) conFill.style.width = con + '%';
      if (proText) proText.textContent = pro + '%';
      if (conText) conText.textContent = con + '%';

      // store votes counts (optional fields)
      card.dataset.proVotes = item.proVotes || 0;
      card.dataset.conVotes = item.conVotes || 0;

      // append and register for initialization (same pattern as petitions)
      out.appendChild(clone);

      requestAnimationFrame(() => {
        // register in the shared pending list so main.js can initialize it
        window.__cards_pending = window.__cards_pending || [];
        window.__cards_pending.push({
          trackId: track.id,
          bubbleId: bubble ? bubble.id : null
        });

        // Preferred: if main.js provided a processor, call it (one short call, no loops).
        if (typeof window.processCardsPending === 'function') {
          try {
            window.processCardsPending();
          } catch (err) {
            // ignore — main.js will process pending on init or next opportunity
          }
          return;
        }

        // Fallback: if an initializer exists globally (rare in your setup), try immediate init.
        if (typeof initCarouselById === 'function') {
          try {
            initCarouselById(track.id);
            if (bubble && typeof setupBubble === 'function') {
              setupBubble(bubble, bubble.dataset._initialDesc || '');
            }
            // remove the last pushed item since we initialized it
            window.__cards_pending.pop();
          } catch (err) {
            // leave for main.js
          }
        }
      });
    });
  }

  function initReferendumCards() {
    const data = Array.isArray(window.REFERENDUMS_DATA)
      ? window.REFERENDUMS_DATA
      : [
          {
            title: 'דוגמה למשאל: האם אתם תומכים?',
            date: '01.01.2025',
            images: [
              { src: 'https://picsum.photos/seed/refA/800/420', desc: '<strong>הצגה</strong><br>תיאור המשאל.<br>תיאור המשאל.' },
			  { src: 'https://picsum.photos/seed/refA/800/420', desc: '<strong>הצגה</strong><br>תיאור המשאל.<br>תיאור המשאל.<br>תיאור המשאל.' }
            ],
            pro: 0,
            con: 0,
            proVotes: 0,
            conVotes: 0
          },
          {
            title: 'משאל לדוגמה 2',
            date: '12.02.2025',
            images: [
              { src: 'https://picsum.photos/seed/refB/800/420', desc: '<strong>הסבר</strong><br>עוד פרטים.' },
			  { src: 'https://picsum.photos/seed/refA/800/420', desc: '<strong>הצגה</strong><br>תיאור המשאל<br>תיאור המשאל<br>תיאור המשאל.' }
            ],
            pro: 0,
            con: 0,
            proVotes: 0,
            conVotes: 0
          }
        ];

    renderReferendums(data);

    // expose for debugging / updates
    window.renderReferendums = renderReferendums;
    window._referendumsData = data;
  }

  /***** SURVEYS: same template approach as petitions/referendums *****/
  function renderSurveys(list) {
    const out = document.getElementById('surveys-list');
    const tpl = document.getElementById('survey-template');
    if (!out || !tpl) {
      console.warn('cards.js: #surveys-list or #survey-template not found.');
      return;
    }

    out.innerHTML = '';

    list.forEach((item, idx) => {
      const clone = tpl.content.cloneNode(true);
      const card = clone.querySelector('.survey-card') || clone.firstElementChild;
      if (!card) return;

      // title & date
      const titleEl = card.querySelector('.petition-title');
      if (titleEl) titleEl.textContent = item.title || '';
      const dateEl = card.querySelector('.petition-date');
      if (dateEl) dateEl.textContent = item.date || '';

      // carousel area (optional images)
      const track = card.querySelector('.carousel-track');
      const indicators = card.querySelector('.carousel-indicators');
      const trackId = 'surveyTrack_' + Date.now().toString(36) + '_' + idx;
      if (track) track.id = trackId;

      const images = Array.isArray(item.images) ? item.images : [];
      images.forEach((imgObj, sIdx) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.setAttribute('data-description', imgObj.desc || '');

        const img = document.createElement('img');
        img.src = imgObj.src || '';
        img.alt = imgObj.alt || '';
        slide.appendChild(img);

        if (track) track.appendChild(slide);

        if (indicators) {
          const dot = document.createElement('span');
          dot.className = 'dot';
          if (sIdx === 0) dot.classList.add('active');
          indicators.appendChild(dot);
        }
      });

      // bubble id + initial desc (match pattern used elsewhere)
      const bubble = card.querySelector('.bubble');
      if (bubble) {
        const timeKey = Date.now().toString(36);
        bubble.id = 'surveyBubble_' + idx + '_' + timeKey;
        bubble.dataset._initialDesc = (images[0] && images[0].desc) || '';
      }

      // Progress container: attach survey id & options metadata for main.js to consume.
      const progressContainer = card.querySelector('.survey-progress');
      const surveyId = item.id || ('srv_' + idx + '_' + Date.now().toString(36));
      if (progressContainer) {
        progressContainer.dataset.surveyId = surveyId;

        // item.options can be an array of strings or array of objects { id, label, count? }.
        // Save an options JSON on the container so main.js can build the labels dynamically.
        try {
          const optionsForAttr = Array.isArray(item.options) ? item.options : [];
          progressContainer.dataset.options = JSON.stringify(optionsForAttr);
        } catch (err) {
          // ignore if cannot stringify
        }
      }

      // Append to DOM
      out.appendChild(clone);

      // Register for carousel + bubble initialization via the shared pending list
      requestAnimationFrame(() => {
        window.__cards_pending = window.__cards_pending || [];
        window.__cards_pending.push({
          trackId: track ? track.id : null,
          bubbleId: bubble ? bubble.id : null
        });

        if (typeof window.processCardsPending === 'function') {
          try { window.processCardsPending(); } catch (err) { /* ignore */ }
          return;
        }

        if (typeof initCarouselById === 'function') {
          try {
            if (track) initCarouselById(track.id);
            if (bubble && typeof setupBubble === 'function') {
              setupBubble(bubble, bubble.dataset._initialDesc || '');
            }
            window.__cards_pending.pop();
          } catch (err) { /* leave for main.js */ }
        }
      });
    });
	  // ensure main.js sets up the survey UI for the newly-inserted DOM
	  if (typeof window.setupSurveyInteractionsAllCards === 'function') {
		try { window.setupSurveyInteractionsAllCards(); } catch (e) { /* ignore */ }
	  }
  }

  function initSurveyCards() {
    const data = Array.isArray(window.SURVEYS_DATA)
      ? window.SURVEYS_DATA
      : [
          // sample survey data — replace in main.html by setting window.SURVEYS_DATA before loading cards.js
          {
            id: 'srv_sample_1',
            title: 'האם להאריך את שעות הפתיחה?',
            date: '01.08.2025',
            options: [
              { id: 'opt1', label: 'כן, באופן קבוע' },
              { id: 'opt2', label: 'כן, אך באופן זמני' },
              { id: 'opt3', label: 'לא, להשאיר כפי שהוא' },
              { id: 'opt4', label: 'לא יודע/ת' }
            ],
            images: [
              { src: 'https://picsum.photos/seed/srv1/800/420', desc: '<strong>רקע</strong><br>הסבר קצר<br>הסבר קצר<br>הסבר קצר<br>הסבר קצר' },
			  { src: 'https://picsum.photos/seed/srv1/800/420', desc: '<strong>רקע</strong><br>הסבר קצר<br>הסבר קצר<br>הסבר קצר' }
            ]
          },
		  {
            id: 'srv_sample_2',
            title: 'האם להאריך את שעות הפתיחה!',
            date: '01.09.2025',
            options: [
              { id: 'opt1', label: 'כן, באופן קבוע' },
              { id: 'opt2', label: 'כן, אך באופן זמני' },
              { id: 'opt3', label: 'לא יודע/ת' }
            ],
            images: [
              { src: 'https://picsum.photos/seed/srv1/800/420', desc: '<strong>רקע</strong><br>הסבר קצר<br>הסבר קצר<br>הסבר קצר' },
			  { src: 'https://picsum.photos/seed/srv1/800/420', desc: '<strong>רקע</strong><br>הסבר קצר<br>הסבר קצר<br>הסבר קצר' }
            ]
          }
        ];

    renderSurveys(data);

    // expose for debugging / updates
    window.renderSurveys = renderSurveys;
    window._surveysData = data;
  }

  /***** IDEAS: same template approach as petitions/referendums/surveys *****/
  function renderIdeas(list) {
    const out = document.getElementById('ideas-list');
    const tpl = document.getElementById('idea-template');
    if (!out || !tpl) {
      console.warn('cards.js: #ideas-list or #idea-template not found.');
      return;
    }

    out.innerHTML = '';

    list.forEach((item, idx) => {
      const clone = tpl.content.cloneNode(true);
      const card = clone.querySelector('.idea-card') || clone.querySelector('.petition-card') || clone.firstElementChild;
      if (!card) return;

      // title & date
      const titleEl = card.querySelector('.petition-title');
      if (titleEl) titleEl.textContent = item.title || '';
      const dateEl = card.querySelector('.petition-date');
      if (dateEl) dateEl.textContent = item.date || '';

      // carousel area (optional images)
      const track = card.querySelector('.carousel-track');
      const indicators = card.querySelector('.carousel-indicators');
      const trackId = 'ideaTrack_' + Date.now().toString(36) + '_' + idx;
      if (track) track.id = trackId;

      const images = Array.isArray(item.images) ? item.images : [];
      images.forEach((imgObj, sIdx) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.setAttribute('data-description', imgObj.desc || '');

        const img = document.createElement('img');
        img.src = imgObj.src || '';
        img.alt = imgObj.alt || '';
        slide.appendChild(img);

        if (track) track.appendChild(slide);

        if (indicators) {
          const dot = document.createElement('span');
          dot.className = 'dot';
          if (sIdx === 0) dot.classList.add('active');
          indicators.appendChild(dot);
        }
      });

      // bubble id + initial desc (match pattern used elsewhere)
      const bubble = card.querySelector('.bubble');
      if (bubble) {
        const timeKey = Date.now().toString(36);
        bubble.id = 'ideaBubble_' + idx + '_' + timeKey;
        bubble.dataset._initialDesc = (images[0] && images[0].desc) || '';
      }

      // Progress container values
      const fill = card.querySelector('.progress-fill.pro');
      const text = card.querySelector('.idea-progress-text');
      const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));
      if (fill) fill.style.width = progress + '%';
      if (text) text.textContent = progress + '%';

      // Append to DOM
      out.appendChild(clone);

      // Register for carousel + bubble initialization via the shared pending list
      requestAnimationFrame(() => {
        window.__cards_pending = window.__cards_pending || [];
        window.__cards_pending.push({
          trackId: track ? track.id : null,
          bubbleId: bubble ? bubble.id : null
        });

        if (typeof window.processCardsPending === 'function') {
          try { window.processCardsPending(); } catch (err) { /* ignore */ }
          return;
        }

        if (typeof initCarouselById === 'function') {
          try {
            if (track) initCarouselById(track.id);
            if (bubble && typeof setupBubble === 'function') {
              setupBubble(bubble, bubble.dataset._initialDesc || '');
            }
            window.__cards_pending.pop();
          } catch (err) { /* leave for main.js */ }
        }
      });
    });
  }

  function initIdeaCards() {
    const data = Array.isArray(window.IDEAS_DATA)
      ? window.IDEAS_DATA
      : [
          {
            title: 'רעיון לדוגמה — 1',
            date: '05.07.2024',
            images: [
              { src: 'https://picsum.photos/seed/idea1/800/420', desc: '<strong>רעיון 1</strong><br>תיאור הרעיון.<br>תיאור הרעיון.<br>תיאור הרעיון.' },
              { src: 'https://picsum.photos/seed/idea2/800/420', desc: '<strong>רעיון 2</strong><br>פרטים נוספים על הרעיון.' }
            ],
            progress: 0
          },
          {
            title: 'רעיון לדוגמה — 2',
            date: '05.07.2024',
            images: [
              { src: 'https://picsum.photos/seed/idea3/800/420', desc: '<strong>רעיון A</strong><br>פרטים נוספים.<br>תיאור הרעיון.<br>תיאור הרעיון.<br>תיאור הרעיון.<br>תיאור הרעיון.' },
			  { src: 'https://picsum.photos/seed/idea3/800/420', desc: '<strong>רעיון A</strong><br>פרטים נוספים.' }
            ],
            progress: 0
          }
        ];

    renderIdeas(data);

    // expose for debugging / updates
    window.renderIdeas = renderIdeas;
    window._ideasData = data;
  }

  // Ensure petitions, referendums, surveys and ideas are initialized on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPetitionCards);
    document.addEventListener('DOMContentLoaded', initReferendumCards);
    document.addEventListener('DOMContentLoaded', initSurveyCards);
    document.addEventListener('DOMContentLoaded', initIdeaCards);
  } else {
    initPetitionCards();
    initReferendumCards();
    initSurveyCards();
    initIdeaCards();
  }
})();
