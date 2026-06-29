/**
 * Announcement API Service
 * Centralized fetch wrapper for all announcement-related API calls.
 * Automatically includes Shopify session credentials.
 */

const BASE_URL = "/api/announcement";

/**
 * Generic fetch helper with error handling
 */
const apiFetch = async (url, options = {}) => {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    credentials: "include", // Send cookies for session auth
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
};

/**
 * Save a new announcement
 * @param {string} text - Announcement text
 */
export const saveAnnouncement = async (text) => {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
};

/**
 * Fetch paginated announcement history
 * @param {object} params - { page, limit, search }
 */
export const fetchHistory = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search && { search }),
  });

  return apiFetch(`${BASE_URL}/history?${params}`);
};

/**
 * Fetch current live announcement from Shopify metafield
 */
export const fetchCurrentAnnouncement = async () => {
  return apiFetch(`${BASE_URL}/current`);
};

/**
 * Delete (soft-delete) an announcement record
 * @param {string} id - MongoDB document ID
 */
export const deleteAnnouncementById = async (id) => {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
};

/**
 * Clear the announcement metafield from Shopify storefront
 * @param {string} metafieldId - Shopify metafield GID
 */
export const clearShopifyMetafield = async (metafieldId) => {
  return apiFetch(`${BASE_URL}/metafield/clear`, {
    method: "DELETE",
    body: JSON.stringify({ metafieldId }),
  });
};
