// API base URL — override via VITE_API_BASE_URL in .env
export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000";

export const WS_URL = API_BASE.replace(/^http/, "ws") + "/ws";
