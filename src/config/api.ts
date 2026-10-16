import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Importante para Sanctum CSRF cookies si se usan, o CORS
});

// Interceptor para inyectar el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('enruta_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globales (ej. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('enruta_token');
      localStorage.removeItem('enruta_user');
      localStorage.removeItem('enruta_active_business');
      // Evitar redirección infinita si ya estamos en login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    if (error.response?.status === 403 && error.config?.url !== '/user') {
      window.dispatchEvent(new Event('enruta:access-denied'));
    }
    return Promise.reject(error);
  }
);

export default api;
