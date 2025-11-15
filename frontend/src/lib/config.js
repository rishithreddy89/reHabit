// Centralized configuration for Vite environment variables
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';
export const API = `${BACKEND_URL}/api`;
