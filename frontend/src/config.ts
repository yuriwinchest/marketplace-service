
const envBaseUrl = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL = import.meta.env.DEV
  ? (envBaseUrl ?? 'http://localhost:5000')
  : (envBaseUrl ?? '')
