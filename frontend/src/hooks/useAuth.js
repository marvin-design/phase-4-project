import { useState, useEffect } from "react";
import api, { tokenManager } from "../services/api";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authData, setAuthData] = useState({ email: "", password: "" });
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize authentication state on mount
  useEffect(() => {
    const token = tokenManager.getToken();
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      tokenManager.initializeToken();
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Setup axios interceptor for automatic logout on token expiry
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!authData.email || !authData.password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/login", {
        email: authData.email,
        password: authData.password,
      });

      const { access_token, user } = response.data;

      // Store credentials and update auth state
      tokenManager.setToken(access_token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Login failed";
      setError(errorMessage);
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!authData.email || !authData.password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      // Register new user
      await api.post("/register", {
        email: authData.email,
        password: authData.password,
      });

      // Auto-login after successful registration
      setError(null);
      setIsRegisterMode(false);

      const loginResponse = await api.post("/login", {
        email: authData.email,
        password: authData.password,
      });

      const { access_token, user } = loginResponse.data;

      tokenManager.setToken(access_token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      if (err.response?.status === 409) {
        // Email already exists - guide user to login
        setError(
          `This email is already registered. Would you like to login instead?`
        );
        setTimeout(() => {
          setIsRegisterMode(false);
          setError("Please enter your password to login.");
        }, 2000);
      } else if (err.response?.status === 400) {
        setError(
          err.response.data.error ||
            "Please check your email and password format"
        );
      } else {
        const errorMessage =
          err.response?.data?.error || "Registration failed. Please try again.";
        setError(errorMessage);
      }
    }

    setLoading(false);
  };

  const handleLogout = () => {
    tokenManager.removeToken();
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setAuthData({ email: "", password: "" });
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError(null);
    setAuthData({ email: "", password: "" });
  };

  return {
    isAuthenticated,
    user,
    authData,
    setAuthData,
    isRegisterMode,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
    toggleMode,
  };
};
