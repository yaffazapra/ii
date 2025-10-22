/* post-interactions.js - User-tracked Post Interactions */
(function() {
  'use strict';

  /**
   * Override the global signPetition function to track engagements
   */
  const originalSignPetition = window.signPetition;
  window.signPetition = async function(btn) {
    const card = btn && btn.closest && btn.closest('.petition-card');
    if (!card) return;

    const user = window.UserData ? window.UserData.getCurrentUser() : null;
    if (!user) {
      alert('נא להתחבר כדי לחתום על עצומה\nPlease log in to sign petition');
      return;
    }

    const postId = card.dataset.postId;
    if (!postId) {
      console.warn('No postId found on petition card');
      return;
    }

    try {
      // Check if user already signed
      const existing = await window.DB.getUserEngagement(user.phone, postId, 'signature');
      if (existing) {
        alert('כבר חתמת על עצומה זו\nYou already signed this petition');
        return;
      }

      // Create engagement in database
      await window.DB.createEngagement('signature', user.phone, postId, {});

      // Call original function to update UI
      if (originalSignPetition) {
        originalSignPetition.call(this, btn);
      }
    } catch (error) {
      console.error('Error signing petition:', error);
      alert('שגיאה בחתימה על העצומה\nError signing petition');
    }
  };

  /**
   * Override the global voteReferendum function to track engagements
   */
  const originalVoteReferendum = window.voteReferendum;
  window.voteReferendum = async function(btn, type) {
    const card = btn && btn.closest && btn.closest('.referendum-card');
    if (!card) return;

    const user = window.UserData ? window.UserData.getCurrentUser() : null;
    if (!user) {
      alert('נא להתחבר כדי להצביע\nPlease log in to vote');
      return;
    }

    const postId = card.dataset.postId;
    if (!postId) {
      console.warn('No postId found on referendum card');
      return;
    }

    try {
      // Check if user already voted
      const existing = await window.DB.getUserEngagement(user.phone, postId, 'vote');
      if (existing) {
        alert('כבר הצבעת במשאל זה\nYou already voted in this referendum');
        return;
      }

      // Create engagement in database
      await window.DB.createEngagement('vote', user.phone, postId, { value: type });

      // Call original function to update UI
      if (originalVoteReferendum) {
        originalVoteReferendum.call(this, btn, type);
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('שגיאה בהצבעה\nError voting');
    }
  };

  /**
   * Support an idea (similar to petition signature)
   */
  window.supportIdea = async function(btn) {
    const card = btn && btn.closest && btn.closest('.idea-card');
    if (!card) return;

    const user = window.UserData ? window.UserData.getCurrentUser() : null;
    if (!user) {
      alert('נא להתחבר כדי לתמוך ברעיון\nPlease log in to support idea');
      return;
    }

    const postId = card.dataset.postId;
    if (!postId) {
      console.warn('No postId found on idea card');
      return;
    }

    try {
      // Check if user already supported
      const existing = await window.DB.getUserEngagement(user.phone, postId, 'support');
      if (existing) {
        alert('כבר תמכת ברעיון זה\nYou already supported this idea');
        return;
      }

      // Create engagement in database
      await window.DB.createEngagement('support', user.phone, postId, {});

      // Update UI (similar to petition)
      const progressEl = card.querySelector('.progress-fill.pro');
      const progressTextEl = card.querySelector('.idea-progress-text');
      let current = 0;
      if (progressEl && progressEl.style && progressEl.style.width) {
        current = parseInt(progressEl.style.width, 10) || 0;
      }
      if (current < 100) {
        current = Math.min(100, current + 10);
        if (progressEl) progressEl.style.width = current + '%';
        if (progressTextEl) progressTextEl.innerText = current + '%';
      }
    } catch (error) {
      console.error('Error supporting idea:', error);
      alert('שגיאה בתמיכה ברעיון\nError supporting idea');
    }
  };

  /**
   * Override the global addComment function to track engagements
   */
  const originalAddComment = window.addComment;
  window.addComment = async function(btn) {
    const card = btn && btn.closest && (
      btn.closest('.petition-card') ||
      btn.closest('.referendum-card') ||
      btn.closest('.survey-card') ||
      btn.closest('.idea-card')
    );
    if (!card) return;

    const user = window.UserData ? window.UserData.getCurrentUser() : null;
    if (!user) {
      alert('נא להתחבר כדי להגיב\nPlease log in to comment');
      return;
    }

    const postId = card.dataset.postId;
    if (!postId) {
      console.warn('No postId found on card');
      return;
    }

    const commentForm = card.querySelector('.comment-form');
    const commentInput = commentForm ? commentForm.querySelector('.comment-input') : null;
    if (!commentInput) return;

    const commentText = commentInput.value.trim();
    if (!commentText) return;

    try {
      // Create engagement in database
      await window.DB.createEngagement('comment', user.phone, postId, { text: commentText });

      // Call original function to update UI or add to UI manually
      if (originalAddComment) {
        originalAddComment.call(this, btn);
      } else {
        // Manually add comment to UI
        const commentsList = card.querySelector('.comments-list');
        if (commentsList) {
          const commentDiv = document.createElement('div');
          commentDiv.className = 'comment';
          commentDiv.innerHTML = `
            <strong>${user.name || 'משתמש'}</strong>
            <p>${commentText}</p>
          `;
          commentsList.appendChild(commentDiv);
          commentInput.value = '';
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('שגיאה בהוספת תגובה\nError adding comment');
    }
  };

  /**
   * Vote on survey option
   */
  window.voteSurvey = async function(btn, optionIndex) {
    const card = btn && btn.closest && btn.closest('.survey-card');
    if (!card) return;

    const user = window.UserData ? window.UserData.getCurrentUser() : null;
    if (!user) {
      alert('נא להתחבר כדי להצביע\nPlease log in to vote');
      return;
    }

    const postId = card.dataset.postId;
    if (!postId) {
      console.warn('No postId found on survey card');
      return;
    }

    try {
      // Check if user already voted
      const existing = await window.DB.getUserEngagement(user.phone, postId, 'vote');
      if (existing) {
        alert('כבר הצבעת בסקר זה\nYou already voted in this survey');
        return;
      }

      // Create engagement in database
      await window.DB.createEngagement('vote', user.phone, postId, { value: optionIndex });

      // Update UI - increment vote count for this option
      // This depends on how survey votes are displayed in cards.js
      alert('ההצבעה נשמרה בהצלחה!\nVote saved successfully!');
    } catch (error) {
      console.error('Error voting on survey:', error);
      alert('שגיאה בהצבעה\nError voting');
    }
  };

  /**
   * Load post data with user engagements
   */
  async function loadPostsWithEngagements(type) {
    try {
      const posts = await window.DB.getPostsByType(type);
      const deletedPosts = await window.DB.getDeletedPosts();

      // Filter out deleted posts
      const activePosts = posts.filter(p => !deletedPosts.includes(p.unique_id));

      // For each post, get its engagements
      for (const post of activePosts) {
        const engagements = await window.DB.getEngagementsByPost(post.unique_id);

        // Calculate stats based on engagement type
        if (type === 'petition') {
          const signatures = engagements.filter(e => e.engagement_type === 'signature');
          post.progress = Math.min(100, signatures.length * 10); // Simple calculation
        } else if (type === 'referendum') {
          const votes = engagements.filter(e => e.engagement_type === 'vote');
          const proVotes = votes.filter(v => v.value === 'pro').length;
          const conVotes = votes.filter(v => v.value === 'con').length;
          post.proVotes = proVotes;
          post.conVotes = conVotes;
        } else if (type === 'idea') {
          const supports = engagements.filter(e => e.engagement_type === 'support');
          post.progress = Math.min(100, supports.length * 10);
        } else if (type === 'survey') {
          const votes = engagements.filter(e => e.engagement_type === 'vote');
          post.votes = votes;
        }

        // Get comments
        const comments = engagements.filter(e => e.engagement_type === 'comment');
        post.comments = comments;
      }

      return activePosts;
    } catch (error) {
      console.error('Error loading posts with engagements:', error);
      return [];
    }
  }

  /**
   * Initialize posts data for cards.js
   */
  async function initPostsData() {
    try {
      // Load petitions
      const petitions = await loadPostsWithEngagements('petition');
      window.PETITIONS_DATA = petitions.map(p => ({
        title: p.title,
        date: new Date(p.created_timestamp).toLocaleDateString('he-IL'),
        images: p.images || [],
        progress: p.progress || 0,
        postId: p.unique_id,
        comments: p.comments || []
      }));

      // Load referendums
      const referendums = await loadPostsWithEngagements('referendum');
      window.REFERENDUMS_DATA = referendums.map(r => ({
        title: r.title,
        date: new Date(r.created_timestamp).toLocaleDateString('he-IL'),
        images: r.images || [],
        proVotes: r.proVotes || 0,
        conVotes: r.conVotes || 0,
        postId: r.unique_id,
        comments: r.comments || []
      }));

      // Load surveys
      const surveys = await loadPostsWithEngagements('survey');
      window.SURVEYS_DATA = surveys.map(s => ({
        title: s.title,
        date: new Date(s.created_timestamp).toLocaleDateString('he-IL'),
        images: s.images || [],
        options: s.options || [],
        votes: s.votes || [],
        postId: s.unique_id,
        comments: s.comments || []
      }));

      // Load ideas
      const ideas = await loadPostsWithEngagements('idea');
      window.IDEAS_DATA = ideas.map(i => ({
        title: i.title,
        date: new Date(i.created_timestamp).toLocaleDateString('he-IL'),
        images: i.images || [],
        progress: i.progress || 0,
        postId: i.unique_id,
        comments: i.comments || []
      }));

      // Trigger cards.js to re-render if functions exist
      if (typeof window.initPetitionCards === 'function') {
        window.initPetitionCards();
      }
      if (typeof window.initReferendumCards === 'function') {
        window.initReferendumCards();
      }
      if (typeof window.initSurveyCards === 'function') {
        window.initSurveyCards();
      }
      if (typeof window.initIdeaCards === 'function') {
        window.initIdeaCards();
      }
    } catch (error) {
      console.error('Error initializing posts data:', error);
    }
  }

  // Export API
  window.PostInteractions = {
    loadPostsWithEngagements,
    initPostsData
  };

  // Initialize when user data is loaded
  window.addEventListener('load', () => {
    // Wait a bit for user data to load
    setTimeout(initPostsData, 1000);
  });

})();
