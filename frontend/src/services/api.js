import axios from "axios";

// Environment-based API URL configuration
const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api"
    : process.env.REACT_APP_API_URL;

// Fail fast in production if API URL is missing
if (process.env.NODE_ENV === "production" && !API_BASE_URL) {
  throw new Error(
    "REACT_APP_API_URL environment variable is required in production"
  );
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT token management utilities
export const tokenManager = {
  getToken: () => localStorage.getItem("access_token"),
  setToken: (token) => {
    localStorage.setItem("access_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },
  removeToken: () => {
    localStorage.removeItem("access_token");
    delete api.defaults.headers.common["Authorization"];
  },
  initializeToken: () => {
    const token = tokenManager.getToken();
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },
};

export { API_BASE_URL };
export default api;
