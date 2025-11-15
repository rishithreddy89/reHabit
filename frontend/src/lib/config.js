// central API / socket config used by frontend components
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';
export const API = `${BACKEND_URL.replace(/\/$/, '')}/api`;
export const SOCKET_URL = BACKEND_URL.replace(/\/$/, '');
export default { API, SOCKET_URL };
