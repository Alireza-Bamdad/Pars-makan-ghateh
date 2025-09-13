import axios from "axios";


export const api = axios.create({
  baseURL:"http://localhost:3001/api", 
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});



api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

