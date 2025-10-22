/* post-creation.js - Enhanced post creation with database integration */
(function() {
  'use strict';

  /**
   * Override submitAddPetition to save to database
   */
  window.submitAddPetition = async function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const user = window.UserData ? window.UserData.getCurrentUser() : null;
    if (!user) {
      alert('נא להתחבר כדי ליצור עצומה\nPlease log in to create petition');
      return;
    }

    const titleEl = document.getElementById('new-petition-title');
    const imagesList = Array.from(document.querySelectorAll('#images-list .image-wrapper'));

    const title = titleEl ? (titleEl.value || '').trim() : '';

    if (!title) {
      alert('נדרש להזין כותרת לעצומה.');
      if (titleEl) titleEl.focus();
      return;
    }

    if (!imagesList || imagesList.length === 0) {
      alert('נדרש להוסיף תמונה אחת לפחות.');
      const addBtn = document.getElementById('add-image-btn');
      if (addBtn) addBtn.focus();
      return;
    }

    const images = [];
    let lastNonEmptyDesc = '';

    for (let i = 0; i < imagesList.length; i++) {
      const w = imagesList[i];
      const src = w && w.dataset && w.dataset.src ? w.dataset.src : '';
      const alt = w && w.dataset && w.dataset.alt ? w.dataset.alt : '';
      const descEl = w ? w.querySelector('.image-desc') : null;
      const rawDesc = descEl ? (descEl.value || '') : '';
      let imgDesc = '';

      if (i === 0 && imagesList.length > 0 && (!rawDesc || rawDesc.trim() === '')) {
        alert('נדרש להזין תיאור עבור התמונה הראשונה.');
        if (descEl) descEl.focus();
        return;
      }

      if (rawDesc && rawDesc.length > 0) {
        imgDesc = escapeHtml(rawDesc).replace(/\r\n/g, '\n').replace(/\n/g, '<br>');
        lastNonEmptyDesc = imgDesc;
      } else {
        imgDesc = lastNonEmptyDesc || '';
      }

      if (src) {
        images.push({ src: src, alt: alt || '', desc: imgDesc });
      }
    }

    try {
      // Save to database
      const newPost = await window.DB.createPost('petition', user.phone, {
        title: title,
        images: images
      });

      alert('עצומה נוצרה בהצלחה!\nPetition created successfully!');

      // Reset form
      const f = document.getElementById('add-petition-form');
      if (f) f.reset();

      const list = document.getElementById('images-list');
      if (list) list.innerHTML = '';

      const hiddenInput = document.getElementById('new-petition-images');
      if (hiddenInput) hiddenInput.value = '';

      // Reload posts data
      if (window.PostInteractions && window.PostInteractions.initPostsData) {
        await window.PostInteractions.initPostsData();
      }

      // Navigate to petitions
      if (typeof routeTo === 'function') routeTo('#petitions');
      else location.hash = 'petitions';
    } catch (error) {
      console.error('Error creating petition:', error);
      alert('שגיאה ביצירת העצומה\nError creating petition');
    }
  };

  /**
   * Override submitAddReferendum to save to database
   */
  window.submitAddReferendum = async function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const user = window.UserData ? window.UserData.getCurrentUser() : null;
    if (!user) {
      alert('נא להתחבר כדי ליצור משאל\nPlease log in to create referendum');
      return;
    }

    const titleEl = document.getElementById('new-referendum-title');
    const imagesList = Array.from(document.querySelectorAll('#reimages-list .image-wrapper'));

    const title = titleEl ? (titleEl.value || '').trim() : '';

    if (!title) {
      alert('נדרש להזין כותרת למשאל.');
      if (titleEl) titleEl.focus();
      return;
    }

    if (!imagesList || imagesList.length === 0) {
      alert('נדרש להוסיף תמונה אחת לפחות.');
      return;
    }

    const images = [];
    let lastNonEmptyDesc = '';

    for (let i = 0; i < imagesList.length; i++) {
      const w = imagesList[i];
      const src = w && w.dataset && w.dataset.src ? w.dataset.src : '';
      const alt = w && w.dataset && w.dataset.alt ? w.dataset.alt : '';
      const descEl = w ? w.querySelector('.image-desc') : null;
      const rawDesc = descEl ? (descEl.value || '') : '';
      let imgDesc = '';

      if (i === 0 && imagesList.length > 0 && (!rawDesc || rawDesc.trim() === '')) {
        alert('נדרש להזין תיאור עבור התמונה הראשונה.');
        if (descEl) descEl.focus();
        return;
      }

      if (rawDesc && rawDesc.length > 0) {
        imgDesc = escapeHtml(rawDesc).replace(/\r\n/g, '\n').replace(/\n/g, '<br>');
        lastNonEmptyDesc = imgDesc;
      } else {
        imgDesc = lastNonEmptyDesc || '';
      }

      if (src) {
        images.push({ src: src, alt: alt || '', desc: imgDesc });
      }
    }

    try {
      // Save to database
      await window.DB.createPost('referendum', user.phone, {
        title: title,
        images: images
      });

      alert('משאל נוצר בהצלחה!\nReferendum created successfully!');

      // Reset form
      const f = document.getElementById('add-referendum-form');
      if (f) f.reset();

      const list = document.getElementById('reimages-list');
      if (list) list.innerHTML = '';

      const hiddenInput = document.getElementById('new-referendum-images');
      if (hiddenInput) hiddenInput.value = '';

      // Reload posts data
      if (window.PostInteractions && window.PostInteractions.initPostsData) {
        await window.PostInteractions.initPostsData();
      }

      // Navigate to referendums
      if (typeof routeTo === 'function') routeTo('#referendums');
      else location.hash = 'referendums';
    } catch (error) {
      console.error('Error creating referendum:', error);
      alert('שגיאה ביצירת המשאל\nError creating referendum');
    }
  };

  /**
   * Override submitAddSurvey to save to database
   */
  window.submitAddSurvey = async function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const user = window.UserData ? window.UserData.getCurrentUser() : null;
    if (!user) {
      alert('נא להתחבר כדי ליצור סקר\nPlease log in to create survey');
      return;
    }

    const titleEl = document.getElementById('new-survey-title');
    const optionInputs = Array.from(document.querySelectorAll('#survey-options-list .option-input'));
    const imagesList = Array.from(document.querySelectorAll('#simages-list .image-wrapper'));

    const title = titleEl ? (titleEl.value || '').trim() : '';

    if (!title) {
      alert('נדרש להזין כותרת לסקר.');
      if (titleEl) titleEl.focus();
      return;
    }

    // Collect options
    const options = optionInputs.map(inp => (inp.value || '').trim()).filter(opt => opt.length > 0);

    if (options.length < 3) {
      alert('נדרש להזין לפחות 3 אפשרויות.');
      return;
    }

    // Collect images
    const images = [];
    let lastNonEmptyDesc = '';

    for (let i = 0; i < imagesList.length; i++) {
      const w = imagesList[i];
      const src = w && w.dataset && w.dataset.src ? w.dataset.src : '';
      const alt = w && w.dataset && w.dataset.alt ? w.dataset.alt : '';
      const descEl = w ? w.querySelector('.image-desc') : null;
      const rawDesc = descEl ? (descEl.value || '') : '';
      let imgDesc = '';

      if (rawDesc && rawDesc.length > 0) {
        imgDesc = escapeHtml(rawDesc).replace(/\r\n/g, '\n').replace(/\n/g, '<br>');
        lastNonEmptyDesc = imgDesc;
      } else {
        imgDesc = lastNonEmptyDesc || '';
      }

      if (src) {
        images.push({ src: src, alt: alt || '', desc: imgDesc });
      }
    }

    try {
      // Save to database
      await window.DB.createPost('survey', user.phone, {
        title: title,
        images: images,
        options: options
      });

      alert('סקר נוצר בהצלחה!\nSurvey created successfully!');

      // Reset form
      const f = document.getElementById('add-survey-form');
      if (f) f.reset();

      const list = document.getElementById('simages-list');
      if (list) list.innerHTML = '';

      const hiddenInput = document.getElementById('new-survey-images');
      if (hiddenInput) hiddenInput.value = '';

      // Reload posts data
      if (window.PostInteractions && window.PostInteractions.initPostsData) {
        await window.PostInteractions.initPostsData();
      }

      // Navigate to surveys
      if (typeof routeTo === 'function') routeTo('#surveys');
      else location.hash = 'surveys';
    } catch (error) {
      console.error('Error creating survey:', error);
      alert('שגיאה ביצירת הסקר\nError creating survey');
    }
  };

  /**
   * Override submitAddIdea to save to database
   */
  window.submitAddIdea = async function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const user = window.UserData ? window.UserData.getCurrentUser() : null;
    if (!user) {
      alert('נא להתחבר כדי ליצור רעיון\nPlease log in to create idea');
      return;
    }

    const titleEl = document.getElementById('new-idea-title');
    const imagesList = Array.from(document.querySelectorAll('#ideaimages-list .image-wrapper'));

    const title = titleEl ? (titleEl.value || '').trim() : '';

    if (!title) {
      alert('נדרש להזין כותרת לרעיון.');
      if (titleEl) titleEl.focus();
      return;
    }

    if (!imagesList || imagesList.length === 0) {
      alert('נדרש להוסיף תמונה אחת לפחות.');
      return;
    }

    const images = [];
    let lastNonEmptyDesc = '';

    for (let i = 0; i < imagesList.length; i++) {
      const w = imagesList[i];
      const src = w && w.dataset && w.dataset.src ? w.dataset.src : '';
      const alt = w && w.dataset && w.dataset.alt ? w.dataset.alt : '';
      const descEl = w ? w.querySelector('.image-desc') : null;
      const rawDesc = descEl ? (descEl.value || '') : '';
      let imgDesc = '';

      if (i === 0 && imagesList.length > 0 && (!rawDesc || rawDesc.trim() === '')) {
        alert('נדרש להזין תיאור עבור התמונה הראשונה.');
        if (descEl) descEl.focus();
        return;
      }

      if (rawDesc && rawDesc.length > 0) {
        imgDesc = escapeHtml(rawDesc).replace(/\r\n/g, '\n').replace(/\n/g, '<br>');
        lastNonEmptyDesc = imgDesc;
      } else {
        imgDesc = lastNonEmptyDesc || '';
      }

      if (src) {
        images.push({ src: src, alt: alt || '', desc: imgDesc });
      }
    }

    try {
      // Save to database
      await window.DB.createPost('idea', user.phone, {
        title: title,
        images: images
      });

      alert('רעיון נוצר בהצלחה!\nIdea created successfully!');

      // Reset form
      const f = document.getElementById('add-idea-form');
      if (f) f.reset();

      const list = document.getElementById('ideaimages-list');
      if (list) list.innerHTML = '';

      const hiddenInput = document.getElementById('new-idea-images');
      if (hiddenInput) hiddenInput.value = '';

      // Reload posts data
      if (window.PostInteractions && window.PostInteractions.initPostsData) {
        await window.PostInteractions.initPostsData();
      }

      // Navigate to ideas
      if (typeof routeTo === 'function') routeTo('#ideas');
      else location.hash = 'ideas';
    } catch (error) {
      console.error('Error creating idea:', error);
      alert('שגיאה ביצירת הרעיון\nError creating idea');
    }
  };

  /**
   * Helper function to escape HTML (assumes it exists in main.js, or define it here)
   */
  function escapeHtml(text) {
    if (typeof window.escapeHtml === 'function') {
      return window.escapeHtml(text);
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

})();
