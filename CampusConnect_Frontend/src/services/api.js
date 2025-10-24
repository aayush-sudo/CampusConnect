import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/signup', userData),
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/me'),
  updateProfile: (userData) => api.put('/profile', userData),
};

// Posts API
export const postsAPI = {
  getAllPosts: (params = {}) => api.get('/posts', { params }),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  createPost: (postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach(key => {
      if (postData[key] !== null && postData[key] !== undefined) {
        formData.append(key, postData[key]);
      }
    });
    return api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  likePost: (postId, userId) => api.post(`/posts/${postId}/like`, { userId }),
  downloadPost: (postId) => api.post(`/posts/${postId}/download`),
  viewPost: (postId) => api.post(`/posts/${postId}/view`),
};

// Requests API
export const requestsAPI = {
  getAllRequests: (params = {}) => api.get('/requests', { params }),
  getUserRequests: (userId) => api.get(`/requests/user/${userId}`),
  createRequest: (requestData) => api.post('/requests', requestData),
  respondToRequest: (requestId, responseData) => api.post(`/requests/${requestId}/respond`, responseData),
  updateRequestStatus: (requestId, status) => api.patch(`/requests/${requestId}/status`, { status }),
  getRequestResponses: (requestId) => api.get(`/requests/${requestId}/responses`),
};

// Chats API
export const chatsAPI = {
  getUserChats: (userId) => api.get(`/chats/user/${userId}`),
  getChat: (chatId) => api.get(`/chats/${chatId}`),
  createChat: (chatData) => api.post('/chats', chatData),
  sendMessage: (chatId, messageData) => api.post(`/chats/${chatId}/messages`, messageData),
  addParticipant: (chatId, participantData) => api.post(`/chats/${chatId}/participants`, participantData),
  getChatMessages: (chatId, params = {}) => api.get(`/chats/${chatId}/messages`, { params }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentRequests: (limit = 10) => api.get('/requests', { params: { limit } }),
  getRecentPosts: (limit = 10) => api.get('/posts', { params: { limit } }),
};

export default api;
