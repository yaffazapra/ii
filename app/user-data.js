/* user-data.js - User Profile and Activity Management */
(function() {
  'use strict';

  // Global user data
  let currentUser = null;

  /**
   * Redirect to login page
   */
  function redirectToLogin() {
    console.warn('Redirecting to login...');
    const indexUrl = localStorage.getItem('savedUrl') || 'index.html';
    // Use replace() to prevent back button bypass
    window.location.replace(indexUrl);
  }

  /**
   * Initialize user data on page load
   */
  async function initUser() {
    try {
      // Get phone from localStorage
      const phone = localStorage.getItem('userPhone');

      if (!phone) {
        // This should have been caught by the head script,
        // but double-check here
        console.warn('No user phone found in localStorage');
        redirectToLogin();
        return null;
      }

      // Fetch user data from database
      currentUser = await window.DB.getUserByPhone(phone);

      if (!currentUser) {
        console.warn('User not found in database - phone may be invalid or user deleted');
        // Clear invalid phone from localStorage
        localStorage.removeItem('userPhone');
        // Redirect to login
        redirectToLogin();
        return null;
      }

      // Update UI with user data
      updateProfileUI();
      updateSettingsUI();

      return currentUser;
    } catch (error) {
      console.error('Error initializing user:', error);
      // On error, redirect to login for safety
      redirectToLogin();
      return null;
    }
  }

  /**
   * Update Profile UI with current user data
   */
  async function updateProfileUI() {
    // If currentUser is not loaded yet, wait for it
    if (!currentUser) {
      const phone = localStorage.getItem('userPhone');
      if (phone) {
        try {
          currentUser = await window.DB.getUserByPhone(phone);
        } catch (error) {
          console.error('Error loading user for profile:', error);
          return;
        }
      } else {
        return;
      }
    }

    const phoneEl = document.getElementById('profile-phone');
    const nameEl = document.getElementById('profile-name');

    if (phoneEl) phoneEl.textContent = currentUser.phone || '-';
    if (nameEl) nameEl.value = currentUser.name || '';
  }

  /**
   * Update Settings UI with current user settings
   */
  async function updateSettingsUI() {
    // If currentUser is not loaded yet, wait for it
    if (!currentUser) {
      const phone = localStorage.getItem('userPhone');
      if (phone) {
        try {
          currentUser = await window.DB.getUserByPhone(phone);
        } catch (error) {
          console.error('Error loading user for settings:', error);
          return;
        }
      } else {
        return;
      }
    }

    const notificationsEl = document.getElementById('setting-notifications');
    const languageEl = document.getElementById('setting-language');

    if (notificationsEl && currentUser.settings) {
      notificationsEl.checked = currentUser.settings.notifications !== false;
    }

    if (languageEl && currentUser.settings) {
      languageEl.value = currentUser.settings.language || 'he';
    }
  }

  /**
   * Save profile name
   */
  async function saveProfileName() {
    if (!currentUser) return;

    const nameEl = document.getElementById('profile-name');
    const newName = nameEl.value.trim();

    if (newName.length < 2 || newName.length > 15) {
      alert('נא להזין שם בין 2 ל-15 תווים.\nPlease enter a name between 2-15 characters.');
      return;
    }

    try {
      // Update user in database
      const updatedUser = await window.DB.updateUser(currentUser.phone, {
        name: newName,
        settings: currentUser.settings
      });

      currentUser = updatedUser;
      alert('השם עודכן בהצלחה!\nName updated successfully!');
    } catch (error) {
      console.error('Error saving name:', error);
      alert('שגיאה בשמירת השם. אנא נסה שוב.\nError saving name. Please try again.');
    }
  }
  window.saveProfileName = saveProfileName;

  /**
   * Save settings
   */
  async function saveSettings() {
    if (!currentUser) return;

    const notificationsEl = document.getElementById('setting-notifications');
    const languageEl = document.getElementById('setting-language');

    const newSettings = {
      notifications: notificationsEl ? notificationsEl.checked : true,
      language: languageEl ? languageEl.value : 'he'
    };

    try {
      // Update user in database
      const updatedUser = await window.DB.updateUser(currentUser.phone, {
        name: currentUser.name,
        settings: newSettings
      });

      currentUser = updatedUser;
      console.log('Settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('שגיאה בשמירת ההגדרות. אנא נסה שוב.\nError saving settings. Please try again.');
    }
  }
  window.saveSettings = saveSettings;

  /**
   * Load and display user's posts
   */
  async function loadMyPosts() {
    // If currentUser is not loaded yet, wait for it
    if (!currentUser) {
      const phone = localStorage.getItem('userPhone');
      if (phone) {
        try {
          currentUser = await window.DB.getUserByPhone(phone);
        } catch (error) {
          console.error('Error loading user for posts:', error);
          return;
        }
      } else {
        return;
      }
    }

    try {
      const posts = await window.DB.getPostsByAuthor(currentUser.phone);
      const deletedPosts = await window.DB.getDeletedPosts();

      // Filter out deleted posts
      const activePosts = posts.filter(p => !deletedPosts.includes(p.unique_id));

      const container = document.getElementById('my-posts-list');
      if (!container) return;

      if (activePosts.length === 0) {
        container.innerHTML = '<div class="petition-card"><div class="bubble">אין פוסטים עדיין</div></div>';
        return;
      }

      container.innerHTML = '';

      activePosts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'petition-card';
        card.style.cursor = 'pointer';

        const typeEmoji = {
          petition: '✔️',
          referendum: '👍',
          survey: '📊',
          idea: '💡'
        }[post.post_type] || '📄';

        const typeText = {
          petition: 'עצומה',
          referendum: 'משאל',
          survey: 'סקר',
          idea: 'רעיון'
        }[post.post_type] || 'פוסט';

        card.innerHTML = `
          <div class="petition-title">${typeEmoji} ${post.title}</div>
          <div class="petition-date">${new Date(post.created_timestamp).toLocaleDateString('he-IL')}</div>
          <div class="bubble">${typeText}</div>
          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button onclick="viewPost('${post.post_type}', '${post.unique_id}')" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #008080; background: #fff; color: #008080; cursor: pointer;">צפה</button>
            <button onclick="deleteMyPost('${post.unique_id}')" style="padding: 8px 16px; border-radius: 6px; border: 1px solid #f44336; background: #fff; color: #f44336; cursor: pointer;">מחק</button>
          </div>
        `;

        container.appendChild(card);
      });
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }

  /**
   * View a post (navigate to its section)
   */
  function viewPost(postType, postId) {
    const sectionMap = {
      petition: 'petitions',
      referendum: 'referendums',
      survey: 'surveys',
      idea: 'ideas'
    };

    const section = sectionMap[postType];
    if (section) {
      location.hash = section;
      // Scroll to the post if possible (implementation depends on cards.js)
    }
  }
  window.viewPost = viewPost;

  /**
   * Delete user's post
   */
  async function deleteMyPost(postId) {
    if (!currentUser) return;

    if (!confirm('האם אתה בטוח שברצונך למחוק את הפוסט?\nAre you sure you want to delete this post?')) {
      return;
    }

    try {
      await window.DB.deletePost(postId, currentUser.phone);
      alert('הפוסט נמחק בהצלחה!\nPost deleted successfully!');
      loadMyPosts(); // Reload the list
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('שגיאה במחיקת הפוסט. אנא נסה שוב.\nError deleting post. Please try again.');
    }
  }
  window.deleteMyPost = deleteMyPost;

  /**
   * Load and display user's engagements
   */
  async function loadMyEngagements() {
    // If currentUser is not loaded yet, wait for it
    if (!currentUser) {
      const phone = localStorage.getItem('userPhone');
      if (phone) {
        try {
          currentUser = await window.DB.getUserByPhone(phone);
        } catch (error) {
          console.error('Error loading user for engagements:', error);
          return;
        }
      } else {
        return;
      }
    }

    try {
      const engagements = await window.DB.getEngagementsByUser(currentUser.phone);
      const container = document.getElementById('my-engagements-list');
      if (!container) return;

      if (engagements.length === 0) {
        container.innerHTML = '<div class="petition-card"><div class="bubble">אין פעילויות עדיין</div></div>';
        return;
      }

      container.innerHTML = '';

      // Group engagements by post
      const grouped = {};
      engagements.forEach(eng => {
        if (!grouped[eng.post_id]) {
          grouped[eng.post_id] = [];
        }
        grouped[eng.post_id].push(eng);
      });

      // Display each engagement
      Object.keys(grouped).forEach(postId => {
        const postEngagements = grouped[postId];

        postEngagements.forEach(eng => {
          const card = document.createElement('div');
          card.className = 'petition-card';
          card.style.cursor = 'pointer';

          const typeEmoji = {
            signature: '✍️',
            vote: '🗳️',
            support: '🤝',
            comment: '💬'
          }[eng.engagement_type] || '📝';

          const typeText = {
            signature: 'חתימה',
            vote: eng.value === 'pro' ? 'הצבעה בעד' : 'הצבעה נגד',
            support: 'תמיכה',
            comment: 'תגובה'
          }[eng.engagement_type] || 'פעילות';

          let contentHTML = '';
          if (eng.text) {
            contentHTML = `<div class="bubble" style="margin-top: 10px;">${eng.text}</div>`;
          }

          card.innerHTML = `
            <div class="petition-title">${typeEmoji} ${typeText}</div>
            <div class="petition-date">${new Date(eng.created_timestamp).toLocaleDateString('he-IL')}</div>
            ${contentHTML}
            <div style="margin-top: 10px;">
              <button onclick="viewEngagementPost('${eng.post_id}')" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #008080; background: #fff; color: #008080; cursor: pointer;">צפה בפוסט</button>
            </div>
          `;

          container.appendChild(card);
        });
      });
    } catch (error) {
      console.error('Error loading engagements:', error);
    }
  }

  /**
   * View post from engagement (find which section it belongs to)
   */
  async function viewEngagementPost(postId) {
    // We need to find which type of post this is
    // Try each type until we find it
    const types = ['petition', 'referendum', 'survey', 'idea'];

    for (const type of types) {
      try {
        const posts = await window.DB.getPostsByType(type);
        const post = posts.find(p => p.unique_id === postId);

        if (post) {
          viewPost(type, postId);
          return;
        }
      } catch (error) {
        console.error(`Error checking ${type}:`, error);
      }
    }

    alert('לא ניתן למצוא את הפוסט\nPost not found');
  }
  window.viewEngagementPost = viewEngagementPost;

  /**
   * Handle logout
   */
  function handleLogout() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
      localStorage.removeItem('userPhone');
      const savedUrl = localStorage.getItem('savedUrl');
      if (savedUrl) {
        window.location.replace(savedUrl);
      } else {
        window.location.replace('about:blank');
      }
    }
  }

  /**
   * Get current user data
   */
  function getCurrentUser() {
    return currentUser;
  }

  /**
   * Router handler for profile/settings/posts/engagements sections
   */
  function handleSectionRoute(hash) {
    if (hash === '#profile') {
      updateProfileUI();
    } else if (hash === '#settings') {
      updateSettingsUI();
    } else if (hash === '#my-posts') {
      loadMyPosts();
    } else if (hash === '#my-engagements') {
      loadMyEngagements();
    } else if (hash === '#logout') {
      handleLogout();
    }
  }

  // Initialize on page load
  window.addEventListener('load', async () => {
    await initUser();

    // Handle hash changes
    window.addEventListener('hashchange', () => {
      handleSectionRoute(location.hash);
    });

    // Handle initial hash
    handleSectionRoute(location.hash);
  });

  // Export API
  window.UserData = {
    getCurrentUser,
    initUser,
    loadMyPosts,
    loadMyEngagements,
    updateProfileUI,
    updateSettingsUI
  };

})();
