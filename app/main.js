/* main.js */

(function () {
  'use strict';

  function init() {

    // toggle sidebar (original)
    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('active');
    }
    window.toggleSidebar = toggleSidebar;

    // show section (original)
    function showSection(el) {
      // toggle bar
      document.querySelectorAll('.toggle-item').forEach(item => item.classList.remove('active'));
      el.classList.add('active');

      // content area
      const sectionId = el.dataset.section;
      document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
      document.getElementById(sectionId).classList.add('active');

      // also update hash to keep router in sync
      location.hash = sectionId;
    }
    window.showSection = showSection;

	// --- Petition Sign (per-card) ---
	function signPetition(btn) {
	  // btn is the clicked button (passed from onclick)
	  const card = btn && btn.closest && btn.closest('.petition-card');
	  if (!card) return;
	  const progressEl = card.querySelector('.progress-fill.pro');
	  // find per-card progress text by class (works for template and static)
	  const progressTextEl = card.querySelector('.petition-progress-text');
	  // read current percent from width style (fallback 0)
	  let current = 0;
	  if (progressEl && progressEl.style && progressEl.style.width) {
		current = parseInt(progressEl.style.width, 10) || 0;
	  }
	  if (current < 100) {
		current = Math.min(100, current + 10);
		if (progressEl) progressEl.style.width = current + '%';
		if (progressTextEl) progressTextEl.innerText = current + '%';
	  }
	}
	window.signPetition = signPetition;

	// --- Referendum Vote (per-card, stores counts on the card) ---
	function voteReferendum(btn, type) {
	  // btn is the clicked button (passed from onclick); type is "pro" or "con"
	  const card = btn && btn.closest && btn.closest('.referendum-card');
	  if (!card) return;

	  // read stored counts from data attributes (fallback 0)
	  let pro = parseInt(card.dataset.proVotes || '0', 10) || 0;
	  let con = parseInt(card.dataset.conVotes || '0', 10) || 0;

	  if (type === 'pro') pro++;
	  else con++;

	  const total = pro + con;
	  const proPercent = total ? Math.round((pro / total) * 100) : 0;
	  const conPercent = total ? 100 - proPercent : 0;

	  const proEl = card.querySelector('.progress-fill.pro');
	  const conEl = card.querySelector('.progress-fill.con');
	  const proTextEl = card.querySelector('.referendum-pro-text');
	  const conTextEl = card.querySelector('.referendum-con-text');

	  if (proEl) proEl.style.width = proPercent + '%';
	  if (conEl) conEl.style.width = conPercent + '%';
	  if (proTextEl) proTextEl.innerText = proPercent + '%';
	  if (conTextEl) conTextEl.innerText = conPercent + '%';

	  // persist counts back onto the card
	  card.dataset.proVotes = pro;
	  card.dataset.conVotes = con;
	}
	window.voteReferendum = voteReferendum;

    // --- Share popup (original) ---
    function toggleShare(btn) {
      const popup = btn.parentElement.querySelector('.share-popup');
      // close other popups
      document.querySelectorAll('.share-popup').forEach(p => { if (p !== popup) p.style.display = 'none'; });
      popup.style.display = (popup.style.display === 'block' || popup.style.display === 'flex') ? 'none' : 'block';
    }
    window.toggleShare = toggleShare;

    function shareTo(platform) {
      const url = location.href;
      const text = document.title + ' - ' + url;

      if (platform === 'whatsapp') {
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
      } else if (platform === 'facebook') {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
      } else if (platform === 'instagram') {
        // No direct web share to IG; copy link to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            alert('הקישור הועתק. הדביקו באינסטגרם.');
          });
        } else {
          prompt('העתיקו את הקישור:', url);
        }
      }
    }
    window.shareTo = shareTo;

