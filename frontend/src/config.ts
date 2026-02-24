// Base URL do backend. Em desenvolvimento, se você não configurar o `.env` do frontend,
// usamos um fallback que bate com a porta padrão do backend neste repo (PORT=5000).
//
// Em produção, você deve configurar VITE_API_BASE_URL (ou servir o frontend pelo backend,
// caso em que pode deixar vazio e usar caminhos relativos).
const rawEnvBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
const envBaseUrl = rawEnvBaseUrl?.trim().replace(/\/+$/, '') || undefined

export const API_BASE_URL = import.meta.env.DEV
  ? (envBaseUrl ?? 'http://localhost:5000')
  : (envBaseUrl ?? '')
