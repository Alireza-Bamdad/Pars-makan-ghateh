import { api } from './api';
    
// =====================
// AUTH FUNCTIONS
// =====================

// Login user
export const login = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

// Get current user info
export const me = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

// Logout user
export const logout = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};