/* --- ADD: quick-create (+) popup (new) --- */
    function toggleAddMenu(btn) {
      // btn -> the + button inside .add-wrap
      const wrap = btn && btn.closest && btn.closest('.add-wrap');
      if (!wrap) return;
      const popup = wrap.querySelector('.add-popup');

      // close other add-popups
      document.querySelectorAll('.add-popup').forEach(p => { if (p !== popup) p.style.display = 'none'; });

      // toggle this popup
      const willOpen = !(popup.style.display === 'block' || popup.style.display === 'flex');
      popup.style.display = willOpen ? 'block' : 'none';

      // update aria-expanded on button
      try { btn.setAttribute('aria-expanded', String(willOpen)); } catch (e) {}
    }
    window.toggleAddMenu = toggleAddMenu;

	function navigateNew(type) {
	  // close add popups visually
	  document.querySelectorAll('.add-popup').forEach(p => p.style.display = 'none');
	  document.querySelectorAll('.add-btn').forEach(b => { try { b.setAttribute('aria-expanded','false'); } catch(e){} });

	  const mapping = {
		// for petition, navigate to the add-petition form (new)
		petition: 'add-petition',
		// map referendum to the dedicated add form we added
		referendum: 'add-referendum',
		// map survey to the dedicated add-survey form (new)
		survey: 'add-survey',
		// open add-idea form (mimic petition UX)
		idea: 'add-idea'
	  };
	  const section = mapping[type] || 'petitions';

	  // route to the chosen section if router exists
	  if (typeof routeTo === 'function') {
		routeTo('#' + section);
	  } else {
		location.hash = section;
	  }

	  // If we navigated to add-petition, clear the form and set focus
	  if (section === 'add-petition') {
		try {
		  const f = document.getElementById('add-petition-form');
		  if (f) {
			f.reset();
			const preview = document.getElementById('new-petition-images-preview');
			if (preview) preview.innerHTML = '';
			// small delay to ensure section visible, then focus title
			setTimeout(() => {
			  const t = document.getElementById('new-petition-title');
			  if (t) t.focus();
			}, 50);
		  }
		} catch (e) { /* ignore */ }
	  }

	  // If we navigated to add-referendum, clear that form and focus title
	  if (section === 'add-referendum') {
		try {
		  const f = document.getElementById('add-referendum-form');
		  if (f) {
			f.reset();
			const preview = document.getElementById('reimages-list');
			if (preview) preview.innerHTML = '';
			setTimeout(() => {
			  const t = document.getElementById('new-referendum-title');
			  if (t) t.focus();
			}, 50);
		  }
		} catch (e) { /* ignore */ }
	  }

	  // If we navigated to add-survey, clear that form and focus title
	  if (section === 'add-survey') {
		try {
		  const f = document.getElementById('add-survey-form');
		  if (f) {
			f.reset();
			const preview = document.getElementById('simages-list');
			if (preview) preview.innerHTML = '';
			const opts = document.getElementById('survey-options-list');
			if (opts) {
			  // ensure default three option inputs present after reset (min 3)
			  opts.innerHTML = '';
			  // use addSurveyOption to ensure consistent structure
			  addSurveyOption(opts);
			  addSurveyOption(opts);
			  addSurveyOption(opts);
			}
			setTimeout(() => {
			  const t = document.getElementById('new-survey-title');
			  if (t) t.focus();
			}, 50);
		  }
		} catch (e) { /* ignore */ }
	  }

	  // If we navigated to add-idea, clear that form and focus title (new)
	  if (section === 'add-idea') {
		try {
		  const f = document.getElementById('add-idea-form');
		  if (f) {
			f.reset();
			const preview = document.getElementById('ideaimages-list');
			if (preview) preview.innerHTML = '';
			// small delay to ensure section visible, then focus title
			setTimeout(() => {
			  const t = document.getElementById('new-idea-title');
			  if (t) t.focus();
			}, 50);
		  }
		} catch (e) { /* ignore */ }
	  }
	}
	window.navigateNew = navigateNew;

	/* --- Add Referendum: form submit handler and helpers (mimics petition flow) --- */

	// Cancel the add referendum flow and return to referendums
	function cancelAddReferendum() {
	  if (typeof routeTo === 'function') routeTo('#referendums');
	  else location.hash = 'referendums';
	}
	window.cancelAddReferendum = cancelAddReferendum;


	/* --- Add Survey: functions to mirror petition/referendum UX --- */

	// Cancel add survey and return to surveys list
	function cancelAddSurvey() {
	  if (typeof routeTo === 'function') routeTo('#surveys');
	  else location.hash = 'surveys';
	}
	window.cancelAddSurvey = cancelAddSurvey;

	// Add / remove option helper functions used by the form UI
	function refreshSurveyOptionControls(container) {
	  try {
		if (!container) return;
		// direct child rows (ignore text nodes)
		const rows = Array.from(container.children).filter(n => n && n.nodeType === 1);
		const inputsCount = container.querySelectorAll('.option-input').length;

		// If we've reached the maximum (6), hide all add (+) buttons
		if (inputsCount >= 6) {
		  rows.forEach((row) => {
			const addBtn = row.querySelector('.add-option-btn');
			const remBtn = row.querySelector('.remove-option-btn');
			if (addBtn) addBtn.style.display = 'none';
			if (remBtn) remBtn.style.display = (inputsCount <= 3) ? 'none' : 'inline-block';
		  });
		  return;
		}

		// Otherwise, show + only on the last row and control remove visibility
		rows.forEach((row, idx) => {
		  const addBtn = row.querySelector('.add-option-btn');
		  const remBtn = row.querySelector('.remove-option-btn');

		  // Show the add (+) only on the last row
		  if (addBtn) {
			addBtn.style.display = (idx === rows.length - 1) ? 'inline-block' : 'none';
		  }

		  // Show remove (－) only when there are more than 3 inputs (respect min 3)
		  if (remBtn) {
			remBtn.style.display = (inputsCount <= 3) ? 'none' : 'inline-block';
		  }
		});
	  } catch (e) {
		/* ignore */
	  }
	}
	window.refreshSurveyOptionControls = refreshSurveyOptionControls;

	function addSurveyOption(btnOrContainer) {
	  try {
		// Accept either the + button or the container element itself
		const wrap = btnOrContainer && btnOrContainer.closest && btnOrContainer.closest('#survey-options-list');
		const container = (wrap && wrap.closest) ? wrap : document.getElementById('survey-options-list');
		if (!container) return;

		// Enforce maximum number of options (6)
		const existing = Array.from(container.querySelectorAll('.option-input')).length;
		if (existing >= 6) {
		  alert('ניתן להוסיף מקסימום 6 אפשרויות לסקר.');
		  return;
		}

		const row = document.createElement('div');
		row.style.display = 'flex';
		row.style.gap = '8px';
		row.style.alignItems = 'center';

		const input = document.createElement('input');
		input.className = 'option-input';
		input.type = 'text';
		input.placeholder = 'אפשרות נוספת (נדרשת)';
		input.required = true;
		input.maxLength = 15;
		input.style.flex = '1';
		input.style.padding = '8px';
		input.style.borderRadius = '6px';
		input.style.border = '1px solid #ddd';

		// remove button (－) — available on every row (visibility controlled by refresh)
		const rem = document.createElement('button');
		rem.type = 'button';
		rem.className = 'remove-option-btn';
		rem.textContent = '－';
		rem.style.padding = '6px 10px';
		rem.style.borderRadius = '6px';
		rem.style.border = '1px solid #ccc';
		rem.style.background = '#fff';
		rem.style.cursor = 'pointer';
		rem.onclick = function () { removeSurveyOption(rem); };

		// add button (＋) — only shown on last row (refresh will toggle it)
		const addBtn = document.createElement('button');
		addBtn.type = 'button';
		addBtn.className = 'add-option-btn';
		addBtn.textContent = '＋';
		addBtn.style.padding = '6px 10px';
		addBtn.style.borderRadius = '6px';
		addBtn.style.border = '1px solid #ccc';
		addBtn.style.background = '#fff';
		addBtn.style.cursor = 'pointer';
		addBtn.onclick = function () { addSurveyOption(addBtn); };

		// Append elements: input, remove, add
		row.appendChild(input);
		row.appendChild(rem);
		row.appendChild(addBtn);

		container.appendChild(row);

		// After adding, enforce the visibility rules (plus only on last; hide remove if <= 3; hide + if reached 6)
		refreshSurveyOptionControls(container);

		// focus new input for convenience
		try { input.focus(); } catch (e) { /* ignore */ }

	  } catch (e) { /* ignore */ }
	}
	window.addSurveyOption = addSurveyOption;

	function removeSurveyOption(btn) {
	  try {
		const wrap = btn && btn.closest && btn.closest('#survey-options-list');
		const row = btn && btn.closest && btn.closest('div');
		if (!row || !wrap) return;
		// ensure there are at least three option inputs left (min 3)
		const inputs = Array.from(wrap.querySelectorAll('.option-input'));
		if (inputs.length <= 3) {
		  alert('נדרשות לפחות שלוש אפשרויות בסקר.');
		  return;
		}
		row.parentElement && row.parentElement.removeChild(row);

		// After removal, refresh controls so the + moves to the new last row (and reappears if under 6)
		refreshSurveyOptionControls(wrap);
	  } catch (e) { /* ignore */ }
	}
	window.removeSurveyOption = removeSurveyOption;

	// trigger hidden file input for survey images
	window.triggerAddSurveyImage = function triggerAddSurveyImage() {
	  const inp = document.getElementById('new-survey-images');
	  if (!inp) return;
	  try { inp.click(); } catch (e) {}
	};

	// bind survey images preview (mimic petition & referendum image-wrapper creation)
	(function bindSurveyImagesPreview() {
	  const input = document.getElementById('new-survey-images');
	  if (!input) return;
	  input.addEventListener('change', (evt) => {
		const files = Array.from(evt.target.files || []);
		const container = document.getElementById('simages-list');
		if (!container) return;

		files.forEach((file) => {
		  const reader = new FileReader();

		  // wrapper for a single image + its description (same structure as petition/ref)
		  const wrapper = document.createElement('div');
		  wrapper.className = 'image-wrapper';
		  wrapper.style.display = 'flex';
		  wrapper.style.flexDirection = 'column';
		  wrapper.style.gap = '8px';
		  wrapper.style.padding = '8px';
		  wrapper.style.borderRadius = '10px';
		  wrapper.style.background = '#fff';
		  wrapper.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
		  wrapper.style.border = '1px solid #eee';

		  // thumbnail container
		  const thumbOuter = document.createElement('div');
		  thumbOuter.style.width = '100%';
		  thumbOuter.style.height = '160px';
		  thumbOuter.style.overflow = 'hidden';
		  thumbOuter.style.borderRadius = '8px';
		  thumbOuter.style.display = 'flex';
		  thumbOuter.style.alignItems = 'center';
		  thumbOuter.style.justifyContent = 'center';
		  thumbOuter.style.background = '#fafafa';

		  const img = document.createElement('img');
		  img.alt = file.name || '';
		  img.style.maxWidth = '100%';
		  img.style.maxHeight = '100%';
		  img.style.objectFit = 'contain';
		  img.style.display = 'block';

		  // description textarea styled like petition description (first image required)
		  const desc = document.createElement('textarea');
		  desc.className = 'image-desc';
		  desc.placeholder = 'תיאור מלא של התמונה (נדרש רק עבור התמונה הראשונה)';
		  desc.rows = 6;
		  desc.style.resize = 'none';
		  desc.style.width = '100%';
		  desc.style.minHeight = '120px';
		  desc.style.padding = '10px';
		  desc.style.borderRadius = '8px';
		  desc.style.border = '1px solid #ddd';
		  desc.style.fontSize = '0.95rem';
		  desc.style.direction = 'rtl';
		  desc.setAttribute('aria-label', 'תיאור התמונה');

		  // remove button
		  const removeBtn = document.createElement('button');
		  removeBtn.type = 'button';
		  removeBtn.textContent = 'הסר תמונה';
		  removeBtn.style.alignSelf = 'flex-end';
		  removeBtn.style.padding = '6px 10px';
		  removeBtn.style.borderRadius = '8px';
		  removeBtn.style.border = '1px solid #ccc';
		  removeBtn.style.background = '#fff';
		  removeBtn.style.color = '#333';
		  removeBtn.style.cursor = 'pointer';
		  removeBtn.onclick = function () { wrapper.parentElement && wrapper.parentElement.removeChild(wrapper); };

		  // when file is read, resize like other flows and set dataset.src
		  reader.onload = () => {
			try {
			  const tmp = new Image();
			  tmp.onload = () => {
				try {
				  const TARGET_W = 800;
				  const TARGET_H = 420;
				  const canvas = document.createElement('canvas');
				  canvas.width = TARGET_W;
				  canvas.height = TARGET_H;
				  const ctx = canvas.getContext('2d');
				  ctx.fillStyle = '#ffffff';
				  ctx.fillRect(0, 0, TARGET_W, TARGET_H);
				  const sw = tmp.width, sh = tmp.height;
				  if (!sw || !sh) {
					img.src = reader.result || '';
					wrapper.dataset.src = reader.result || '';
					wrapper.dataset.alt = file.name || '';
					return;
				  }
				  const scale = Math.min(TARGET_W / sw, TARGET_H / sh);
				  const dw = Math.round(sw * scale);
				  const dh = Math.round(sh * scale);
				  const dx = Math.round((TARGET_W - dw) / 2);
				  const dy = Math.round((TARGET_H - dh) / 2);
				  ctx.drawImage(tmp, 0, 0, sw, sh, dx, dy, dw, dh);
				  const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
				  img.src = resizedDataUrl;
				  wrapper.dataset.src = resizedDataUrl;
				  wrapper.dataset.alt = file.name || '';
				} catch (innerErr) {
				  img.src = reader.result || '';
				  wrapper.dataset.src = reader.result || '';
				  wrapper.dataset.alt = file.name || '';
				  console.warn('survey image resize failed, using original', innerErr);
				}
			  };
			  tmp.onerror = () => {
				img.src = reader.result || '';
				wrapper.dataset.src = reader.result || '';
				wrapper.dataset.alt = file.name || '';
			  };
			  tmp.src = reader.result;
			} catch (err) {
			  img.src = reader.result || '';
			  wrapper.dataset.src = reader.result || '';
			  wrapper.dataset.alt = file.name || '';
			}
		  };
		  reader.readAsDataURL(file);

		  thumbOuter.appendChild(img);
		  wrapper.appendChild(thumbOuter);
		  wrapper.appendChild(desc);
		  wrapper.appendChild(removeBtn);

		  // append wrapper to simages-list
		  container.appendChild(wrapper);
		});

		// clear input value so same file can be added again if user wants
		input.value = '';
	  });
	})();


	// helper: create and append a single survey card from data (fallback when cards.js renderSurveys isn't present)
	function createSurveyCard(item) {
	  try {
		const out = document.getElementById('surveys-list');
		const tpl = document.getElementById('survey-template');
		if (!out || !tpl) return;

		const clone = tpl.content.cloneNode(true);
		const card = clone.querySelector('.survey-card') || clone.firstElementChild;
		if (!card) return;

		// Title & date
		const titleEl = card.querySelector('.petition-title');
		if (titleEl) titleEl.textContent = item.title || '';
		const dateEl = card.querySelector('.petition-date');
		if (dateEl) dateEl.textContent = item.date || '';

		// Carousel area
		const track = card.querySelector('.carousel-track');
		const indicators = card.querySelector('.carousel-indicators');
		const trackId = 'surveyTrack_new_' + Date.now().toString(36);
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

		// Bubble id + initial desc
		const bubble = card.querySelector('.bubble');
		if (bubble) {
		  const timeKey = Date.now().toString(36);
		  bubble.id = 'surveyBubble_new_' + timeKey;
		  bubble.dataset._initialDesc = (images[0] && images[0].desc) || '';
		}

		// Progress container: attach survey id & options metadata
		const progressContainer = card.querySelector('.survey-progress');
		const surveyId = item.id || ('srv_new_' + Date.now().toString(36));
		if (progressContainer) {
		  progressContainer.dataset.surveyId = surveyId;
		  try {
			const optionsForAttr = Array.isArray(item.options) ? item.options : [];
			progressContainer.dataset.options = JSON.stringify(optionsForAttr);
		  } catch (err) { /* ignore */ }
		}

		// Insert at top
		out.insertBefore(clone, out.firstChild);

		// register for carousel & bubble initialization
		window.__cards_pending = window.__cards_pending || [];
		window.__cards_pending.push({
		  trackId: track ? track.id : null,
		  bubbleId: bubble ? bubble.id : null
		});

		if (typeof window.processCardsPending === 'function') {
		  try { window.processCardsPending(); } catch (e) { /* ignore */ }
		}

		// make sure survey interactions are initialized for the new DOM
		if (typeof window.setupSurveyInteractionsAllCards === 'function') {
		  try { window.setupSurveyInteractionsAllCards(); } catch (e) { /* ignore */ }
		}
	  } catch (err) {
		console.error('createSurveyCard error', err);
	  }
	}
	window.createSurveyCard = createSurveyCard;

	// Cancel the add idea flow and return to ideas list
	function cancelAddIdea() {
	  if (typeof routeTo === 'function') routeTo('#ideas');
	  else location.hash = 'ideas';
	}
	window.cancelAddIdea = cancelAddIdea;

	// submit handler for the add idea form (mimics add-petition)
	async function submitAddIdea(e) {
	  if (e && typeof e.preventDefault === 'function') e.preventDefault();

	  const titleEl = document.getElementById('new-idea-title');
	  const imagesList = Array.from(document.querySelectorAll('#ideaimages-list .image-wrapper'));

	  const title = titleEl ? (titleEl.value || '').trim() : '';

	  // validation: title required
	  if (!title) {
		alert('נדרש להזין כותרת לרעיון.');
		if (titleEl) titleEl.focus();
		return;
	  }

	  // validation: at least one image required
	  if (!imagesList || imagesList.length === 0) {
		alert('נדרש להוסיף תמונה אחת לפחות.');
		const addBtn = document.getElementById('add-idea-image-btn');
		if (addBtn) addBtn.focus();
		return;
	  }

	  // Build images array from the image-wrappers in order.
	  const images = [];
	  let lastNonEmptyDesc = '';

	  for (let i = 0; i < imagesList.length; i++) {
		const w = imagesList[i];
		const src = w && w.dataset && w.dataset.src ? w.dataset.src : '';
		const alt = w && w.dataset && w.dataset.alt ? w.dataset.alt : '';
		const descEl = w ? w.querySelector('.image-desc') : null;
		const rawDesc = descEl ? (descEl.value || '') : ''; // preserve whitespace — do NOT trim here
		let imgDesc = '';

		// First image description is required if any images are present
		if (i === 0 && imagesList.length > 0 && (!rawDesc || rawDesc.trim() === '')) {
		  alert('נדרש להזין תיאור עבור התמונה הראשונה.');
		  if (descEl) descEl.focus();
		  return;
		}

		if (rawDesc && rawDesc.length > 0) {
		  // escape HTML, preserve newlines as <br>
		  imgDesc = escapeHtml(rawDesc).replace(/\r\n/g, '\n').replace(/\n/g, '<br>');
		  lastNonEmptyDesc = imgDesc;
		} else {
		  // if description empty, copy last non-empty description
		  imgDesc = lastNonEmptyDesc || '';
		}

		// Only include images that have a src (should be set by preview)
		if (src) {
		  images.push({ src: src, alt: alt || '', desc: imgDesc });
		}
	  }

	  // create new idea object
	  const newIdea = {
		id: 'idea_' + Date.now().toString(36),
		title: title,
		date: formatToday(),
		images: images,
		progress: 0
	  };

	  // If cards.js renderIdeas is available and shared _ideasData exists, push & re-render
	  try {
		if (Array.isArray(window._ideasData) && typeof window.renderIdeas === 'function') {
		  window._ideasData = window._ideasData || [];
		  window._ideasData.unshift(newIdea);
		  try { window.renderIdeas(window._ideasData); } catch (e) { /* ignore */ }
		} else {
		  // fallback: attempt to call renderIdeas if present
		  if (typeof window.renderIdeas === 'function') {
			try { window.renderIdeas([newIdea].concat(window._ideasData || [])); } catch (e) { /* ignore */ }
		  }
		}
	  } catch (err) {
		console.error('Failed to add new idea:', err);
		if (typeof window.createPetitionCard === 'function') {
		  // fallback: create a petition-like card (best-effort)
		  createPetitionCard({ title: newIdea.title, date: newIdea.date, images: newIdea.images, progress: 0 });
		}
	  }

	  // reset form & navigate to ideas
	  try {
		const f = document.getElementById('add-idea-form');
		if (f) f.reset();

		const list = document.getElementById('ideaimages-list');
		if (list) list.innerHTML = '';
		const hiddenInput = document.getElementById('new-idea-images');
		if (hiddenInput) hiddenInput.value = '';
	  } catch (e) {}

	  if (typeof routeTo === 'function') routeTo('#ideas');
	  else location.hash = 'ideas';
	}
	window.submitAddIdea = submitAddIdea;

	/* --- Image management for Add Idea (mimics petition image flow) --- */
	(function bindIdeaImagesPreviewAndAdd() {
	  // trigger hidden file input when user clicks the add-idea image button
	  window.triggerAddIdeaImage = function triggerAddIdeaImage() {
		const inp = document.getElementById('new-idea-images');
		if (!inp) return;
		try { inp.click(); } catch (e) {}
	  };

	  // remove image wrapper helper (exposed for inline onclick)
	  window.removeIdeaImageWrapper = function removeIdeaImageWrapper(btn) {
		const wrap = btn && btn.closest && btn.closest('.image-wrapper');
		if (wrap && wrap.parentElement) wrap.parentElement.removeChild(wrap);
	  };

	  // when hidden file input changes (user picked file(s)), create image-wrapper entries
	  const inputEl = document.getElementById('new-idea-images');
	  if (!inputEl) return;
	  inputEl.addEventListener('change', (evt) => {
		const input = evt.target;
		if (!input || !input.files) return;
		const files = Array.from(input.files || []);
		const container = document.getElementById('ideaimages-list');
		if (!container) return;

		// for each file create a stacked block: thumbnail + description textarea + remove button
		files.forEach((file) => {
		  const reader = new FileReader();

		  // wrapper for a single image + its description
		  const wrapper = document.createElement('div');
		  wrapper.className = 'image-wrapper';
		  wrapper.style.display = 'flex';
		  wrapper.style.flexDirection = 'column';
		  wrapper.style.gap = '8px';
		  wrapper.style.padding = '8px';
		  wrapper.style.borderRadius = '10px';
		  wrapper.style.background = '#fff';
		  wrapper.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
		  wrapper.style.border = '1px solid #eee';

		  // thumbnail container
		  const thumbOuter = document.createElement('div');
		  thumbOuter.style.width = '100%';
		  thumbOuter.style.height = '160px';
		  thumbOuter.style.overflow = 'hidden';
		  thumbOuter.style.borderRadius = '8px';
		  thumbOuter.style.display = 'flex';
		  thumbOuter.style.alignItems = 'center';
		  thumbOuter.style.justifyContent = 'center';
		  thumbOuter.style.background = '#fafafa';

		  const img = document.createElement('img');
		  img.alt = file.name || '';
		  img.style.maxWidth = '100%';
		  img.style.maxHeight = '100%';
		  img.style.objectFit = 'contain';
		  img.style.display = 'block';

		  // description textarea styled like petition description (first image required)
		  const desc = document.createElement('textarea');
		  desc.className = 'image-desc';
		  desc.placeholder = 'תיאור מלא של התמונה (נדרש רק עבור התמונה הראשונה)';
		  desc.rows = 6;
		  desc.style.resize = 'none';
		  desc.style.width = '100%';
		  desc.style.minHeight = '120px';
		  desc.style.padding = '10px';
		  desc.style.borderRadius = '8px';
		  desc.style.border = '1px solid #ddd';
		  desc.style.fontSize = '0.95rem';
		  desc.style.direction = 'rtl';
		  desc.setAttribute('aria-label', 'תיאור התמונה');

		  // remove button
		  const removeBtn = document.createElement('button');
		  removeBtn.type = 'button';
		  removeBtn.textContent = 'הסר תמונה';
		  removeBtn.style.alignSelf = 'flex-end';
		  removeBtn.style.padding = '6px 10px';
		  removeBtn.style.borderRadius = '8px';
		  removeBtn.style.border = '1px solid #ccc';
		  removeBtn.style.background = '#fff';
		  removeBtn.style.color = '#333';
		  removeBtn.style.cursor = 'pointer';
		  removeBtn.onclick = function () { wrapper.parentElement && wrapper.parentElement.removeChild(wrapper); };

		  // when file is read, set dataset.src and thumbnail
		  reader.onload = () => {
			try {
			  const tmp = new Image();
			  tmp.onload = () => {
				try {
				  const TARGET_W = 800;
				  const TARGET_H = 420;
				  const canvas = document.createElement('canvas');
				  canvas.width = TARGET_W;
				  canvas.height = TARGET_H;
				  const ctx = canvas.getContext('2d');
				  ctx.fillStyle = '#ffffff';
				  ctx.fillRect(0, 0, TARGET_W, TARGET_H);
				  const sw = tmp.width, sh = tmp.height;
				  if (!sw || !sh) {
					img.src = reader.result || '';
					wrapper.dataset.src = reader.result || '';
					wrapper.dataset.alt = file.name || '';
					return;
				  }
				  const scale = Math.min(TARGET_W / sw, TARGET_H / sh);
				  const dw = Math.round(sw * scale);
				  const dh = Math.round(sh * scale);
				  const dx = Math.round((TARGET_W - dw) / 2);
				  const dy = Math.round((TARGET_H - dh) / 2);
				  ctx.drawImage(tmp, 0, 0, sw, sh, dx, dy, dw, dh);
				  const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
				  img.src = resizedDataUrl;
				  wrapper.dataset.src = resizedDataUrl;
				  wrapper.dataset.alt = file.name || '';
				} catch (innerErr) {
				  img.src = reader.result || '';
				  wrapper.dataset.src = reader.result || '';
				  wrapper.dataset.alt = file.name || '';
				  console.warn('idea image resize failed, using original', innerErr);
				}
			  };
			  tmp.onerror = () => {
				img.src = reader.result || '';
				wrapper.dataset.src = reader.result || '';
				wrapper.dataset.alt = file.name || '';
			  };
			  tmp.src = reader.result;
			} catch (err) {
			  img.src = reader.result || '';
			  wrapper.dataset.src = reader.result || '';
			  wrapper.dataset.alt = file.name || '';
			}
		  };
		  reader.readAsDataURL(file);

		  thumbOuter.appendChild(img);
		  wrapper.appendChild(thumbOuter);
		  wrapper.appendChild(desc);
		  wrapper.appendChild(removeBtn);

		  // append wrapper to ideaimages-list
		  container.appendChild(wrapper);
		});

		// clear input value so same file can be added again if user wants
		input.value = '';
	  });
	})();

	// submit handler for the add survey form
	async function submitAddSurvey(e) {
	  if (e && typeof e.preventDefault === 'function') e.preventDefault();

	  const titleEl = document.getElementById('new-survey-title');
	  const imagesList = Array.from(document.querySelectorAll('#simages-list .image-wrapper'));
	  const optionInputs = Array.from(document.querySelectorAll('#survey-options-list .option-input'));

	  const title = titleEl ? (titleEl.value || '').trim() : '';

	  // validation: title required
	  if (!title) {
		alert('נדרש להזין כותרת לסקר.');
		if (titleEl) titleEl.focus();
		return;
	  }

	  // validation: options list (min 3, max 6) and each option max 15 chars
	  const optionsRaw = optionInputs.map(inp => inp ? (inp.value || '') : '');
	  const optionsTrimmed = optionsRaw.map(s => s.trim());
	  const validOptions = optionsTrimmed.map((label, idx) => {
		if (!label) return null;
		return { id: 'opt' + (idx + 1), label: label, count: 0 };
	  }).filter(Boolean);

	  if (!validOptions || validOptions.length < 3) {
		alert('נדרשות לפחות 3 אפשרויות בסקר.');
		const firstOpt = document.querySelector('#survey-options-list .option-input');
		if (firstOpt) firstOpt.focus();
		return;
	  }

	  if (validOptions.length > 6) {
		alert('מקסימום 6 אפשרויות מותרות בסקר.');
		return;
	  }

	  // Enforce per-option length <= 15 (defensive)
	  for (let i = 0; i < optionInputs.length; i++) {
		const inp = optionInputs[i];
		if (!inp) continue;
		const label = (inp.value || '').trim();
		if (!label) continue; // empty options already filtered above
		if (label.length > 15) {
		  alert('כל אפשרות חייבת להכיל עד 15 תווים בלבד.');
		  try { inp.focus(); } catch (e) {}
		  return;
		}
	  }

	  // validation: at least one image required (parity with petition/referendum)
	  if (!imagesList || imagesList.length === 0) {
		alert('נדרש להוסיף תמונה אחת לפחות.');
		const addBtn = document.getElementById('add-survey-image-btn');
		if (addBtn) addBtn.focus();
		return;
	  }

	  // Build images array; each wrapper must have dataset.src and a textarea.image-desc (petition parity)
	  const images = [];
	  let lastNonEmptyDesc = '';

	  for (let i = 0; i < imagesList.length; i++) {
		const w = imagesList[i];
		const src = w && w.dataset && w.dataset.src ? w.dataset.src : '';
		const alt = w && w.dataset && w.dataset.alt ? w.dataset.alt : '';
		const descEl = w ? w.querySelector('.image-desc') : null;
		const rawDesc = descEl ? (descEl.value || '') : ''; // preserve whitespace — do NOT trim here
		let imgDesc = '';

		// First image description is required (same rule as petitions)
		if (i === 0 && imagesList.length > 0 && (!rawDesc || rawDesc.trim() === '')) {
		  alert('נדרש להזין תיאור עבור התמונה הראשונה.');
		  if (descEl) descEl.focus();
		  return;
		}

		if (rawDesc && rawDesc.length > 0) {
		  // escape HTML, preserve newlines as <br>
		  imgDesc = escapeHtml(rawDesc).replace(/\r\n/g, '\n').replace(/\n/g, '<br>');
		  lastNonEmptyDesc = imgDesc;
		} else {
		  // if description empty, copy last non-empty description
		  imgDesc = lastNonEmptyDesc || '';
		}

		// Only include images that have a src (should be set by preview)
		if (src) {
		  images.push({ src: src, alt: alt || '', desc: imgDesc });
		}
	  }

	  // create new survey object
	  const newSurvey = {
		id: 'srv_' + Date.now().toString(36),
		title: title,
		date: formatToday(),
		options: validOptions,
		images: images
	  };

	  // If cards.js renderSurveys is available and shared _surveysData exists, push & re-render
	  try {
		if (Array.isArray(window._surveysData) && typeof window.renderSurveys === 'function') {
		  window._surveysData = window._surveysData || [];
		  window._surveysData.unshift(newSurvey);
		  try { window.renderSurveys(window._surveysData); } catch (e) { /* ignore */ }
		} else {
		  // fallback: create card directly from template
		  createSurveyCard(newSurvey);
		}
	  } catch (err) {
		console.error('Failed to add new survey:', err);
		createSurveyCard(newSurvey);
	  }

	  // reset form & navigate to surveys
	  try {
		const f = document.getElementById('add-survey-form');
		if (f) f.reset();
		const list = document.getElementById('simages-list');
		if (list) list.innerHTML = '';
		const hiddenInput = document.getElementById('new-survey-images');
		if (hiddenInput) hiddenInput.value = '';
		// restore default three options (min 3)
		const opts = document.getElementById('survey-options-list');
		if (opts) {
		  opts.innerHTML = '';
		  addSurveyOption(opts);
		  addSurveyOption(opts);
		  addSurveyOption(opts);
		}
	  } catch (e) {}

	  if (typeof routeTo === 'function') routeTo('#surveys');
	  else location.hash = 'surveys';
	}
	window.submitAddSurvey = submitAddSurvey;

	// helper: create and append a single referendum card from data (re-uses referendum-template structure)
	function createReferendumCard(item) {
	  try {
		const out = document.getElementById('referendums-list');
		const tpl = document.getElementById('referendum-template');
		if (!out || !tpl) return;

		const clone = tpl.content.cloneNode(true);
		const card = clone.querySelector('.referendum-card') || clone.firstElementChild;
		if (!card) return;

		// Title & date
		const titleEl = card.querySelector('.petition-title');
		if (titleEl) titleEl.textContent = item.title || '';
		const dateEl = card.querySelector('.petition-date');
		if (dateEl) dateEl.textContent = item.date || '';

		// Carousel area
		const track = card.querySelector('.carousel-track');
		const indicators = card.querySelector('.carousel-indicators');
		const trackId = 'referendumTrack_new_' + Date.now().toString(36);
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

		// Bubble id + initial desc
		const bubble = card.querySelector('.bubble');
		if (bubble) {
		  const timeKey = Date.now().toString(36);
		  bubble.id = 'referendumBubble_new_' + timeKey;
		  bubble.dataset._initialDesc = (images[0] && images[0].desc) || '';
		}

		// Progress initial values (zero by default)
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

		// Insert at top
		out.insertBefore(clone, out.firstChild);

		// register for carousel & bubble initialization
		window.__cards_pending = window.__cards_pending || [];
		window.__cards_pending.push({
		  trackId: track ? track.id : null,
		  bubbleId: bubble ? bubble.id : null
		});

		if (typeof window.processCardsPending === 'function') {
		  try { window.processCardsPending(); } catch (e) { /* ignore */ }
		}
	  } catch (err) {
		console.error('createReferendumCard error', err);
	  }
	}
	window.createReferendumCard = createReferendumCard;

	// submit handler for the add referendum form (mimics add-petition validation & per-image descriptions)
	async function submitAddReferendum(e) {
	  if (e && typeof e.preventDefault === 'function') e.preventDefault();

	  const titleEl = document.getElementById('new-referendum-title');
	  const imagesList = Array.from(document.querySelectorAll('#reimages-list .image-wrapper'));

	  const title = titleEl ? (titleEl.value || '').trim() : '';

	  // validation: title required
	  if (!title) {
		alert('נדרש להזין כותרת למשאל.');
		if (titleEl) titleEl.focus();
		return;
	  }

	  // validation: at least one image required (mimic petition)
	  if (!imagesList || imagesList.length === 0) {
		alert('נדרש להוסיף תמונה אחת לפחות.');
		const addBtn = document.getElementById('add-referendum-image-btn');
		if (addBtn) addBtn.focus();
		return;
	  }

	  // Build images array; each wrapper must have dataset.src and a textarea.image-desc (petition parity)
	  const images = [];
	  let lastNonEmptyDesc = '';

	  for (let i = 0; i < imagesList.length; i++) {
		const w = imagesList[i];
		const src = w && w.dataset && w.dataset.src ? w.dataset.src : '';
		const alt = w && w.dataset && w.dataset.alt ? w.dataset.alt : '';
		const descEl = w ? w.querySelector('.image-desc') : null;
		const rawDesc = descEl ? (descEl.value || '') : ''; // preserve whitespace — do NOT trim here
		let imgDesc = '';

		// First image description is required (same rule as petitions)
		if (i === 0 && imagesList.length > 0 && (!rawDesc || rawDesc.trim() === '')) {
		  alert('נדרש להזין תיאור עבור התמונה הראשונה.');
		  if (descEl) descEl.focus();
		  return;
		}

		if (rawDesc && rawDesc.length > 0) {
		  // escape HTML, preserve newlines as <br>
		  imgDesc = escapeHtml(rawDesc).replace(/\r\n/g, '\n').replace(/\n/g, '<br>');
		  lastNonEmptyDesc = imgDesc;
		} else {
		  // if description empty, copy last non-empty description (petition parity)
		  imgDesc = lastNonEmptyDesc || '';
		}

		// Only include images that have a src (should be set by preview)
		if (src) {
		  images.push({ src: src, alt: alt || '', desc: imgDesc });
		}
	  }

	  // create new referendum object
	  const newRef = {
		title: title,
		date: formatToday(),
		images: images,
		pro: 0,
		con: 0,
		proVotes: 0,
		conVotes: 0
	  };

	  // If cards.js renderReferendums is available and shared _referendumsData exists, push & re-render
	  try {
		if (Array.isArray(window._referendumsData) && typeof window.renderReferendums === 'function') {
		  window._referendumsData = window._referendumsData || [];
		  window._referendumsData.unshift(newRef);
		  try { window.renderReferendums(window._referendumsData); } catch (e) { /* ignore */ }
		} else {
		  // fallback: create card directly from template
		  createReferendumCard(newRef);
		}
	  } catch (err) {
		console.error('Failed to add new referendum:', err);
		createReferendumCard(newRef);
	  }

	  // reset form & navigate to referendums
	  try {
		const f = document.getElementById('add-referendum-form');
		if (f) f.reset();
		const list = document.getElementById('reimages-list');
		if (list) list.innerHTML = '';
		const hiddenInput = document.getElementById('new-referendum-images');
		if (hiddenInput) hiddenInput.value = '';
	  } catch (e) {}

	  if (typeof routeTo === 'function') routeTo('#referendums');
	  else location.hash = 'referendums';
	}
	window.submitAddReferendum = submitAddReferendum;

	/* --- Replace previous simplistic binder: create petition-like image-wrapper entries for referendums --- */
	(function bindRefImagesPreview() {
	  const input = document.getElementById('new-referendum-images');
	  if (!input) return;
	  input.addEventListener('change', (evt) => {
		const files = Array.from(evt.target.files || []);
		const container = document.getElementById('reimages-list');
		if (!container) return;

		files.forEach((file) => {
		  const reader = new FileReader();

		  // wrapper for a single image + its description (same structure as petition)
		  const wrapper = document.createElement('div');
		  wrapper.className = 'image-wrapper';
		  wrapper.style.display = 'flex';
		  wrapper.style.flexDirection = 'column';
		  wrapper.style.gap = '8px';
		  wrapper.style.padding = '8px';
		  wrapper.style.borderRadius = '10px';
		  wrapper.style.background = '#fff';
		  wrapper.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
		  wrapper.style.border = '1px solid #eee';

		  // thumbnail container (same layout as petition)
		  const thumbOuter = document.createElement('div');
		  thumbOuter.style.width = '100%';
		  thumbOuter.style.height = '160px';
		  thumbOuter.style.overflow = 'hidden';
		  thumbOuter.style.borderRadius = '8px';
		  thumbOuter.style.display = 'flex';
		  thumbOuter.style.alignItems = 'center';
		  thumbOuter.style.justifyContent = 'center';
		  thumbOuter.style.background = '#fafafa';

		  const img = document.createElement('img');
		  img.alt = file.name || '';
		  img.style.maxWidth = '100%';
		  img.style.maxHeight = '100%';
		  img.style.objectFit = 'contain';
		  img.style.display = 'block';

		  // description textarea styled like petition description (first image required)
		  const desc = document.createElement('textarea');
		  desc.className = 'image-desc';
		  desc.placeholder = 'תיאור מלא של התמונה (נדרש רק עבור התמונה הראשונה)';
		  desc.rows = 6;
		  desc.style.resize = 'none';
		  desc.style.width = '100%';
		  desc.style.minHeight = '120px';
		  desc.style.padding = '10px';
		  desc.style.borderRadius = '8px';
		  desc.style.border = '1px solid #ddd';
		  desc.style.fontSize = '0.95rem';
		  desc.style.direction = 'rtl';
		  desc.setAttribute('aria-label', 'תיאור התמונה');

		  // remove button
		  const removeBtn = document.createElement('button');
		  removeBtn.type = 'button';
		  removeBtn.textContent = 'הסר תמונה';
		  removeBtn.style.alignSelf = 'flex-end';
		  removeBtn.style.padding = '6px 10px';
		  removeBtn.style.borderRadius = '8px';
		  removeBtn.style.border = '1px solid #ccc';
		  removeBtn.style.background = '#fff';
		  removeBtn.style.color = '#333';
		  removeBtn.style.cursor = 'pointer';
		  removeBtn.onclick = function () { wrapper.parentElement && wrapper.parentElement.removeChild(wrapper); };

		  // when file is read, resize to the same target used by petitions (contain, centered) and store data-url
		  reader.onload = () => {
			try {
			  const tmp = new Image();
			  tmp.onload = () => {
				try {
				  const TARGET_W = 800;
				  const TARGET_H = 420;

				  const canvas = document.createElement('canvas');
				  canvas.width = TARGET_W;
				  canvas.height = TARGET_H;
				  const ctx = canvas.getContext('2d');

				  ctx.fillStyle = '#ffffff';
				  ctx.fillRect(0, 0, TARGET_W, TARGET_H);

				  const sw = tmp.width, sh = tmp.height;
				  if (!sw || !sh) {
					img.src = reader.result || '';
					wrapper.dataset.src = reader.result || '';
					wrapper.dataset.alt = file.name || '';
					return;
				  }

				  const scale = Math.min(TARGET_W / sw, TARGET_H / sh);
				  const dw = Math.round(sw * scale);
				  const dh = Math.round(sh * scale);
				  const dx = Math.round((TARGET_W - dw) / 2);
				  const dy = Math.round((TARGET_H - dh) / 2);

				  ctx.drawImage(tmp, 0, 0, sw, sh, dx, dy, dw, dh);

				  const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

				  img.src = resizedDataUrl;
				  wrapper.dataset.src = resizedDataUrl;
				  wrapper.dataset.alt = file.name || '';
				} catch (innerErr) {
				  img.src = reader.result || '';
				  wrapper.dataset.src = reader.result || '';
				  wrapper.dataset.alt = file.name || '';
				  console.warn('referendum image resize failed, using original', innerErr);
				}
			  };
			  tmp.onerror = () => {
				img.src = reader.result || '';
				wrapper.dataset.src = reader.result || '';
				wrapper.dataset.alt = file.name || '';
			  };
			  tmp.src = reader.result;
			} catch (err) {
			  img.src = reader.result || '';
			  wrapper.dataset.src = reader.result || '';
			  wrapper.dataset.alt = file.name || '';
			}
		  };
		  reader.readAsDataURL(file);

		  thumbOuter.appendChild(img);
		  wrapper.appendChild(thumbOuter);
		  wrapper.appendChild(desc);
		  wrapper.appendChild(removeBtn);

		  // append wrapper to reimages-list
		  container.appendChild(wrapper);
		});

		// clear input value so same file can be added again if user wants
		input.value = '';
	  });
	})();

    /* --- Add Petition: form submit handler and helpers --- */

    // Cancel the add flow and return to petitions (used by the cancel button)
    function cancelAddPetition() {
      // route back to petitions
      if (typeof routeTo === 'function') routeTo('#petitions');
      else location.hash = 'petitions';
    }
    window.cancelAddPetition = cancelAddPetition;

    // helper: read FileList into array of data-URL objects [{src:..., alt:...}, ...]
    function readFilesAsDataUrls(fileList) {
      const files = Array.from(fileList || []);
      const readers = files.map(file => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ src: reader.result, alt: file.name || '' });
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      }));
      return Promise.all(readers).then(results => results.filter(r => r));
    }

    // helper: create and append a single petition card from data (re-uses petition-template structure)
    function createPetitionCard(item) {
      try {
        const out = document.getElementById('petitions-list');
        const tpl = document.getElementById('petition-template');
        if (!out || !tpl) return;

        const clone = tpl.content.cloneNode(true);
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
        const trackId = 'petitionTrack_' + Date.now().toString(36);
        if (track) track.id = trackId;

        const images = Array.isArray(item.images) ? item.images : [];
        images.forEach((imgObj, sIdx) => {
          const slide = document.createElement('div');
          slide.className = 'carousel-slide';
          slide.setAttribute('data-description', imgObj.desc || '');

          const img = document.createElement('img');
          img.src = imgObj.src || '';
          img.alt = imgObj.alt || (imgObj.altText || '');
          slide.appendChild(img);

          if (track) track.appendChild(slide);

          if (indicators) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            if (sIdx === 0) dot.classList.add('active');
            indicators.appendChild(dot);
          }
        });

        // Bubble id + initial desc
        const bubble = card.querySelector('.bubble');
        if (bubble) {
          const timeKey = Date.now().toString(36);
          bubble.id = 'petitionBubble_new_' + timeKey;
          bubble.dataset._initialDesc = (images[0] && images[0].desc) || '';
        }

        // Progress
        const fill = card.querySelector('.progress-fill.pro');
        const text = card.querySelector('.petition-progress-text');
        const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));
        if (fill) fill.style.width = progress + '%';
        if (text) text.textContent = progress + '%';

        // Append to DOM
        out.insertBefore(clone, out.firstChild); // place new petition at top

        // register for carousel & bubble initialization
        window.__cards_pending = window.__cards_pending || [];
        window.__cards_pending.push({
          trackId: track ? track.id : null,
          bubbleId: bubble ? bubble.id : null
        });

        // if main.js provided a processor, call it
        if (typeof window.processCardsPending === 'function') {
          try { window.processCardsPending(); } catch (e) { /* ignore */ }
        }
      } catch (err) {
        console.error('createPetitionCard error', err);
      }
    }
    window.createPetitionCard = createPetitionCard;

    // helper: format date as DD.MM.YYYY
    function formatToday() {
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return dd + '.' + mm + '.' + yyyy;
    }

    // submit handler for the add petition form (each image has its own petition-style description)
	async function submitAddPetition(e) {
	  if (e && typeof e.preventDefault === 'function') e.preventDefault();

	  const titleEl = document.getElementById('new-petition-title');
	  const imagesList = Array.from(document.querySelectorAll('#images-list .image-wrapper'));

	  const title = titleEl ? (titleEl.value || '').trim() : '';

	  // validation: title required
	  if (!title) {
		alert('נדרש להזין כותרת לעצומה.');
		if (titleEl) titleEl.focus();
		return;
	  }

	  // validation: at least one image required
	  if (!imagesList || imagesList.length === 0) {
		alert('נדרש להוסיף תמונה אחת לפחות.');
		// try to focus the add-image button
		const addBtn = document.getElementById('add-image-btn');
		if (addBtn) addBtn.focus();
		return;
	  }

	  // Build images array from the image-wrappers in order.
	  // Each wrapper must have dataset.src (data-URL) (set when added), and a textarea.image-desc for the per-image description.
	  const images = [];
	  let lastNonEmptyDesc = '';

	  for (let i = 0; i < imagesList.length; i++) {
		const w = imagesList[i];
		const src = w && w.dataset && w.dataset.src ? w.dataset.src : '';
		const alt = w && w.dataset && w.dataset.alt ? w.dataset.alt : '';
		const descEl = w ? w.querySelector('.image-desc') : null;
		const rawDesc = descEl ? (descEl.value || '') : ''; // preserve whitespace — do NOT trim here
		let imgDesc = '';

		// First image description is required if any images are present
		if (i === 0 && imagesList.length > 0 && (!rawDesc || rawDesc.trim() === '')) {
		  alert('נדרש להזין תיאור עבור התמונה הראשונה.');
		  if (descEl) descEl.focus();
		  return;
		}

		if (rawDesc && rawDesc.length > 0) {
		  // escape HTML to avoid injection, then preserve newlines as <br>
		  imgDesc = escapeHtml(rawDesc).replace(/\r\n/g, '\n').replace(/\n/g, '<br>');
		  lastNonEmptyDesc = imgDesc;
		} else {
		  // If description empty, copy last non-empty description (per your requirement)
		  imgDesc = lastNonEmptyDesc || '';
		}

		// Only include images that have a src (should be set by preview step)
		if (src) {
		  images.push({ src: src, alt: alt || '', desc: imgDesc });
		}
	  }

	  // create new petition object
	  const newPet = {
		title: title,
		date: formatToday(),
		images: images,
		progress: 0
	  };

      // If cards.js renderPetitions is available and shared _petitionsData exists, push & re-render
      try {
        if (Array.isArray(window._petitionsData) && typeof window.renderPetitions === 'function') {
          window._petitionsData = window._petitionsData || [];
          window._petitionsData.unshift(newPet); // add to start
          try { window.renderPetitions(window._petitionsData); } catch (e) { /* ignore */ }
        } else {
          // fallback: create card directly from template
          createPetitionCard(newPet);
        }
      } catch (err) {
        console.error('Failed to add new petition:', err);
        // fallback append
        createPetitionCard(newPet);
      }

      // reset form & navigate to petitions
      try {
        const f = document.getElementById('add-petition-form');
        if (f) f.reset();

        const list = document.getElementById('images-list');
        if (list) list.innerHTML = '';
        // ensure hidden file input cleared
        const hiddenInput = document.getElementById('new-petition-images');
        if (hiddenInput) hiddenInput.value = '';
      } catch (e) {}

      if (typeof routeTo === 'function') routeTo('#petitions');
      else location.hash = 'petitions';
    }
    window.submitAddPetition = submitAddPetition;

    // image management: user can add images separately; each image gets a petition-style description below it
    (function bindImagesPreviewAndAdd() {
      // trigger hidden file input when user clicks the add-image button
      window.triggerAddImage = function triggerAddImage() {
        const inp = document.getElementById('new-petition-images');
        if (!inp) return;
        try { inp.click(); } catch (e) {}
      };

      // remove image wrapper helper (exposed for inline onclick)
      window.removeImageWrapper = function removeImageWrapper(btn) {
        const wrap = btn && btn.closest && btn.closest('.image-wrapper');
        if (wrap && wrap.parentElement) wrap.parentElement.removeChild(wrap);
      };

      // when hidden file input changes (user picked file(s)), create image-wrapper entries
      document.getElementById('new-petition-images').addEventListener('change', (evt) => {
        const input = evt.target;
        if (!input || !input.files) return;
        const files = Array.from(input.files || []);
        const container = document.getElementById('images-list');
        if (!container) return;

        // for each file create a stacked block: thumbnail + description textarea + remove button
        files.forEach((file) => {
          const reader = new FileReader();

          // wrapper for a single image + its description
          const wrapper = document.createElement('div');
          wrapper.className = 'image-wrapper';
          wrapper.style.display = 'flex';
          wrapper.style.flexDirection = 'column';
          wrapper.style.gap = '8px';
          wrapper.style.padding = '8px';
          wrapper.style.borderRadius = '10px';
          wrapper.style.background = '#fff';
          wrapper.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
          wrapper.style.border = '1px solid #eee';

          // thumbnail container
          const thumbOuter = document.createElement('div');
          thumbOuter.style.width = '100%';
          thumbOuter.style.height = '160px';
          thumbOuter.style.overflow = 'hidden';
          thumbOuter.style.borderRadius = '8px';
          thumbOuter.style.display = 'flex';
          thumbOuter.style.alignItems = 'center';
          thumbOuter.style.justifyContent = 'center';
          thumbOuter.style.background = '#fafafa';

          const img = document.createElement('img');
          img.alt = file.name || '';
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          img.style.objectFit = 'contain'; // show whole image in the thumbnail without cropping
          img.style.display = 'block';

          // description textarea styled like petition description field (same look)
          const desc = document.createElement('textarea');
          desc.className = 'image-desc';
          desc.placeholder = 'תיאור מלא של התמונה (נדרש רק עבור התמונה הראשונה)';
          desc.rows = 6;
		  desc.style.resize = 'none';
          desc.style.width = '100%';
          desc.style.minHeight = '120px';
          desc.style.padding = '10px';
          desc.style.borderRadius = '8px';
          desc.style.border = '1px solid #ddd';
          desc.style.fontSize = '0.95rem';
          desc.style.direction = 'rtl';
          desc.setAttribute('aria-label', 'תיאור התמונה');

          // remove button
          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.textContent = 'הסר תמונה';
          removeBtn.style.alignSelf = 'flex-end';
          removeBtn.style.padding = '6px 10px';
          removeBtn.style.borderRadius = '8px';
          removeBtn.style.border = '1px solid #ccc';
          removeBtn.style.background = '#fff';
          removeBtn.style.color = '#333';
          removeBtn.style.cursor = 'pointer';
          removeBtn.onclick = function () { wrapper.parentElement && wrapper.parentElement.removeChild(wrapper); };

		// when file is read, resize & set img.src and store resized data-url on wrapper.dataset.src + alt
		reader.onload = () => {
		  try {
			const tmp = new Image();
			tmp.onload = () => {
			  try {
				// target size: match the card template (use 800x420 as template size)
				const TARGET_W = 800;
				const TARGET_H = 420;

				// create canvas sized to the template
				const canvas = document.createElement('canvas');
				canvas.width = TARGET_W;
				canvas.height = TARGET_H;
				const ctx = canvas.getContext('2d');

				// fill background (in case image aspect differs) - white looks natural on the card
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(0, 0, TARGET_W, TARGET_H);

				const sw = tmp.width, sh = tmp.height;

				// If source dimensions are zero or invalid, fallback to using reader result directly
				if (!sw || !sh) {
				  img.src = reader.result || '';
				  wrapper.dataset.src = reader.result || '';
				  wrapper.dataset.alt = file.name || '';
				  return;
				}

				// compute scale to "contain" image inside target without cropping
				const scale = Math.min(TARGET_W / sw, TARGET_H / sh);
				const dw = Math.round(sw * scale);
				const dh = Math.round(sh * scale);
				const dx = Math.round((TARGET_W - dw) / 2);
				const dy = Math.round((TARGET_H - dh) / 2);

				// draw the whole image scaled and centered (no cropping)
				ctx.drawImage(tmp, 0, 0, sw, sh, dx, dy, dw, dh);

				// compress to JPEG dataURL (quality 0.85) — keeps a reasonable size
				const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

				// assign to the preview img and wrapper dataset
				img.src = resizedDataUrl;
				wrapper.dataset.src = resizedDataUrl;
				wrapper.dataset.alt = file.name || '';
			  } catch (innerErr) {
				// fallback: use original if resizing fails
				img.src = reader.result || '';
				wrapper.dataset.src = reader.result || '';
				wrapper.dataset.alt = file.name || '';
				console.warn('image resize (contain) failed, using original', innerErr);
			  }
			};
			tmp.onerror = () => {
			  // fallback to original reader result
			  img.src = reader.result || '';
			  wrapper.dataset.src = reader.result || '';
			  wrapper.dataset.alt = file.name || '';
			};
			tmp.src = reader.result;
		  } catch (err) {
			// fallback
			img.src = reader.result || '';
			wrapper.dataset.src = reader.result || '';
			wrapper.dataset.alt = file.name || '';
		  }
		};
		reader.readAsDataURL(file);

		thumbOuter.appendChild(img);
		wrapper.appendChild(thumbOuter);
		wrapper.appendChild(desc);
		wrapper.appendChild(removeBtn);

		// append wrapper to images list
		container.appendChild(wrapper);
        });

        // clear input value so same file can be added again if user wants
        input.value = '';
      });
    })();

    /* --- Add Referendum: image add button + preview (mimics petition flow) --- */
    (function bindRefImagesPreviewAndAdd() {
      // trigger hidden file input when user clicks the add-referendum image button
      window.triggerAddRefImage = function triggerAddRefImage() {
        const inp = document.getElementById('new-referendum-images');
        if (!inp) return;
        try { inp.click(); } catch (e) {}
      };

      // remove image wrapper helper (exposed for inline onclick)
      window.removeRefImageWrapper = function removeRefImageWrapper(btn) {
        const wrap = btn && btn.closest && btn.closest('.image-wrapper');
        if (wrap && wrap.parentElement) wrap.parentElement.removeChild(wrap);
      };

      const inputEl = document.getElementById('new-referendum-images');
      if (!inputEl) return;
      inputEl.addEventListener('change', (evt) => {
        const input = evt.target;
        if (!input || !input.files) return;
        const files = Array.from(input.files || []);
        const container = document.getElementById('reimages-list');
        if (!container) return;

        // for each file create a stacked block: thumbnail + description textarea + remove button
        files.forEach((file) => {
          const reader = new FileReader();

          // wrapper for a single image + its description
          const wrapper = document.createElement('div');
          wrapper.className = 'image-wrapper';
          wrapper.style.display = 'flex';
          wrapper.style.flexDirection = 'column';
          wrapper.style.gap = '8px';
          wrapper.style.padding = '8px';
          wrapper.style.borderRadius = '10px';
          wrapper.style.background = '#fff';
          wrapper.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
          wrapper.style.border = '1px solid #eee';

          // thumbnail container
          const thumbOuter = document.createElement('div');
          thumbOuter.style.width = '100%';
          thumbOuter.style.height = '180px';
          thumbOuter.style.overflow = 'hidden';
          thumbOuter.style.borderRadius = '8px';
          thumbOuter.style.display = 'flex';
          thumbOuter.style.justifyContent = 'center';
          thumbOuter.style.alignItems = 'center';
          thumbOuter.style.background = '#fafafa';

          const img = document.createElement('img');
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          img.style.objectFit = 'cover';
          thumbOuter.appendChild(img);

          // per-image description (petition parity)
          const desc = document.createElement('textarea');
          desc.className = 'image-desc';
          desc.placeholder = 'תיאור לתמונה (נדרש לתמונה הראשונה)';
          desc.rows = 3;
          desc.style.width = '100%';
          desc.style.padding = '8px';
          desc.style.borderRadius = '6px';
          desc.style.border = '1px solid #ddd';
          desc.style.fontSize = '0.95rem';

          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.textContent = 'הסר';
          removeBtn.onclick = function () { wrapper.parentElement && wrapper.parentElement.removeChild(wrapper); };
          removeBtn.style.alignSelf = 'flex-end';
          removeBtn.style.marginTop = '6px';

          reader.onload = function (e) {
            try {
              img.src = e.target.result || '';
              wrapper.dataset.src = e.target.result || '';
              wrapper.dataset.alt = file.name || '';
            } catch (err) {
              img.src = e.target.result || '';
              wrapper.dataset.src = e.target.result || '';
              wrapper.dataset.alt = file.name || '';
            }
          };
          reader.readAsDataURL(file);

          wrapper.appendChild(thumbOuter);
          wrapper.appendChild(desc);
          wrapper.appendChild(removeBtn);

          // append wrapper to images list
          container.appendChild(wrapper);
        });

        // clear input value so same file can be added again if user wants
        input.value = '';
      });
    })();

    // --- Hash + JS Router (original) ---
    function clearToggleActive() {
      document.querySelectorAll('.toggle-item').forEach(item => item.classList.remove('active'));
    }
    function setToggleActiveBySection(sectionId) {
      clearToggleActive();
      const item = document.querySelector(`.toggle-item[data-section="${sectionId}"]`);
      if (item) item.classList.add('active');
    }

    function showOnlySection(sectionId) {
      document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
      const el = document.getElementById(sectionId);
      if (el) el.classList.add('active');
    }

	function routeTo(hash) {
	  // Close sidebar on navigation
	  document.getElementById('sidebar').classList.remove('active');

	  // Normalize
	  const target = (hash || 'home').replace('#', '');

	  if (target === 'logout') {
		const savedUrl = localStorage.getItem("savedUrl");
		location.href = savedUrl;
		return;
	  }

	  // Home → petitions
	  if (target === 'home' || target === '') {
		showOnlySection('petitions');
		setToggleActiveBySection('petitions');
		return;
	  }

	  // If hash matches an existing section, show it
	  // NOTE: added 'add-petition' and 'add-referendum' so routeTo('#add-petition') / '#add-referendum' will show the add forms.
	  const knownSections = ['petitions','referendums','surveys','ideas','add-petition','add-referendum','add-survey','add-idea','profile','settings'];
	  if (knownSections.includes(target)) {
		showOnlySection(target);
		// Only mark toggle active for the four main toggle sections
		if (['petitions','referendums','surveys','ideas'].includes(target)) {
		  setToggleActiveBySection(target);
		} else {
		  clearToggleActive();
		}
		return;
	  }

	  // Fallback → home/petitions
	  showOnlySection('petitions');
	  setToggleActiveBySection('petitions');
	}
    // listeners (original)
    window.addEventListener('hashchange', () => routeTo(location.hash));
    window.addEventListener('load', () => routeTo(location.hash));
    // ensure initial state after DOM is ready
    routeTo(location.hash);

	/* --- setupBubble (robust clone measurement + HTML-entity labels + fallback) --- */
	function setupBubble(bubbleEl, html) {
	  if (!bubbleEl) return;

	  // ensure inner structure exists
	  let content = bubbleEl.querySelector('.bubble-content');
	  let toggle = bubbleEl.querySelector('.bubble-toggle');
	  let fade = bubbleEl.querySelector('.bubble-fade');

	  if (!content) {
		bubbleEl.innerHTML =
		  '<div class="bubble-content" aria-live="polite"></div>' +
		  '<div class="bubble-fade" aria-hidden="true"></div>' +
		  '<button class="bubble-toggle" type="button" aria-expanded="false" style="display:none"></button>';
		content = bubbleEl.querySelector('.bubble-content');
		toggle = bubbleEl.querySelector('.bubble-toggle');
		fade = bubbleEl.querySelector('.bubble-fade');
	  }

	  // Put HTML into the bubble
	  content.innerHTML = html || '';

	  // Default visual (compact)
	  content.classList.add('clamped');
	  bubbleEl.classList.add('clamped');
	  bubbleEl.classList.remove('expanded');

	  // hide toggle while we measure
	  toggle.style.display = 'none';
	  toggle.setAttribute('aria-expanded', 'false');
	  toggle.classList.remove('expanded');

	  // set labels directly in Hebrew (ensure main.js is saved as UTF-8)
      toggle.textContent = 'פתיחה';

	  // Primary measurement: off-screen clone with matching width
	  requestAnimationFrame(() => {
		try {
		  const clone = content.cloneNode(true);

		  // Match rendered width to match wrapping / line breaks
		  const rect = content.getBoundingClientRect();
		  const width = (rect && rect.width) || content.clientWidth || content.offsetWidth || 300;

		  clone.style.position = 'absolute';
		  clone.style.visibility = 'hidden';
		  clone.style.left = '-9999px';
		  clone.style.top = '0';
		  clone.style.width = width + 'px';
		  clone.style.maxHeight = 'none';
		  clone.style.display = 'block';
		  clone.classList.remove('clamped'); // ensure clone shows full content

		  document.body.appendChild(clone);
		  void clone.offsetHeight; // force reflow on clone
		  const fullHeight = clone.scrollHeight;

		  // compute line-height
		  const cs = window.getComputedStyle(content);
		  let lineHeight = parseFloat(cs.lineHeight);
		  if (!lineHeight || Number.isNaN(lineHeight)) {
			const fontSize = parseFloat(cs.fontSize) || 14;
			lineHeight = Math.round(fontSize * 1.2);
		  }

		  const totalLines = Math.max(1, Math.floor(fullHeight / lineHeight));
		  document.body.removeChild(clone);

		  // Fallback heuristic: long text means we should show toggle even if measurement weirdly reports <=4.
		  const textLengthFallback = (content.textContent || '').trim().length > 200; // tweakable threshold

		  if (totalLines > 5 || textLengthFallback) {
			// show toggle
			toggle.style.display = 'inline-block';
			toggle.setAttribute('aria-expanded', 'false');
			bubbleEl.classList.add('has-toggle');
			content.classList.add('clamped');
			bubbleEl.classList.add('clamped');
			toggle.textContent = 'פתיחה'; // plain Hebrew
		  } else {
			toggle.style.display = 'none';
			toggle.setAttribute('aria-expanded', 'false');
			toggle.textContent = ''; // clear label
			content.classList.remove('clamped');
			bubbleEl.classList.remove('clamped', 'has-toggle');
		  }
		} catch (err) {
		  // if anything goes wrong, fall back to showing toggle when text is long
		  const fallbackShow = (content.textContent || '').trim().length > 200;
		  if (fallbackShow) {
			toggle.style.display = 'inline-block';
			toggle.setAttribute('aria-expanded', 'false');
			bubbleEl.classList.add('has-toggle');
			content.classList.add('clamped');
			bubbleEl.classList.add('clamped');
			toggle.innerHTML = openHTML;
		  } else {
			toggle.style.display = 'none';
			toggle.setAttribute('aria-expanded', 'false');
			toggle.innerHTML = '';
			content.classList.remove('clamped');
			bubbleEl.classList.remove('clamped', 'has-toggle');
		  }
		}
	  });

	  // Attach one click handler only (clean up previous if set)
	  if (toggle._handler) toggle.removeEventListener('click', toggle._handler);
	  toggle._handler = function () {
		const expanded = toggle.getAttribute('aria-expanded') === 'true';
		if (expanded) {
			// collapse
			content.classList.add('clamped');
			bubbleEl.classList.add('clamped');
			toggle.setAttribute('aria-expanded', 'false');
			toggle.classList.remove('expanded');
			bubbleEl.classList.remove('expanded');
			toggle.textContent = 'פתיחה';
			toggle.blur();
		} else {
			// expand
			content.classList.remove('clamped');
			bubbleEl.classList.remove('clamped');
			toggle.setAttribute('aria-expanded', 'true');
			toggle.classList.add('expanded');
			bubbleEl.classList.add('expanded');
			toggle.textContent = 'סגירה';
			toggle.blur();
		  if (typeof bubbleEl.scrollIntoView === 'function') {
			bubbleEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		  }
		}
	  };
	  toggle.addEventListener('click', toggle._handler);
	}
	window.setupBubble = setupBubble;

	/* --- NEW: general carousel initializer by element id --- */
	function initCarouselById(trackId) {
	  const track = document.getElementById(trackId);
	  if (!track) return;
	  const container = track.parentElement;
	  const dots = container ? Array.from(container.querySelectorAll('.dot')) : [];
	  const slides = track ? Array.from(track.querySelectorAll('.carousel-slide')) : [];
	  if (!track || slides.length <= 0) return;

	  const bubbleEl = container ? container.parentElement.querySelector('.bubble') : null;

	  let currentIndex = 0;
	  let startX = 0;

	  function updateCarousel() {
		// move slides
		track.style.transform = `translateX(-${currentIndex * 100}%)`;
		// update dots
		dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
		// update external bubble using helper (so clamping/toggle works)
		if (bubbleEl) {
		  const desc = slides[currentIndex].getAttribute('data-description') || '';
		  setupBubble(bubbleEl, desc);
		}
	  }

	  function touchStart(e) {
		startX = e.touches ? e.touches[0].clientX : e.clientX;
	  }
	  function touchMove(e) {
		if (!startX) return;
		const x = e.touches ? e.touches[0].clientX : e.clientX;
		const diff = startX - x;
		if (diff > 50 && currentIndex < slides.length - 1) {
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

	  // attach pointer/touch listeners
	  track.addEventListener('touchstart', touchStart);
	  track.addEventListener('mousedown', touchStart);
	  track.addEventListener('touchmove', touchMove);
	  track.addEventListener('mousemove', e => { if (e.buttons) touchMove(e); });
	  track.addEventListener('touchend', touchEnd);
	  track.addEventListener('mouseup', touchEnd);

	  // dot clicks
	  dots.forEach((dot, i) => dot.addEventListener('click', () => {
		currentIndex = i;
		updateCarousel();
	  }));

	  // init
	  updateCarousel();
	}

	/* --- Expose a one-shot processor so cards.js can ask main.js to initialize pending tracks --- */
	function processCardsPending() {
	  if (!Array.isArray(window.__cards_pending) || !window.__cards_pending.length) return;
	  window.__cards_pending.forEach(rec => {
		try {
		  // initCarouselById is available inside init() scope — call it directly
		  if (rec && rec.trackId) {
			initCarouselById(rec.trackId);
		  }
		  if (rec && rec.bubbleId) {
			const bubbleEl = document.getElementById(rec.bubbleId);
			if (bubbleEl) {
			  setupBubble(bubbleEl, bubbleEl.dataset._initialDesc || '');
			}
		  }
		} catch (err) {
		  // ignore individual failures
		}
	  });
	  // clear pending list after processing
	  window.__cards_pending.length = 0;
	}
	// expose globally so cards.js can call it immediately after registration
	window.processCardsPending = processCardsPending;

	/* --- Run the processor once during init to catch any early-registered items --- */
	processCardsPending();
	
	/* --- SURVEY: initialize each survey card on the page (per-card storage & UI) --- */
	// Expose the survey init so other modules (cards.js) can call it after rendering
	window.setupSurveyInteractionsAllCards = function setupSurveyInteractionsAllCards(){
	  // Track whether we've done the "storage reset" once.
	  // Allow repeated calls so new survey cards rendered later get initialized too.
	  const firstRun = !window.__survey_init_done;
	  if (firstRun) {
		window.__survey_init_done = true;
	  }

	  // WeakSet to remember which DOM card elements we've already initialized.
	  // Using WeakSet avoids memory leaks when cards are removed.
	  if (!window.__survey_inited_cards) {
		window.__survey_inited_cards = new WeakSet();
	  }

	  // Reset survey localStorage ONCE on the very first run (preserve counts across re-inits in same session).
	  if (firstRun) {
		try {
		  for (let i = localStorage.length - 1; i >= 0; i--) {
			const key = localStorage.key(i);
			if (key && key.indexOf('survey_counts_') === 0) {
			  localStorage.removeItem(key);
			}
		  }
		} catch (e) {
		  // ignore storage exceptions (e.g. private mode)
		}
	  }

	  const rankColors = ['#2196f3', '#4caf50', '#ff9800'];
	  const greyColor = '#bdbdbd';

	  // find all survey-card elements and init each (only those not already initialized)
	  const surveyCards = Array.from(document.querySelectorAll('.survey-card'));

	  surveyCards.forEach(card => {
		// skip cards already initialized in a previous call
		if (window.__survey_inited_cards.has(card)) return;
		// mark as initialized (so subsequent calls won't reinit this card)
		window.__survey_inited_cards.add(card);

		const progressContainer = card.querySelector('.survey-progress');
		if (!progressContainer) return;

		// per-card survey id (fallback to generated id)
		const surveyId = progressContainer.dataset.surveyId || ('srv_' + (Math.random().toString(36).slice(2,9)));
		const STORAGE_KEY = 'survey_counts_' + surveyId;

		const optionsList = progressContainer.querySelector('.options-list');
		const toggleBtn = progressContainer.querySelector('.options-toggle');

		// Build initial options from data-options (JSON) placed on progressContainer by cards.js.
		// Accepts:
		//   data-options='["label1","label2"]'
		//   or data-options='[{"id":"opt1","label":"..."}]'
		function getInitialOptionsFromAttr() {
		  try {
			const raw = progressContainer.dataset.options;
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			if (!Array.isArray(parsed)) return [];
			return parsed.map((entry, i) => {
			  if (typeof entry === 'string') {
				return { id: 'opt' + (i+1), label: entry, count: 0 };
			  } else {
				return {
				  id: entry.id || ('opt' + (i+1)),
				  label: entry.label || ('אופציה ' + (i+1)),
				  count: typeof entry.count === 'number' ? entry.count : 0
				};
			  }
			});
		  } catch (err) {
			return [];
		  }
		}

		// initialize per-card options from storage or from data-options attribute
		function loadCounts() {
		  try {
			const stored = localStorage.getItem(STORAGE_KEY);
			const base = getInitialOptionsFromAttr();
			if (!stored) {
			  // if no stored counts, return base (or fallback 1 option)
			  return base.length ? base : [{ id:'opt1', label:'אופציה 1', count:0 }];
			}
			const data = JSON.parse(stored);
			// merge base labels with stored counts (match by id)
			if (!Array.isArray(base) || !base.length) {
			  // stored format fallback: accept stored array directly
			  return Array.isArray(data) ? data : [];
			}
			const byId = {};
			base.forEach(b => byId[b.id] = Object.assign({}, b));
			if (Array.isArray(data)) {
			  data.forEach(d => {
				if (d && d.id && byId[d.id]) {
				  byId[d.id].count = typeof d.count === 'number' ? d.count : byId[d.id].count || 0;
				}
			  });
			}
			return Object.keys(byId).map(k => byId[k]);
		  } catch (err) {
			return getInitialOptionsFromAttr();
		  }
		}

		function saveCounts() {
		  try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
		  } catch (e) {
			// ignore storage
		  }
		}

		// options array for this card
		let options = loadCounts();

		function renderOptions() {
		  // sort by count descending for top colors
		  const sorted = options.slice().sort((a,b) => (b.count || 0) - (a.count || 0));
		  optionsList.innerHTML = '';

		  sorted.forEach((opt, idx) => {
			const row = document.createElement('div');
			row.className = 'option-row';

			const labelRow = document.createElement('div');
			labelRow.className = 'progress-labels';

			const label = document.createElement('div');
			label.className = 'option-label';
			label.setAttribute('tabindex', '0');
			label.textContent = opt.label || 'אופציה';

			const percent = document.createElement('div');
			percent.className = 'option-percent';
			const total = options.reduce((s,o) => s + (o.count || 0), 0);
			const pct = total ? Math.round(((opt.count || 0) / total) * 100) : 0;
			percent.textContent = pct + '%';

			labelRow.appendChild(label);
			labelRow.appendChild(percent);

			const barOuter = document.createElement('div');
			barOuter.className = 'progress-bar';
			const fill = document.createElement('div');
			fill.className = 'option-fill';
			fill.style.width = pct + '%';

			barOuter.appendChild(fill);

			row.appendChild(labelRow);
			row.appendChild(barOuter);

			// attach metadata for click handler
			row.dataset.optId = opt.id;

			optionsList.appendChild(row);

			// style based on rank
			const fillEl = row.querySelector('.option-fill');
			const labelEl = row.querySelector('.option-label');
			const percentEl = row.querySelector('.option-percent');

			if (idx === 0) {
			  fillEl.style.background = rankColors[0];
			  labelEl.style.color = rankColors[0];
			  if (percentEl) percentEl.style.color = rankColors[0];
			} else if (idx === 1) {
			  fillEl.style.background = rankColors[1];
			  labelEl.style.color = rankColors[1];
			  if (percentEl) percentEl.style.color = rankColors[1];
			} else if (idx === 2) {
			  fillEl.style.background = rankColors[2];
			  labelEl.style.color = rankColors[2];
			  if (percentEl) percentEl.style.color = rankColors[2];
			} else {
			  fillEl.style.background = greyColor;
			  labelEl.style.color = '#666';
			  if (percentEl) percentEl.style.color = '#666';
			}

			// click + keyboard handlers
			// remove existing handlers first to avoid duplicates
			const newLabelEl = labelEl.cloneNode(true);
			labelEl.parentNode.replaceChild(newLabelEl, labelEl);
			newLabelEl.addEventListener('click', () => incrementOption(opt.id));
			newLabelEl.addEventListener('keydown', (e) => {
			  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); incrementOption(opt.id); }
			});
		  });

		  // Decide whether to show the toggle/fade: only when there are more than 3 options
		  const optionsCount = sorted.length || 0;
		  if (toggleBtn) {
			if (optionsCount > 3) {
			  toggleBtn.style.display = 'block';
			  const isCollapsed = progressContainer.classList.contains('collapsed');
			  toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
			  toggleBtn.textContent = isCollapsed ? 'פתיחה' : 'סגירה';
			} else {
			  toggleBtn.style.display = 'none';
			  progressContainer.classList.remove('collapsed');
			  toggleBtn.setAttribute('aria-expanded', 'false');
			  toggleBtn.textContent = '';
			}
		  }
		}

		function incrementOption(optId) {
		  const found = options.find(o => o.id === optId);
		  if (!found) return;
		  found.count = (found.count || 0) + 1;
		  saveCounts();
		  renderOptions();
		}

		// toggle collapsed
		if (toggleBtn) {
		  if (toggleBtn._handler) toggleBtn.removeEventListener('click', toggleBtn._handler);
		  toggleBtn._handler = function(){
			progressContainer.classList.toggle('collapsed');
			renderOptions();
		  };
		  toggleBtn.addEventListener('click', toggleBtn._handler);
		}

		// default collapsed (per earlier requirement)
		progressContainer.classList.add('collapsed');

		// initial render
		renderOptions();
	  }); // end forEach card
	}; // end setupSurveyInteractionsAllCards

	// --- Comments helper (shared by all cards) ---
	function addComment(btn) {
	  const form = btn.closest('.comment-form');
	  if (!form) return;
	  const input = form.querySelector('.comment-input');
	  const commentText = input && input.value && input.value.trim();
	  if (!commentText) return;

	  const commentsContainer = form.closest('.comments').querySelector('.comments-list');
	  const item = document.createElement('div');
	  item.className = 'comment';
	  // Keep text RTL and basic markup (escaped)
	  item.innerHTML = '<div class="comment-text">' + escapeHtml(commentText) + '</div>';
	  commentsContainer.insertBefore(item, commentsContainer.firstChild);
	  input.value = '';
	}

	// small helper to escape user input (avoid HTML injection)
	function escapeHtml(str) {
	  return String(str).replace(/[&<>\"']/g, function (s) {
		return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]);
	  });
	}
	window.addComment = addComment;

    // Close share/add popups if clicking outside
    document.addEventListener('click', (e) => {
      // share: per-card buttons live under .vote-actions
      const isShareBtn = !!e.target.closest('.vote-actions button');
      const isSharePopup = !!e.target.closest('.share-popup');

      // add button/wrap and popup
      const isAddBtn = !!e.target.closest('.add-wrap') || !!e.target.closest('.add-btn');
      const isAddPopup = !!e.target.closest('.add-popup');

      // hide share popups when clicking outside share controls
      if (!isShareBtn && !isSharePopup) {
        document.querySelectorAll('.share-popup').forEach(p => p.style.display = 'none');
      }

      // hide add popups when clicking outside add controls
      if (!isAddBtn && !isAddPopup) {
        document.querySelectorAll('.add-popup').forEach(p => p.style.display = 'none');
        // reset aria-expanded on add buttons
        document.querySelectorAll('.add-btn').forEach(b => { try { b.setAttribute('aria-expanded','false'); } catch(e){} });
      }
    });

    // ensure survey UI is (re-)initialized if survey cards are already present
    if (typeof window.setupSurveyInteractionsAllCards === 'function') {
      try { window.setupSurveyInteractionsAllCards(); } catch (e) { console.error('survey init failed', e); }
    }

  } // end init
  
	// --- Support Idea (per-card) ---
	// Behaves like signPetition(btn): increments the idea card's progress by 10% until 100%.
	function supportIdea(btn) {
	  // btn is the clicked button (passed from onclick)
	  const card = btn && btn.closest && btn.closest('.petition-card');
	  if (!card) return;
	  const progressEl = card.querySelector('.progress-fill.pro');
	  const progressTextEl = card.querySelector('.idea-progress-text');
	  // read current percent from width style (fallback 0)
	  let current = 0;
	  if (progressEl && progressEl.style && progressEl.style.width) {
		current = parseInt(progressEl.style.width, 10) || 0;
	  }
	  if (current < 100) {
		current = Math.min(100, current + 10);
		if (progressEl) progressEl.style.width = current + '%';
		if (progressTextEl) progressTextEl.innerText = current + '%';
	  }
	}
	window.supportIdea = supportIdea;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
