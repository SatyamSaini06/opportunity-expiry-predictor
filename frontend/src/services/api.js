const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
      // Auto-fallback for demo: allow read access
    }
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ detail: "Network response error" }));
      throw new Error(errData.detail || `Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  async login(email, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },

  async register(full_name, email, password) {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, email, password })
    });
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  hasToken() {
    return !!localStorage.getItem("token");
  },

  getCurrentStoredUser() {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // User Profile
  async getUserProfile() {
    return await request("/users/me");
  },

  async updateUserProfile(profileData) {
    return await request("/users/me", {
      method: "PUT",
      body: JSON.stringify(profileData)
    });
  },

  // Opportunities
  async getOpportunities(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.category && params.category !== "All") query.append("category", params.category);
    if (params.risk_level && params.risk_level !== "All") query.append("risk_level", params.risk_level);
    if (params.sort_by) query.append("sort_by", params.sort_by);
    if (params.sort_order) query.append("sort_order", params.sort_order);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    
    return await request(`/opportunities?${query.toString()}`);
  },

  async getUrgentOpportunities(limit = 4) {
    return await request(`/opportunities/urgent?limit=${limit}`);
  },

  async getRecommendedOpportunities(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== "All") query.append("category", params.category);
    if (params.min_match) query.append("min_match", params.min_match);
    return await request(`/opportunities/recommended?${query.toString()}`);
  },

  async getOpportunityById(id) {
    return await request(`/opportunities/${id}`);
  },

  async createOpportunity(oppData) {
    return await request("/opportunities", {
      method: "POST",
      body: JSON.stringify(oppData)
    });
  },

  async uploadAndExtract(formData) {
    return await request("/opportunities/upload", {
      method: "POST",
      body: formData
    });
  },

  // Analytics
  async getDashboardAnalytics() {
    return await request("/analytics/dashboard");
  },

  async getProfileMatch() {
    return await request("/analytics/profile-match");
  },

  async getRiskAnalytics() {
    return await request("/analytics/risk");
  },

  // Notifications
  async getNotifications() {
    return await request("/notifications");
  },

  async markNotificationRead(id) {
    return await request(`/notifications/${id}/read`, { method: "PATCH" });
  },

  async markAllNotificationsRead() {
    return await request("/notifications/read-all", { method: "PATCH" });
  },

  // Bookmarks
  async getBookmarks() {
    return await request("/bookmarks");
  },

  async addBookmark(id) {
    return await request(`/bookmarks/${id}`, { method: "POST" });
  },

  async removeBookmark(id) {
    return await request(`/bookmarks/${id}`, { method: "DELETE" });
  }
};
