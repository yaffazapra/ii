/* db.js - Base44 Database API Helper */
(function() {
  'use strict';

  // Base44 API Configuration
  const BASE44_CONFIG = {
    API_URL: 'https://app.base44.com/api/apps/6812ad73a9594a183279deba/entities/DataRecord',
    API_KEY: '69315aa5aa7f4b6fa99c7a420da68bdd',
    USER_ID: 'user_jveo8b35q_1748241619184'
  };

  // Helper to generate unique IDs
  function generateUniqueId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
  }

  // Generic fetch wrapper for Base44
  async function base44Fetch(endpoint, options = {}) {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'api_key': BASE44_CONFIG.API_KEY,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return response.json();
  }

  // ==================== USER DATA ====================

  /**
   * Check if user exists by phone number
   * @param {string} phone - Phone number (e.g., "0501234567")
   * @returns {Promise<Object|null>} User data or null if not found
   */
  async function getUserByPhone(phone) {
    try {
      const url = `${BASE44_CONFIG.API_URL}?user_id=${BASE44_CONFIG.USER_ID}&payload.type=user&payload.phone=${encodeURIComponent(phone)}`;
      const records = await base44Fetch(url);

      if (records && records.length > 0) {
        return {
          id: records[0]._id,
          ...records[0].payload
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by phone:', error);
      throw error;
    }
  }

  /**
   * Create new user
   * @param {string} phone - Phone number
   * @param {string} name - User name
   * @returns {Promise<Object>} Created user data
   */
  async function createUser(phone, name) {
    try {
      const uniqueId = generateUniqueId('user');
      const userData = {
        user_id: BASE44_CONFIG.USER_ID,
        payload: {
          type: 'user',
          unique_id: uniqueId,
          phone: phone,
          name: name,
          settings: {
            notifications: true,
            language: 'he'
          }
        },
        created_timestamp: new Date().toISOString()
      };

      const response = await base44Fetch(BASE44_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      return {
        id: response._id || uniqueId,
        ...userData.payload
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user data
   * @param {string} phone - Phone number
   * @param {Object} updates - Fields to update (name, settings, etc.)
   * @returns {Promise<Object>} Updated user data
   */
  async function updateUser(phone, updates) {
    try {
      // Base44 doesn't support updates, so we create a new record
      const existingUser = await getUserByPhone(phone);
      if (!existingUser) {
        throw new Error('User not found');
      }

      const uniqueId = generateUniqueId('user');
      const userData = {
        user_id: BASE44_CONFIG.USER_ID,
        payload: {
          type: 'user',
          unique_id: uniqueId,
          phone: phone,
          name: updates.name !== undefined ? updates.name : existingUser.name,
          settings: updates.settings !== undefined ? updates.settings : existingUser.settings
        },
        created_timestamp: new Date().toISOString()
      };

      await base44Fetch(BASE44_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      return {
        id: uniqueId,
        ...userData.payload
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // ==================== POSTS ====================

  /**
   * Create a post (petition, referendum, survey, idea)
   * @param {string} type - 'petition', 'referendum', 'survey', 'idea'
   * @param {string} authorPhone - Creator's phone number
   * @param {Object} data - Post data (title, images, options, etc.)
   * @returns {Promise<Object>} Created post
   */
  async function createPost(type, authorPhone, data) {
    try {
      const uniqueId = generateUniqueId(type);
      const postData = {
        user_id: BASE44_CONFIG.USER_ID,
        payload: {
          type: 'post',
          post_type: type,
          unique_id: uniqueId,
          author_phone: authorPhone,
          title: data.title,
          images: data.images || [],
          options: data.options || [], // For surveys
          created_timestamp: new Date().toISOString()
        },
        created_timestamp: new Date().toISOString()
      };

      await base44Fetch(BASE44_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify(postData)
      });

      return {
        id: uniqueId,
        ...postData.payload
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * Get all posts of a specific type
   * @param {string} type - 'petition', 'referendum', 'survey', 'idea'
   * @returns {Promise<Array>} Array of posts
   */
  async function getPostsByType(type) {
    try {
      const url = `${BASE44_CONFIG.API_URL}?user_id=${BASE44_CONFIG.USER_ID}&payload.type=post&payload.post_type=${type}`;
      const records = await base44Fetch(url);

      return records.map(r => ({
        id: r._id,
        ...r.payload
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  /**
   * Get posts by author
   * @param {string} authorPhone - Author's phone number
   * @returns {Promise<Array>} Array of posts
   */
  async function getPostsByAuthor(authorPhone) {
    try {
      const url = `${BASE44_CONFIG.API_URL}?user_id=${BASE44_CONFIG.USER_ID}&payload.type=post&payload.author_phone=${encodeURIComponent(authorPhone)}`;
      const records = await base44Fetch(url);

      return records.map(r => ({
        id: r._id,
        ...r.payload
      }));
    } catch (error) {
      console.error('Error fetching posts by author:', error);
      return [];
    }
  }

  /**
   * Delete a post (mark as deleted)
   * @param {string} postId - Post unique_id
   * @param {string} authorPhone - Author's phone (for verification)
   * @returns {Promise<boolean>} Success status
   */
  async function deletePost(postId, authorPhone) {
    try {
      // In Base44, we can't delete, so we create a "deleted" marker record
      const deleteMarker = {
        user_id: BASE44_CONFIG.USER_ID,
        payload: {
          type: 'post_deleted',
          post_id: postId,
          deleted_by: authorPhone,
          deleted_timestamp: new Date().toISOString()
        },
        created_timestamp: new Date().toISOString()
      };

      await base44Fetch(BASE44_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify(deleteMarker)
      });

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }

  // ==================== ENGAGEMENTS ====================

  /**
   * Create an engagement (signature, vote, support, comment)
   * @param {string} type - 'signature', 'vote', 'support', 'comment'
   * @param {string} userPhone - User's phone number
   * @param {string} postId - Post unique_id
   * @param {Object} data - Engagement data (vote value, comment text, etc.)
   * @returns {Promise<Object>} Created engagement
   */
  async function createEngagement(type, userPhone, postId, data = {}) {
    try {
      const uniqueId = generateUniqueId('engagement');
      const engagementData = {
        user_id: BASE44_CONFIG.USER_ID,
        payload: {
          type: 'engagement',
          engagement_type: type,
          unique_id: uniqueId,
          user_phone: userPhone,
          post_id: postId,
          value: data.value, // 'pro'/'con' for votes, option index for surveys
          text: data.text, // For comments
          created_timestamp: new Date().toISOString()
        },
        created_timestamp: new Date().toISOString()
      };

      await base44Fetch(BASE44_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify(engagementData)
      });

      return {
        id: uniqueId,
        ...engagementData.payload
      };
    } catch (error) {
      console.error('Error creating engagement:', error);
      throw error;
    }
  }

  /**
   * Get engagements for a post
   * @param {string} postId - Post unique_id
   * @param {string} engagementType - Optional: filter by type
   * @returns {Promise<Array>} Array of engagements
   */
  async function getEngagementsByPost(postId, engagementType = null) {
    try {
      let url = `${BASE44_CONFIG.API_URL}?user_id=${BASE44_CONFIG.USER_ID}&payload.type=engagement&payload.post_id=${encodeURIComponent(postId)}`;

      if (engagementType) {
        url += `&payload.engagement_type=${engagementType}`;
      }

      const records = await base44Fetch(url);

      return records.map(r => ({
        id: r._id,
        ...r.payload
      }));
    } catch (error) {
      console.error('Error fetching engagements:', error);
      return [];
    }
  }

  /**
   * Get engagements by user
   * @param {string} userPhone - User's phone number
   * @returns {Promise<Array>} Array of engagements
   */
  async function getEngagementsByUser(userPhone) {
    try {
      const url = `${BASE44_CONFIG.API_URL}?user_id=${BASE44_CONFIG.USER_ID}&payload.type=engagement&payload.user_phone=${encodeURIComponent(userPhone)}`;
      const records = await base44Fetch(url);

      return records.map(r => ({
        id: r._id,
        ...r.payload
      }));
    } catch (error) {
      console.error('Error fetching engagements by user:', error);
      return [];
    }
  }

  /**
   * Check if user has already engaged with a post
   * @param {string} userPhone - User's phone number
   * @param {string} postId - Post unique_id
   * @param {string} engagementType - Type to check ('signature', 'vote', 'support')
   * @returns {Promise<Object|null>} Existing engagement or null
   */
  async function getUserEngagement(userPhone, postId, engagementType) {
    try {
      const url = `${BASE44_CONFIG.API_URL}?user_id=${BASE44_CONFIG.USER_ID}&payload.type=engagement&payload.user_phone=${encodeURIComponent(userPhone)}&payload.post_id=${encodeURIComponent(postId)}&payload.engagement_type=${engagementType}`;
      const records = await base44Fetch(url);

      if (records && records.length > 0) {
        return {
          id: records[0]._id,
          ...records[0].payload
        };
      }
      return null;
    } catch (error) {
      console.error('Error checking user engagement:', error);
      return null;
    }
  }

  /**
   * Get deleted posts list
   * @returns {Promise<Array>} Array of deleted post IDs
   */
  async function getDeletedPosts() {
    try {
      const url = `${BASE44_CONFIG.API_URL}?user_id=${BASE44_CONFIG.USER_ID}&payload.type=post_deleted`;
      const records = await base44Fetch(url);

      return records.map(r => r.payload.post_id);
    } catch (error) {
      console.error('Error fetching deleted posts:', error);
      return [];
    }
  }

  // Export API
  window.DB = {
    // User functions
    getUserByPhone,
    createUser,
    updateUser,

    // Post functions
    createPost,
    getPostsByType,
    getPostsByAuthor,
    deletePost,
    getDeletedPosts,

    // Engagement functions
    createEngagement,
    getEngagementsByPost,
    getEngagementsByUser,
    getUserEngagement,

    // Utilities
    generateUniqueId
  };

})();
