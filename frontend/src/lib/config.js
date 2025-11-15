// Centralized configuration for Vite environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000';
export const API = `${BACKEND_URL}/api`;
